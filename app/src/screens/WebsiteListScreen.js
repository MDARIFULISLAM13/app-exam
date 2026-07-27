import {
  View, Text, Pressable, StyleSheet, ActivityIndicator, FlatList, Alert, Linking
} from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function WebsiteListScreen({ navigation }) {

  const API = "https://ariful.pro.bd/api/get_website_list";

  const [loading, setLoading] = useState(true);
  const [links, setLinks] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const username = await AsyncStorage.getItem("username");
    const token = await AsyncStorage.getItem("token");

    if (!username || !token) {
      Alert.alert("Error", "Login required");
      navigation.replace("Login");
      return;
    }

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, token })
      });

      const data = await res.json();
      setLoading(false);

      if (data.message && data.message.toLowerCase().includes("unauthorized")) {
        await AsyncStorage.clear();
        navigation.replace("Home");
        return;
      }

      if (!data.success) {
        Alert.alert("Error", "Something went wrong");
        return;
      }

      setLinks(data.links);

    } catch (err) {
      setLoading(false);
      Alert.alert("Error", "Server error");
    }
  };

  const openSite = (link) => {
    Linking.openURL(`https://ariful.pro.bd/@${link}`);
  };

  const editSite = (link) => {
    navigation.navigate("Edit", { link });
  };

  return (
    <View style={styles.container}>

      {/* top */}
      <View style={styles.top}>
        <Text style={styles.title}>Your Websites</Text>

        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
      </View>

      {/* content */}
      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : links.length === 0 ? (
        <Text style={styles.empty}>No websites</Text>
      ) : (
        <FlatList
          data={links}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.linkText}>{item}</Text>

              <View style={styles.actions}>
                <Pressable style={styles.openBtn} onPress={() => openSite(item)}>
                  <Text style={styles.btnText}>Website</Text>
                </Pressable>

                <Pressable style={styles.editBtn} onPress={() => editSite(item)}>
                  <Text style={styles.btnText}>Open</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#764ba2",
  },

  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  title: {
    color: "white",
    fontSize: 18,
  },

  back: {
    color: "white",
  },

  card: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  linkText: {
    maxWidth: "60%",
  },

  actions: {
    flexDirection: "row",
  },

  openBtn: {
    backgroundColor: "#10b981",
    padding: 6,
    borderRadius: 6,
    marginRight: 6,
  },

  editBtn: {
    backgroundColor: "#f59e0b",
    padding: 6,
    borderRadius: 6,
  },

  btnText: {
    color: "white",
    fontSize: 12,
  },

  empty: {
    textAlign: "center",
    color: "white",
  },
});