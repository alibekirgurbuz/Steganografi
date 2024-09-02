import React from "react";
import { View, Text, StyleSheet, Image, StatusBar } from "react-native";
import Button from "../components/Button";

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Text style={styles.title}>Steganografi</Text>

      <Image
        source={require("../../assets/images/steoimage.jpg")}
        style={styles.image}
      />

      <View style={styles.buttonContainer}>
        <Button title="Encode" onPress={() => navigation.navigate("Encode")} />
        <Button title="Decode" onPress={() => navigation.navigate("Decode")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "lightgray",
  },
  title: {
    fontSize: 24,
    marginBottom: 100,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "65%",
    marginBottom: 350,
    color:''
  },
  image: {
    flex: 2,
    width: 300,
    height: 300,
    marginBottom: 50,
    resizeMode: "contain",
  },
});
