import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, Animated } from "react-native";
import { launchImageLibrary, launchCamera } from "react-native-image-picker";
import { scanTicketApi } from "../../API/ticket.api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LinearGradient from "react-native-linear-gradient";

const QRScanner = () => {
  const [imageUri, setImageUri] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  const pickImageFromGallery = () => {
    launchImageLibrary({ mediaType: "photo" }, async (response) => {
      if (response.assets && response.assets.length > 0) {
        const img = response.assets[0];
        setImageUri(img.uri);
        fadeIn();
        await scanImage(img);
      }
    });
  };

  const captureImageFromCamera = () => {
    launchCamera({ mediaType: "photo", saveToPhotos: true }, async (response) => {
      if (response.assets && response.assets.length > 0) {
        const img = response.assets[0];
        setImageUri(img.uri);
        fadeIn();
        await scanImage(img);
      }
    });
  };

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const scanImage = async (image) => {
    try {
      const organiserAuthToken = await AsyncStorage.getItem("organiserAuthToken");
      const result = await scanTicketApi(image, organiserAuthToken);
      setScanResult(result.error ? { error: result.error } : result);
    } catch (error) {
      setScanResult({ error: "Error processing image" });
    }
  };

  return (
    <LinearGradient colors={["#F4F4F4", "#D9D9D9"]} style={styles.container}>
      <Text style={styles.title}>Scan QR Code</Text>
      {imageUri && <Animated.Image source={{ uri: imageUri }} style={[styles.image, { opacity: fadeAnim }]} />}
      
      <TouchableOpacity style={styles.button} onPress={captureImageFromCamera}>
        <Text style={styles.buttonText}>📷 Capture Image</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={pickImageFromGallery}>
        <Text style={styles.buttonText}>🖼️ Pick from Gallery</Text>
      </TouchableOpacity>
      
      {scanResult && (
        <View style={styles.resultContainer}>
          {scanResult.error ? (
            <Text style={styles.errorText}>{scanResult.error}</Text>
          ) : (
            <View>
              <Text style={styles.successText}>✅ Scan Successful!</Text>
              <Text style={styles.dataText}>Ticket ID: {scanResult.ticket._id}</Text>
              <Text style={styles.dataText}>Scanned: {scanResult.ticket.scanned ? "Yes" : "No"}</Text>
            </View>
          )}
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
    borderRadius: 10,
  },
  button: {
    backgroundColor: "#333",
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    width: 200,
    alignItems: "center",
    shadowOpacity: 0.2,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  resultContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 4,
    width: "90%",
    alignItems: "center",
  },
  successText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "green",
    marginBottom: 5,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "red",
    marginBottom: 5,
  },
  dataText: {
    fontSize: 16,
    color: "#555",
  },
});

export default QRScanner;