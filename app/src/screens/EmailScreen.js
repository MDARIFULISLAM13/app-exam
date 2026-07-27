import {
  View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert
} from "react-native";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function EmailScreen({ navigation }) {

  const API = "https://ariful.pro.bd/api";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    setLoading(true);

    try {
      await AsyncStorage.setItem("email", email);

      const res = await fetch(API + "/send_otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      setLoading(false);

      Alert.alert("Message", data.msg);

      if (data.msg.includes("OTP")) {
        navigation.navigate("Otp");
      }

    } catch (err) {
      setLoading(false);
      Alert.alert("Error", "Network error");
    }
  };

  return (
    <View style={styles.container}>

      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.title}>Enter Email</Text>

        <TextInput
          placeholder="Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />

        <Pressable style={styles.button} onPress={sendOtp}>
          <Text style={{ color: "white" }}>Send OTP</Text>
        </Pressable>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#66a6ff",
  },

  card: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 12,
    width: 300,
  },

  title: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginVertical: 6,
    borderRadius: 6,
  },

  button: {
    backgroundColor: "#3b82f6",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 10,
  },

  loader: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },
});