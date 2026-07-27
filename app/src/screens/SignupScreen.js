import {
  View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert
} from "react-native";
import { startTransition, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SignupScreen({ navigation }) {

  const API = "https://ariful.pro.bd/api"; // localhost change করো

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const signup = async () => {

    if (password.length < 4) {
      Alert.alert("Error", "Use minimum 4 length password");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Password mismatch");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(API + "/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          username,
          email,
          password
        })
      });

      const data = await res.json();
      setLoading(false);

      Alert.alert("Message", data.msg);

      if (data.msg.includes("Signup")) {
        await AsyncStorage.setItem("email", email);
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
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      )}

      <View style={styles.card}>

        <Text style={styles.title}>Create Account</Text>

        <TextInput placeholder="Name" style={styles.input} onChangeText={setName} />
        <TextInput placeholder="Username" style={styles.input} onChangeText={setUsername} />
        <TextInput placeholder="Email" style={styles.input} onChangeText={setEmail} />

        <TextInput
          placeholder="Password (min 4)"
          secureTextEntry
          style={styles.input}
          onChangeText={setPassword}
        />

        <TextInput
          placeholder="Confirm Password"
          secureTextEntry
          style={styles.input}
          onChangeText={setConfirmPassword}
        />

        <Pressable style={styles.button} onPress={signup}>
          <Text style={{ color: "white" }}>Signup</Text>
        </Pressable>

        <Text style={styles.link} onPress={() => navigation.navigate("Login")}>
          Back to login
        </Text>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fda085",
  },

  card: {
    backgroundColor: "white",
    padding: 30,
    width: 300,
    borderRadius: 12,
  },

  title: {
    fontSize: 22,
    marginBottom: 10,
    textAlign: "center",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginVertical: 6,
    borderRadius: 6,
  },

  button: {
    backgroundColor: "#10b981",
    padding: 12,
    borderRadius: 6,
    marginTop: 10,
    alignItems: "center",
  },

  link: {
    textAlign: "center",
    marginTop: 10,
    color: "#10b981",
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
