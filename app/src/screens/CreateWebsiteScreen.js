import { View, Text, Pressable, StyleSheet } from "react-native";

export default function CreateWebsiteScreen({ navigation }) {
  return (
    <View style={styles.container}>

      <Pressable style={styles.card} onPress={() => navigation.navigate("Premade")}>
        <Text style={styles.text}>Premade Template</Text>
      </Pressable>

      <Pressable style={styles.card} onPress={() => navigation.navigate("Dropdown")}>
        <Text style={styles.text}>Dropdown and Make</Text>
      </Pressable>

      <Pressable style={styles.card} onPress={() => navigation.navigate("CustomCode")}>
        <Text style={styles.text}>Custom Coding</Text>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 25,
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