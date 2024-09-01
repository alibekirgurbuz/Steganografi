import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Button from '../components/Button';
import { encodeMessageInImage } from '../utils/steganografi';
import * as MediaLibrary from 'expo-media-library';

export default function EncodeScreen() {
  const [message, setMessage] = useState('');
  const [confirmedMessage, setConfirmedMessage] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [encodedImageUri, setEncodedImageUri] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  // Medya izinleri
  const [status, requestPermission] = MediaLibrary.usePermissions();
  const imageRef = useRef();

  if (status === null) {
    requestPermission();
  }

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
      setEncodedImageUri(null);
      setStatusMessage('Görsel seçildi');
    } else {
      setStatusMessage('Görsel seçimi iptal edildi.');
    }
  };

  const handleConfirmMessage = () => {
    if (message.trim() !== '') {
      setConfirmedMessage(message);
      setStatusMessage('Mesaj onaylandı');
    } else {
      setStatusMessage('Lütfen geçerli bir mesaj girin.');
    }
  };

  const handleEncode = async () => {
    if (imageUri && confirmedMessage) {
      try {
        const newEncodedImageUri = await encodeMessageInImage(imageUri, confirmedMessage);
        setEncodedImageUri(newEncodedImageUri);
        setStatusMessage('Mesaj başarılı bir şekilde gizlendi');
      } catch (err) {
        setStatusMessage(`Hata: ${err.message}`);
      }
    } else {
      setStatusMessage('Lütfen hem bir mesaj girin hem de bir görsel seçin.');
    }
  };

  const onSaveImageAsync = async () => {
    if (encodedImageUri) {
      try {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permission to access gallery was denied');
          return;
        }

        const asset = await MediaLibrary.createAssetAsync(encodedImageUri);
        const album = await MediaLibrary.getAlbumAsync('ExpoSteganography');
        if (album == null) {
          await MediaLibrary.createAlbumAsync('ExpoSteganography', asset, false);
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        }

        setStatusMessage('Görsel galeriye kaydedildi.');
        Alert.alert('Başarılı', 'Görsel galeriye kaydedildi.');
      } catch (error) {
        console.error('Error saving image to gallery:', error);
        setStatusMessage('Görsel galeriye kaydedilemedi.');
      }
    } else {
      setStatusMessage('Kaydedilecek görsel bulunamadı.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Gizlenecek mesajı girin"
        value={message}
        onChangeText={setMessage}
      />
      <Button title="Onayla" onPress={handleConfirmMessage} />
      <Button title="Görsel Seç" onPress={pickImageAsync} />
      <Button title="Mesajı Gizle" onPress={handleEncode} />
      {statusMessage && <Text style={styles.status}>{statusMessage}</Text>}
      {encodedImageUri && (
        <Button title="Kaydet" onPress={onSaveImageAsync} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    margin: 10,
    width: '80%',
  },
  status: {
    marginTop: 20,
    fontSize: 16,
  },
});
