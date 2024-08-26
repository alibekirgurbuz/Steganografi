import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import EncodeScreen from './src/screens/EncodeScreen';
import DecodeScreen from './src/screens/DecodeScreen';

const Stack = createStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="HomeScreen">
                <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ title: 'Ana Sayfa' }} />
                <Stack.Screen name="EncodeScreen" component={EncodeScreen} options={{ title: 'Mesajı Gizle' }} />
                <Stack.Screen name="DecodeScreen" component={DecodeScreen} options={{ title: 'Mesajı Çıkar' }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
