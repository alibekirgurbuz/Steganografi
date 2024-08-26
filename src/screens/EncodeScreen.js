import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { embedMessage } from '../utils/steganografi';
import Button from '../components/Button';

const EncodeScreen = () => {
    const [message, setMessage] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            base64: true,
        });

        if (!result.canceled) {
            setSelectedImage(result.uri);
        }
    };

    const handleEncode = () => {
        if (selectedImage && message) {
            const imageData = jpeg.decode(selectedImage);
            const encodedImage = embedMessage(imageData, message);
            // Burada görüntüyü kaydet ve göster
        }
    };

    return (
        <View style={styles.container}>
            <Text>Gizlemek İstediğiniz Mesajı Girin:</Text>
            <TextInput 
                value={message} 
                onChangeText={setMessage} 
                style={styles.input} 
                placeholder="Mesajınızı girin"
            />
            <Button title="Görsel Seç" onPress={pickImage} />
            <Button title="Mesajı Gizle" onPress={handleEncode} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
});

export default EncodeScreen;
