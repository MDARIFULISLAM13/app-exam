import {
  View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert
} from "react-native";
import { useState, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function OtpScreen({ navigation }) {

  const API = "https://ariful.pro.bd/api";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const inputs = useRef([]);

  const handleChange = (text, index) => {
    let newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const verifyOtp = async () => {
    const finalOtp = otp.join("");

    setLoading(true);

    try {
      const email = await AsyncStorage.getItem("email");

      const res = await fetch(API + "/verify_otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: finalOtp })
      });

      const data = await res.json();
      setLoading(false);

      Alert.alert("Message", data.msg);

      if (data.msg.includes("successfully")) {
        navigation.replace("Login");
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
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.title}>Verify OTP</Text>

        <View style={styles.otpRow}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              style={styles.input}
              maxLength={1}
              keyboardType="numeric"
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              ref={(ref) => (inputs.current[index] = ref)}
            />
          ))}
        </View>

        <Pressable style={styles.button} onPress={verifyOtp}>
          <Text style={{ color: "white" }}>Verify</Text>
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
    backgroundColor: "#fcb69f",
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
  },

  otpRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 20,
  },

  input: {
    width: 40,
    height: 45,
    borderWidth: 1,
    borderColor: "#ddd",
    textAlign: "center",
    marginHorizontal: 4,
    fontSize: 18,
  },

  button: {
    backgroundColor: "#6366f1",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
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