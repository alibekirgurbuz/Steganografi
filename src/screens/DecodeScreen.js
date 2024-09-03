import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, StatusBar } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Button from '../components/Button';
import { decodeMessageFromImage } from '../utils/steganografi';

export default function DecodeScreen({navigation}) {
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  
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
      setDecodedMessage(''); // Yeni görsel seçildiğinde önceki mesaj temizlenir.
      setErrorMessage(''); // Hata mesajı temizlenir
    } else {
      setErrorMessage('Görsel seçilmedi');
    }
  };
  // Mesaj decode ediliyor.
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
        setDecodedMessage('');
      }
    } else {
      setErrorMessage('Bir görsel seçin.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto"/>
      <Button title="Görsel Seç" onPress={pickImageAsync} />

      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.imagePreview} />
      )}

      {imageUri && (
        <Button title="Mesajı Gör" onPress={handleDecode} />
      )}

      {errorMessage ? (
        <Text style={styles.error}>{errorMessage}</Text>
      ) : (
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
    backgroundColor: "#343a40",
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
    color: '#17a2b8',
  },
  error: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
    color: 'red', 
  },
});
