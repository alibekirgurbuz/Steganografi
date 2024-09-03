import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function Button({ title, onPress }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#e9ecef',
    padding: 15,
    borderRadius: 10,
    margin: 10,
  },
  text: {
    color: 'black',
    fontSize: 16,
    textAlign: 'center',
  },
});


