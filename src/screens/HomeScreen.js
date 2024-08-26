import React from 'react';
import { View, Text, Button } from 'react-native';

const HomeScreen = ({ navigation }) => {
    return (
        <View>
            <Text>Steganografi Uygulamasına Hoş Geldiniz</Text>
            <Button title="Mesajı Gizle" onPress={() => navigation.navigate('EncodeScreen')} />
            <Button title="Mesajı Çıkar" onPress={() => navigation.navigate('DecodeScreen')} />
        </View>
    );
}

export default HomeScreen;
