import * as ImageManipulator from 'expo-image-manipulator';
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
    // Görüntüyü Base64 formatında dosya sisteminden oku
    const imageBase64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
   
    const imageData = Buffer.from(imageBase64, 'base64');
    
    // Mesajı ikili sistemde temsil et ve sonuna null karakteri (00000000) ekle
    const messageBinary = message
      .split('')
      .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
      .join('') + '00000000'; // Mesajın sonuna null karakter ekleme

    const maxMessageSize = (imageData.length - headerSize) * 3 / 8; // 3 renk kanalı var (RGB)
    if (message.length > maxMessageSize) {
      throw new Error('Mesaj, seçilen görselin piksellerine sığmıyor.');
    }
      
    let messageIndex = 0;
    // Dosya formatını belirleme (örneğin, imageUri'den)
    const isJPEG = imageUri.toLowerCase().endsWith('.jpg') || imageUri.toLowerCase().endsWith('.jpeg');
    const isPNG = imageUri.toLowerCase().endsWith('.png');

    // Eğer JPEG ise, 54 byte'lık başlığı atlıyoruz
    const headerSize = isJPEG ? 54 : (isPNG ? 8 : 0); // PNG başlık boyutu 8 byte olabilir
    // JPEG dosyasında başlık verisi (tipik olarak 54 byte)
    for (let i = headerSize; i < imageData.length && messageIndex < messageBinary.length; i++) {
      if (i % 4 !== 3) { // Alpha kanalını atlıyoruz
        imageData[i] = (imageData[i] & 0xFE) | parseInt(messageBinary[messageIndex], 2);
        messageIndex++;
      }
    }
    // Şifrelenmiş görüntüyü tekrar Base64'e çevir
    const encodedBase64 = imageData.toString('base64');

    // encodedImageUri'yi önce tanımlıyoruz
    const encodedImageUri = FileSystem.documentDirectory + `encoded_image_${Date.now()}.jpg`;

    // Yeni görüntüyü dosya sistemine yaz
    await FileSystem.writeAsStringAsync(encodedImageUri, encodedBase64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Görüntü dosyasının doğru kaydedildiğinden emin ol
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

    // Base64'ü byte dizisine çevir
    const imageData = Buffer.from(encodedImage, 'base64');
    let messageBinary = '';

    const headerSize = 54; // JPEG dosyalarında tipik başlık boyutu (ilk 54 byte)

    // Başlık kısmını atlayarak LSB'lerden veriyi geri al
    for (let i = headerSize; i < imageData.length; i++) {
      if (i % 4 !== 3) { // Alpha kanalını atla (her 4. byte alpha kanalıdır)
        messageBinary += (imageData[i] & 1).toString(); // LSB'yi al
      }
    }

    // 8 bitlik blokları karakterlere çevir
    let message = '';
    for (let i = 0; i < messageBinary.length; i += 8) {
      const byte = messageBinary.slice(i, i + 8); // 8 bitlik bir blok al
      const charCode = parseInt(byte, 2); // İkilik sistemden karakter koduna çevir
      if (charCode === 0) break; // Null karakter bulunduğunda dur (mesajın sonu)
      message += String.fromCharCode(charCode); // Karakteri mesaja ekle
    }

    if (!message) {
      throw new Error('Bu görselde çözümlenebilecek bir mesaj bulunamadı.');
    }

    return message; // Mesajı geri döndür
  } catch (error) {
    throw new Error(`Mesaj çözme işlemi başarısız oldu: ${error.message}`);
  }
}

