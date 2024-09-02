import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Image, StatusBar } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Button from '../components/Button';
import * as MediaLibrary from 'expo-media-library';
import { encodeMessageInImage, decodeMessageFromImage } from '../utils/steganografi';
import * as FileSystem from 'expo-file-system';

export default function EncodeScreen() {
  const [message, setMessage] = useState('');
  const [confirmedMessage, setConfirmedMessage] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [encodedImageUri, setEncodedImageUri] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  // Medya izinleri
  const [status, requestPermission] = MediaLibrary.usePermissions();
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

        // Mesajı çöz ve logla (isteğe bağlı)
        const decodedMessage = await decodeMessageFromImage(newEncodedImageUri);
        console.log('Decoded Message:', decodedMessage);

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
        const fileInfo = await FileSystem.getInfoAsync(encodedImageUri);

        if (!fileInfo.exists) {
          setStatusMessage('Görsel kaydedilecek dosya bulunamadı.');
          return;
        }

        const asset = await MediaLibrary.createAssetAsync(encodedImageUri);
        let album = await MediaLibrary.getAlbumAsync('ExpoSteganography');
        if (!album) {
          album = await MediaLibrary.createAlbumAsync('ExpoSteganography', asset, false);
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        }
        setStatusMessage('Görsel galeriye kaydedildi.');
        Alert.alert('Başarılı', 'Görsel galeriye kaydedildi.');
      } catch (error) {
        console.error('Error saving image to gallery:', error.message);
        setStatusMessage('Görsel galeriye kaydedilemedi.');
      }
    } else {
      setStatusMessage('Kaydedilecek görsel bulunamadı.');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUri }} style={{ width: 200, height: 200 }} />
      <TextInput
        style={styles.input}
        placeholder="Gizlenecek mesajı girin"
        value={message}
        onChangeText={setMessage}
      />
      <View>
        <View style={styles.ButtonCont}>
          <Button title="Görsel Seç" onPress={pickImageAsync} />
          <Button title="Onayla" onPress={handleConfirmMessage} />
          <Button title="Mesajı Gizle" onPress={handleEncode} />
        </View>
      </View>
      {statusMessage && <Text style={styles.status}>{statusMessage}</Text>}
      {encodedImageUri && (<Button title="Kaydet" onPress={onSaveImageAsync} />)}
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
  ButtonCont: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '90%',
  }
});
