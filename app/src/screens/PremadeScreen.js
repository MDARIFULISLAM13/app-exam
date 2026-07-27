import { Platform } from "react-native";
import { WebView } from "react-native-webview";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export default function PremadeScreen() {

  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const t = await AsyncStorage.getItem("token");
      const u = await AsyncStorage.getItem("username");

      setToken(t || "");
      setUsername(u || "");
      setReady(true);
    })();
  }, []);

  const URL = `https://ariful.onrender.com/premade`;

  // 🌐 Web হলে direct redirect
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") {
      window.location.href = URL;
    }
    return null;
  }

  if (!ready) return null;

  // 🔥 TOKEN + USERNAME inject (IMPORTANT)
  const injectedJS = `
    (function() {
      localStorage.setItem("token", "${token}");
      localStorage.setItem("username", "${username}");
    })();
    true;
  `;

  return (
    <WebView
      source={{ uri: URL }}
      injectedJavaScriptBeforeContentLoaded={injectedJS}
      javaScriptEnabled={true}
      domStorageEnabled={true}
    />
  );
}