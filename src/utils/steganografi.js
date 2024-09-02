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

    const messageBinary = message
      .split('')
      .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
      .join('') + '00000000'; // Mesaj sonuna null karakter ekleme

    const availableBits = imageData.length * 8;
    if (messageBinary.length > availableBits) {
      throw new Error('Mesaj, seçilen görselin piksellerine sığmıyor.');
    }

    let messageIndex = 0;
    for (let i = 0; i < imageData.length && messageIndex < messageBinary.length; i++) {
      if (i % 4 !== 3) { // Alpha kanalını atla
        imageData[i] = (imageData[i] & 0xFE) | parseInt(messageBinary[messageIndex], 2);
        messageIndex++;
      }
    }

    const encodedBase64 = imageData.toString('base64');
    const encodedImageUri = FileSystem.documentDirectory + `encoded_image_${Date.now()}.png`;

    await FileSystem.writeAsStringAsync(encodedImageUri, encodedBase64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const fileInfo = await FileSystem.getInfoAsync(encodedImageUri);
    console.log('File Info:', fileInfo);

    if (!fileInfo.exists || fileInfo.size === 0) {
      throw new Error('Görsel kaydedilemedi veya boş bir dosya olarak kaydedildi.');
    }

    return encodedImageUri;
  } catch (error) {
    console.error('Encode hatası:', error.message);
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
    const encodedImage = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const imageData = Buffer.from(encodedImage, 'base64');
    let messageBinary = '';

    for (let i = 0; i < imageData.length; i++) {
      if (i % 4 !== 3) { // Alpha kanalını atla
        messageBinary += (imageData[i] & 1).toString();
      }
    }

    let message = '';
    for (let i = 0; i < messageBinary.length; i += 8) {
      const byte = messageBinary.slice(i, i + 8);
      const charCode = parseInt(byte, 2);
      if (charCode === 0) break; // Null karaktere ulaşıldığında dur
      message += String.fromCharCode(charCode);
    }

    if (!message) {
      throw new Error('Bu görselde çözümlenebilecek bir mesaj bulunamadı.');
    }

    return message;
  } catch (error) {
    console.error('Decode hatası:', error.message);
    throw new Error(`Mesaj çözme işlemi başarısız oldu: ${error.message}`);
  }
}
