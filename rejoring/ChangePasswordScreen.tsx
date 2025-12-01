import BackButton from "@/components/BackButton";
import Button from "@/components/Button";
import Input from "@/components/Input";
import ModalWrapper from "@/components/ModalWrapper";
import Typo from "@/components/Typo";
import { auth } from "@/config/firebase.client";
import { colors, spacingX, spacingY } from "@/constants/theme";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, I18nManager, StyleSheet, View } from "react-native";

const ChangePasswordScreen = () => {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert(t("error"), t("passwords_do_not_match"));
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(t("error"), t("password_too_short"));
      return;
    }

    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error(t("not_authenticated"));

      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      Alert.alert(t("success"), t("password_updated"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Password change error:", error.message);
      Alert.alert(t("error"), error.message || t("change_password_failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper scrollEnabled={false} keyboardAvoiding>
      <View style={styles.container}>
        <BackButton />
        <Typo size={24} fontWeight="800" style={styles.title}>
          {t("change_password")}
        </Typo>
        <View style={styles.form}>
          <Input
            error={null}
            label=""
            placeholder={t("current_password")}
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <Input
            error={null}
            label=""
            placeholder={t("new_password")}
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <Input
            error={null}
            label=""
            placeholder={t("confirm_new_password")}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <Button loading={loading} onPress={handleChangePassword}>
            <Typo fontWeight="700" color={colors.black} size={18}>
              {t("change_password")}
            </Typo>
          </Button>
        </View>
      </View>
    </ModalWrapper>
  );
};

export default ChangePasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._20,
    gap: spacingY._20,
  },
  title: {
    textAlign: "center",
    writingDirection: I18nManager.isRTL ? "rtl" : "ltr",
  },
  form: {
    gap: spacingY._20,
  },
});
