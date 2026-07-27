import { 
  View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator 
} from "react-native";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen({ navigation }) {

  const API = "https://ariful.pro.bd/api";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const login = async () => {
    setLoading(true);

    try {
      const res = await fetch(API + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      setLoading(false);

      showToast(data.msg);

      if (data.verify_issue) {
        await AsyncStorage.setItem("email", email);
        navigation.navigate("Email");
      }

      if (data.token) {
        await AsyncStorage.setItem("token", data.token);
        await AsyncStorage.setItem("username", data.username);
        navigation.replace("Home");
      }

    } catch (err) {
      setLoading(false);
      showToast("Network error");
    }
  };

  return (
    <View style={styles.container}>

      {/* loader */}
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      )}

      {/* toast */}
      {toast !== "" && (
        <View style={styles.toast}>
          <Text style={{ color: "white" }}>{toast}</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.title}>Login</Text>

        <TextInput
          placeholder="Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          placeholder="Password"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        <Pressable style={styles.button} onPress={login}>
          <Text style={{ color: "white" }}>Login</Text>
        </Pressable>

        <Text style={styles.link} onPress={() => navigation.navigate("Email")}>
          Forgot password?
        </Text>

        <Text style={styles.link} onPress={() => navigation.navigate("Signup")}>
          Create account
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
    backgroundColor: "#764ba2",
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
    backgroundColor: "#6366f1",
    padding: 12,
    borderRadius: 6,
    marginTop: 10,
    alignItems: "center",
  },

  link: {
    textAlign: "center",
    marginTop: 10,
    color: "#6366f1",
  },

  toast: {
    position: "absolute",
    top: 40,
    backgroundColor: "#6366f1",
    padding: 10,
    borderRadius: 6,
    zIndex: 10,
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