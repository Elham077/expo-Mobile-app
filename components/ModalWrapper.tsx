import { colors, spacingX, spacingY } from "@/constants/theme";
import { ModalWrapperProps } from "@/types";
import React from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const isIos = Platform.OS === "ios";

const ModalWrapper = ({
  style,
  children,
  bg = colors.neutral900,
  scrollEnabled = true,
  keyboardAvoiding = true,
}: ModalWrapperProps) => {
  const Container = keyboardAvoiding
    ? KeyboardAwareScrollView
    : scrollEnabled
    ? ScrollView
    : View;

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Container
        contentContainerStyle={[styles.content, style]}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={20}
      >
        {children}
      </Container>
    </View>
  );
};

export default ModalWrapper;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    direction: "rtl",
    paddingTop: isIos ? spacingY._15 : 20,
    paddingBottom: isIos ? spacingY._20 : spacingY._10,
  },
  content: {
    paddingHorizontal: spacingX._10,
    paddingBottom: spacingY._25,
  },
});
