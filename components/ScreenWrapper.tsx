import { colors } from "@/constants/theme";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  children: React.ReactNode;
  scrollable?: boolean;
  noPadding?: boolean;
  style?: any;
};

const ScreenWrapper: React.FC<Props> = ({
  children,
  scrollable = false,
  noPadding = false,
  style,
}) => {
  const Container = scrollable ? ScrollView : View;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={colors.neutral900} barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <Container
          contentContainerStyle={[
            styles.container,
            noPadding ? {} : styles.defaultPadding,
            style,
          ]}
          style={!scrollable ? [styles.container, style] : undefined}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </Container>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ScreenWrapper;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.neutral900,
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    backgroundColor: colors.neutral900,
  },
  defaultPadding: {
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
});
