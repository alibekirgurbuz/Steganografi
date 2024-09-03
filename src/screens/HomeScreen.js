import React from "react";
import { View, Text, StyleSheet, Image, StatusBar } from "react-native";
import Button from "../components/Button";

export default function HomeScreen({ navigation }) {
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <Image
        source={require("../../assets/images/detective1.png")}
        style={styles.image}
      />
      <Text style={styles.slogan}>Mesajlarınızı fotoğrafta gizleyin.</Text>

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
    backgroundColor: "#343a40",
  },
  buttonContainer: {
    flex: 2,
    width: "70%",
    marginTop:10,
    marginBottom:88,
  },
  image: {
    flex: 4,
    width: 200,
    height: 200,
    marginBottom: 50,
    resizeMode: "contain",
  },
  slogan: {
    color: "white",
    fontSize: 20,
    marginBottom: 50,
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 10,
  }
});
