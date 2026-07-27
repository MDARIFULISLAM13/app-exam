import { View, Text, Pressable, StyleSheet, Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";

export default function HomeScreen({ navigation }) {

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const user = await AsyncStorage.getItem("token");

    if (!user) {
      navigation.replace("Login");
    }
  };

  const logout = async () => {
    await AsyncStorage.clear();
    navigation.replace("Login");
  };

  return (
    <View style={styles.container}>

      <Pressable style={styles.card} onPress={() => navigation.navigate("CreateWebsite")}>
        <Text style={styles.text}>Create New Website</Text>
      </Pressable>

      <Pressable style={styles.card} onPress={() => navigation.navigate("WebsiteList")}>
        <Text style={styles.text}>Manage Website</Text>
      </Pressable>

      <Pressable style={styles.card} onPress={() => Linking.openURL("https://youtube.com")}>
        <Text style={styles.text}>View Tutorial How to Create Website</Text>
      </Pressable>

      <Pressable style={styles.card} onPress={logout}>
        <Text style={styles.text}>Logout</Text>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 25,

    // gradient same look (simple fallback color)
    backgroundColor: "#764ba2",
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.8)",
    padding: 30,
    borderRadius: 20,
    marginBottom: 20,
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },

  text: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
  },
});