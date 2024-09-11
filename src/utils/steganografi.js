import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';

// Buffer'ı global olarak tanımlıyoruz.
global.Buffer = Buffer;

/**
 * Mesajı görüntüye gömer ve yeni bir URI döner.
 * @param {string} imageUri - Gömme yapılacak görselin URI'si.
 * @param {string} message - Gömülecek mesaj.
 * @returns {Promise<string>} - Yeni görüntünün URI'si.
 */
export async function encodeMessageInImage(imageUri, message) {
  try {
    // Görüntüyü Base64 formatında oku
    const imageBase64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log('Image Base64 (First 400): ', imageBase64.substring(0, 400));
   
    // Görüntü verisini Base64'ten buffer'a çevir
    const imageData = Buffer.from(imageBase64, 'base64');
    
    // Mesajı binary (ikili) sistemde temsil et ve null karakteri ekle
    const messageBinary = message
      .split('')
      .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
      .join('') + '00000000'; // Mesajın sonuna null karakter ekleniyor

    console.log('Message Binary: ', messageBinary);

    // Görüntü formatını belirle (PNG/JPEG)
    const isJPEG = imageUri.toLowerCase().endsWith('.jpg') || imageUri.toLowerCase().endsWith('.jpeg');
    const isPNG = imageUri.toLowerCase().endsWith('.png');

    // Başlık boyutu hesaplaması: JPEG için 54 byte, PNG için dinamik hesaplama
    const headerSize = isJPEG ? 54 : (isPNG ? getPngHeaderSize(imageData) : 0);

    // Mesaj boyutunu kontrol et (3 renk kanalı: RGB)
    const maxMessageSize = (imageData.length - headerSize) * 3 / 8;
    if (message.length > maxMessageSize) {
      throw new Error('Mesaj, seçilen görselin piksellerine sığmıyor.');
    }

    let messageIndex = 0;

    // Mesajı görüntüye gömme işlemi
    for (let i = headerSize; i < imageData.length && messageIndex < messageBinary.length; i++) {
      if (isPNG && i % 4 !== 3) { // Alpha kanalını atla (PNG için)
        console.log(`Modifying byte at index ${i} - Original: ${imageData[i]}, New LSB: ${messageBinary[messageIndex]}`);
        imageData[i] = (imageData[i] & 0xFE) | parseInt(messageBinary[messageIndex], 2);
        messageIndex++;
      } else if (isJPEG) { // Alpha kanalı yok, JPEG'te byte'ları modifiye et
        console.log(`Modifying byte at index ${i} - Original: ${imageData[i]}, New LSB: ${messageBinary[messageIndex]}`);
        imageData[i] = (imageData[i] & 0xFE) | parseInt(messageBinary[messageIndex], 2);
        messageIndex++;
      }
    }

    // Şifrelenmiş görüntüyü tekrar Base64'e çevir
    const encodedBase64 = imageData.toString('base64');
    console.log('Encoded Base64 (First 400): ', encodedBase64.substring(0, 400));

    // Yeni şifrelenmiş görseli kaydet
    const encodedImageUri = FileSystem.documentDirectory + `encoded_image_${Date.now()}.jpg`;
    await FileSystem.writeAsStringAsync(encodedImageUri, encodedBase64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Kaydedilen dosyanın varlığını kontrol et
    const fileInfo = await FileSystem.getInfoAsync(encodedImageUri);
    if (!fileInfo.exists || fileInfo.size === 0) {
      throw new Error('Görsel kaydedilemedi veya boş bir dosya olarak kaydedildi.');
    }

    return encodedImageUri;
  } catch (error) {
    throw new Error(`Mesaj gömme işlemi başarısız oldu: ${error.message}`);
  }
}

/**
 * Görüntüden gömülmüş mesajı çözer.
 * @param {string} imageUri - Mesajın çözüleceği görselin URI'si.
 * @returns {Promise<string>} - Çözülen mesaj.
 */
export async function decodeMessageFromImage(imageUri) {
  try {
    // Görüntüyü Base64 formatında oku
    const encodedImage = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Base64 verisini byte dizisine çevir
    const imageData = Buffer.from(encodedImage, 'base64');
    let messageBinary = '';

    // Başlık boyutunu belirle
    const isJPEG = imageUri.toLowerCase().endsWith('.jpg') || imageUri.toLowerCase().endsWith('.jpeg');
    const isPNG = imageUri.toLowerCase().endsWith('.png');
    const headerSize = isJPEG ? 54 : (isPNG ? getPngHeaderSize(imageData) : 0);

    // Mesajın binary (ikili) verisini çöz
    for (let i = headerSize; i < imageData.length; i++) {
      if (isPNG && i % 4 !== 3) { // PNG'de alpha kanalını atla
        messageBinary += (imageData[i] & 1).toString(); // LSB'yi al
      } else if (isJPEG) {
        messageBinary += (imageData[i] & 1).toString();
      }

      // Null terminatörü kontrol et ve işlem durdur
      if (messageBinary.endsWith('00000000')) {
        break;
      }
    }

    // Null terminatörü çıkart
    messageBinary = messageBinary.slice(0, messageBinary.length - 8);

    // Binary veriyi 8 bitlik bloklara çevir ve karaktere dönüştür
    let message = '';
    for (let i = 0; i < messageBinary.length; i += 8) {
      const byte = messageBinary.slice(i, i + 8);
      const charCode = parseInt(byte, 2);
      message += String.fromCharCode(charCode);
    }

    if (!message) {
      throw new Error('Bu görselde çözümlenebilecek bir mesaj bulunamadı.');
    }

    return message;
  } catch (error) {
    throw new Error(`Mesaj çözme işlemi başarısız oldu: ${error.message}`);
  }
}

/**
 * PNG görüntüler için dinamik başlık boyutunu hesaplar.
 * @param {Buffer} imageData - Görüntü verisi (buffer formatında).
 * @returns {number} - PNG başlık boyutu.
 */
function getPngHeaderSize(imageData) {
  const PNG_SIGNATURE_SIZE = 8;
  let offset = PNG_SIGNATURE_SIZE;

  while (offset < imageData.length) {
    const chunkLength = imageData.readUInt32BE(offset);
    offset += 4;
    const chunkType = imageData.toString('utf-8', offset, offset + 4);
    offset += 4;
    offset += chunkLength + 4; // chunkLength kadar veri ve 4 byte CRC

    // IDAT chunk'ına ulaştık, bu chunk'tan sonrası görüntü verisidir
    if (chunkType === 'IDAT') {
      break;
    }
  }
  return offset;
}

