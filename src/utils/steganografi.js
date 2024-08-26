import jpeg from 'jpeg-js';

export function embedMessage(imageData, message) {
    const decodedImage = jpeg.decode(imageData);
    const imageBuffer = decodedImage.data;
    const binaryMessage = toBinary(message) + '1111111111111110';

    let messageIndex = 0;

    for (let i = 0; i < imageBuffer.length; i += 4) {
        if (messageIndex < binaryMessage.length) {
            imageBuffer[i] = (imageBuffer[i] & 0xFE) | parseInt(binaryMessage[messageIndex], 2);
            messageIndex++;
        } else {
            break;
        }
    }

    return jpeg.encode(decodedImage); // Yeniden encode edilmiş görüntüyü döner
}

// Mesajı görüntüden çıkarma (Extracting)
export function extractMessage(imageData) {
    const decodedImage = jpeg.decode(imageData);
    const imageBuffer = decodedImage.data;
    let binaryMessage = '';

    for (let i = 0; i < imageBuffer.length; i += 4) {
        binaryMessage += (imageBuffer[i] & 1).toString();
    }

    const byteChars = [];
    for (let i = 0; i < binaryMessage.length; i += 8) {
        const byte = binaryMessage.slice(i, i + 8);
        if (byte === '11111111') break;
        byteChars.push(String.fromCharCode(parseInt(byte, 2)));
    }

    return byteChars.join('');
}

function toBinary(message) {
    return message.split('').map(char => {
        return char.charCodeAt(0).toString(2).padStart(8, '0');
    }).join('');
}

