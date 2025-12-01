import BackButton from "@/components/BackButton";
import Button from "@/components/Button";
import Input from "@/components/Input";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { auth } from "@/config/firebase.client";
import { colors, spacingX, spacingY } from "@/constants/theme";
import { verticalScale } from "@/utils/styling";
import { useRouter } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
import * as Icons from "phosphor-react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, StyleSheet, View } from "react-native";

const ForgotPasswordScreen = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const router = useRouter();

  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert(t("error"), t("please_enter_email"));
      return;
    }

    try {
      setSending(true);
      await sendPasswordResetEmail(auth, email);
      Alert.alert(t("success"), t("reset_link_sent"));
      router.back();
    } catch (error: any) {
      Alert.alert(t("error"), error.message || t("reset_failed"));
    } finally {
      setSending(false);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <BackButton />
        {/* Header with back button */}
        <View style={styles.header}>
          <Typo size={24} fontWeight="700" color={colors.text}>
            {t("reset_password")}
          </Typo>
          <Typo size={16} color={colors.textLighter} style={styles.subtitle}>
            {t("reset_instructions")}
          </Typo>
        </View>

        {/* Email Input */}
        <Input
          label={""}
          placeholder={t("enter_email")}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          icon={
            <Icons.Envelope
              size={verticalScale(22)}
              weight="fill"
              color={colors.neutral300}
            />
          }
          containerStyle={styles.inputContainer}
          error
        />

        {/* Submit Button */}
        <Button
          onPress={handlePasswordReset}
          loading={sending}
          style={styles.button}
        >
          <Typo fontWeight="700" size={18} color={colors.black}>
            {sending ? t("sending") + "..." : t("send_reset_link")}
          </Typo>
        </Button>

        {/* Back to Login */}
      </View>
    </ScreenWrapper>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: {
    direction: "rtl",
    flex: 1,
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._30,
  },
  header: {
    marginBottom: spacingY._30,
    gap: spacingY._10,
  },
  subtitle: {
    marginTop: spacingY._5,
  },
  inputContainer: {
    marginBottom: spacingY._20,
  },
  button: {
    marginTop: spacingY._10,
  },
  backLink: {
    alignSelf: "center",
    marginTop: spacingY._20,
  },
});
