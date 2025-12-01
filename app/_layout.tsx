import { AuthProvider, useAuth } from "@/contexts/authContext";
import { Stack } from "expo-router";
import React from "react";
import "../i18n";
const StackLayout = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user } = useAuth(); // Get auth state
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Main screens */}
      <Stack.Screen name="index" />
      <Stack.Screen name="statistics" />
      <Stack.Screen name="inventory" />
      <Stack.Screen name="profile" />
      {/* Add other main screens here */}
      {/* Modal screens - these will only show when navigated to */}
      <Stack.Screen
        name="(modals)/AdminPanelScreen"
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="(modals)/ChangePasswordScreen"
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="(modals)/ExpenseScreen"
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="(modals)/LanguageScreen"
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="(modals)/ProductAddScreen"
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="(modals)/ProfileScreen"
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="(modals)/SellProductScreen"
        options={{ presentation: "modal" }}
      />
    </Stack>
  );
};
function RootLayout() {
  return (
    <AuthProvider>
      <StackLayout />
    </AuthProvider>
  );
}
export default RootLayout;
