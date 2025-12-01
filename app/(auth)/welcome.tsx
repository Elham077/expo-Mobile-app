import Button from "@/components/Button";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, spacingX, spacingY } from "@/constants/theme";
import { verticalScale } from "@/utils/styling";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

const Welcome = () => {
  // Hooks for translation and navigation
  const { t } = useTranslation(); // Translation hook
  const router = useRouter(); // Navigation router

  return (
    <ScreenWrapper style={{ direction: "ltr" }}>
      <View style={styles.container}>
        <View>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push("/(auth)/login")}
          >
            <Typo fontWeight={"500"}>{t("sign_in")}</Typo>
          </TouchableOpacity>

          <Animated.Image
            entering={FadeIn.duration(1000).springify()}
            source={require("../../assets/images/welcome.png")}
            style={styles.welcomeImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.footer}>
          <Animated.View
            entering={FadeInDown.duration(1000)
              .delay(100)
              .springify()
              .damping(12)}
            style={{ alignItems: "center", gap: 2 }}
          >
            <Typo size={27} fontWeight={"bold"} color={colors.textLight}>
              {t("silab_bahar_medical")}
            </Typo>
            <Typo size={27} fontWeight={"bold"} color={colors.textLight}>
              {t("equipment_trading_company")}
            </Typo>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(1000)
              .delay(200)
              .springify()
              .damping(12)}
            style={styles.buttonContainer}
          >
            <Button onPress={() => router.push("/(auth)/register")}>
              <Typo size={22} color={colors.neutral900} fontWeight={"600"}>
                {t("get_started")}
              </Typo>
            </Button>
          </Animated.View>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingTop: spacingY._7, // Uses theme spacing
  },

  welcomeImage: {
    width: "100%",
    height: verticalScale(300), // Responsive vertical scaling
    alignSelf: "center",
    marginTop: verticalScale(100),
  },

  loginButton: {
    alignSelf: "flex-end",
    marginRight: spacingX._20, // Uses theme horizontal spacing
  },

  footer: {
    backgroundColor: colors.neutral900,
    alignItems: "center",
    paddingTop: verticalScale(30),
    paddingBottom: verticalScale(45),
    gap: spacingY._20
  },

  buttonContainer: {
    width: "100%",
    paddingHorizontal: spacingX._20,
    paddingBottom: spacingY._30,
  },
});
