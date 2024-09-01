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
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Encode" component={EncodeScreen} />
        <Stack.Screen name="Decode" component={DecodeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

