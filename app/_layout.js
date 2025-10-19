import { Stack } from "expo-router";
export default function RootLayout() {
  return (
    <Stack initialRouteName="login">
      <Stack.Screen name="login" options={{ headerTitle: "Login", headerShown: true }} />
      <Stack.Screen name="index" options={{ headerTitle: "Home", headerShown: true }} />
      <Stack.Screen name="donate" options={{ headerTitle: "Donate", headerShown: true }} />
      <Stack.Screen name="basket" options={{ headerTitle: "My Basket", headerShown: true }} />
      <Stack.Screen name="profile" options={{ headerTitle: "Profile", headerShown: true }} />
      <Stack.Screen name="mydonations" options={{ headerTitle: "My Donations", headerShown: true }} />
      <Stack.Screen name="myaccount" options={{ headerTitle: "My Account", headerShown: true }} />
      <Stack.Screen name="updateaccount" options={{ headerTitle: "Update Account", headerShown: true }} />
      <Stack.Screen name="editdonation" options={{ headerTitle: "Edit Donation", headerShown: true }} />
    </Stack>
  );
}