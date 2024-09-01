import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Button from '../components/Button';
import { decodeMessageFromImage } from '../utils/steganografi';

export default function DecodeScreen() {
  const [imageUri, setImageUri] = useState(null);
  const [decodedMessage, setDecodedMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // Hata mesajı için state ekledim

  // Görsel seçme fonksiyonu
  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
      setDecodedMessage(''); // Yeni görsel seçildiğinde önceki mesajı temizle
      setErrorMessage(''); // Hata mesajını temizle
    } else {
      setErrorMessage('Görsel seçimi iptal edildi veya geçerli bir görsel seçilmedi.');
    }
  };

  // Mesajı decode etme fonksiyonu
  const handleDecode = async () => {
    if (imageUri) {
      try {
        const message = await decodeMessageFromImage(imageUri);
        if (message) {
          setDecodedMessage(message);
        } else {
          setErrorMessage('Bu görselde çözümlenebilecek bir mesaj bulunamadı.');
        }
      } catch (err) {
        setErrorMessage(`Mesaj çözme hatası: ${err.message}. Lütfen geçerli bir dosya seçin.`);
        setDecodedMessage(''); // Mesaj başarısız olduğunda önceki çözümlenmiş mesajı temizle
      }
    } else {
      setErrorMessage('Lütfen bir görsel seçin.');
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Görsel Seç" onPress={pickImageAsync} />

      {/* Görsel Önizlemesi */}
      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.imagePreview} />
      )}

      {/* Mesajı Gör Butonu */}
      {imageUri && (
        <Button title="Mesajı Gör" onPress={handleDecode} />
      )}

      {/* Hata Mesajının Gösterimi */}
      {errorMessage ? (
        <Text style={styles.error}>{errorMessage}</Text>
      ) : (
        /* Şifrelenmiş Mesajın Gösterimi */
        decodedMessage && (
          <Text style={styles.message}>{decodedMessage}</Text>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  imagePreview: {
    width: 300,
    height: 300,
    marginVertical: 20,
    resizeMode: 'contain',
  },
  message: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  error: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
    color: 'red', // Hata mesajı için kırmızı renk
  },
});
