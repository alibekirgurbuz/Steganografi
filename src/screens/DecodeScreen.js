import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { extractMessage } from '../utils/steganografi';
import Button from '../components/Button';

const DecodeScreen = () => {
    const [decodedMessage, setDecodedMessage] = useState('');

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            base64: true,
        });

        if (!result.canceled) {
            const imageData = jpeg.decode(result.uri);
            const message = extractMessage(imageData);
            setDecodedMessage(message);
        }
    };

    return (
        <View style={styles.container}>
            <Button title="Görsel Seç" onPress={pickImage} />
            {decodedMessage ? <Text style={styles.message}>Gizli Mesaj: {decodedMessage}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    message: {
        marginTop: 20,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default DecodeScreen;
