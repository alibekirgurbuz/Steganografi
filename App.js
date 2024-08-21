import React, { useState, useEffect } from 'react';
import { Button, StyleSheet, Text, TextInput, View, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const [key, setKey] = useState('');
  const [encodedMessages, setEncodedMessages] = useState({});

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Fotoğraflarınıza erişim izni vermelisiniz.');
      }
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImageUri = result.assets[0].uri;
      console.log('Seçilen Görsel URI:', selectedImageUri);
      setImage(selectedImageUri);
    } else {
      console.log('Kullanıcı seçimi iptal etti veya bir sorun oluştu.');
    }
  };

  const encodeMessageInImage = (message, key) => {
    let encoded = '';
    for (let i = 0; i < message.length; i++) {
      encoded += String.fromCharCode(message.charCodeAt(i) + key.length);
    }
    return encoded;
  };

  const decodeMessageFromImage = (encodedMessage, key) => {
    let decoded = '';
    for (let i = 0; i < encodedMessage.length; i++) {
      decoded += String.fromCharCode(encodedMessage.charCodeAt(i) - key.length);
    }
    return decoded;
  };

  const encodeMessage = () => {
    if (!image || !message.trim() || !key.trim()) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    const encodedMessage = encodeMessageInImage(message, key);
    setEncodedMessages(prev => ({ ...prev, [image]: { encodedMessage, key } }));
    Alert.alert('Başarılı', 'Mesaj encode edildi.');
  };

  const decodeMessage = () => {
    if (!image || !key.trim()) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    const encodedData = encodedMessages[image];
    if (encodedData && encodedData.key === key) {
      const decodedMessage = decodeMessageFromImage(encodedData.encodedMessage, key);
      Alert.alert('Başarılı', 'Mesaj decode edildi: ' + decodedMessage);
    } else {
      Alert.alert('Hata', 'Yanlış key girdiniz veya bu görselde bir mesaj bulunmuyor.');
    }
  };

  if (screen === 'home') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Steganografi</Text>
        <Button title="Encode" onPress={() => setScreen('encode')} />
        <Button title="Decode" onPress={() => setScreen('decode')} />
      </View>
    );
  } else if (screen === 'encode') {
    return (
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          {image && <Image source={{ uri: image }} style={styles.image} />}
        </View>
        <Button title="Resim Seç" onPress={pickImage} />
        <TextInput
          style={styles.input}
          placeholder="Mesaj"
          value={message}
          onChangeText={setMessage}
        />
        <TextInput
          style={styles.input}
          placeholder="Key"
          value={key}
          onChangeText={setKey}
        />
        <Button title="Encode" onPress={encodeMessage} />
        <Button title="Geri" onPress={() => setScreen('home')} />
      </View>
    );
  } else if (screen === 'decode') {
    return (
      <View style={styles.container}>
        <Button title="Resim Seç" onPress={pickImage} />
        {image && <Image source={{ uri: image }} style={styles.image} />}
        <TextInput
          style={styles.input}
          placeholder="Key"
          value={key}
          onChangeText={setKey}
        />
        <Button title="Decode" onPress={decodeMessage} />
        <Button title="Geri" onPress={() => setScreen('home')} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    width: '100%',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});
