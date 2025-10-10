import { Stack } from "expo-router";
export default function RootLayout() {
  return (
    <Stack initialRouteName="login">
      <Stack.Screen name="login" options={{ headerTitle: "Login", headerShown: true }} />
      <Stack.Screen name="index" options={{ headerTitle: "Home", headerShown: true }} />
    </Stack>
  );
}