import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import HomeScreen from "../screens/HomeScreen";


 import OtpScreen from "../screens/OtpScreen";
 import EmailScreen from "../screens/EmailScreen";
// import SettingsScreen from "../screens/SettingsScreen";
  import EditScreen from "../screens/EditScreen";
  import DropdownScreen from "../screens/DropdownScreen";
  import CustomCodeScreen from "../screens/CustomCodeScreen";
  import PremadeScreen from "../screens/PremadeScreen";
 import WebsiteListScreen from "../screens/WebsiteListScreen";
import CreateWebsiteScreen from "../screens/CreateWebsiteScreen";
 
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} />

        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="Otp" component={OtpScreen} />
        <Stack.Screen name="Email" component={EmailScreen} />
        <Stack.Screen name="CreateWebsite" component={CreateWebsiteScreen} />
         <Stack.Screen name="WebsiteList" component={WebsiteListScreen} />
        <Stack.Screen name="Edit" component={EditScreen} />
        <Stack.Screen name="Premade" component={PremadeScreen} />
         <Stack.Screen name="Dropdown" component={DropdownScreen} />
        <Stack.Screen name="CustomCode" component={CustomCodeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}