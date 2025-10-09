import { Stack } from "expo-router";
export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{headerTitle: "Main page", headerShown: true, headerLeft:()=><></> }} />
      <Stack.Screen name="donate" options={{headerTitle: "Test Form", headerShown: true }} />
    </Stack>
  );
}