import BackButton from "@/components/BackButton";
import Button from "@/components/Button";
import Input from "@/components/Input";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { auth } from "@/config/firebase.client";
import { colors, spacingX, spacingY } from "@/constants/theme";
import { useAuth } from "@/contexts/authContext";
import { verticalScale } from "@/utils/styling";
import { useRouter } from "expo-router";
import { onAuthStateChanged, reload } from "firebase/auth";
import * as Icons from "phosphor-react-native";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const Login = () => {
  const { t } = useTranslation(); // Translation hook
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login: loginUser } = useAuth();
  const [isSecure, setIsSecure] = useState(true);

  const toggleSecureEntry = () => {
    setIsSecure((prev) => !prev);
  };
  const checkEmailVerified = (navigation: any) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        await reload(user); // Refresh user data
        if (user.emailVerified) {
          console.log("User is verified.");
          navigation.navigate("/(tabs)/index");
        } else {
          console.log("User not verified.");
          alert(t("please_varify_email"));
          router.back()
        }
      }
    });
  };
  const handleSubmit = async () => {
    if (!emailRef.current || !passwordRef.current) {
      Alert.alert(t("login"), t("please_fill_all_fields"));
      return;
    }
    checkEmailVerified(router);
    setIsLoading(true);
    const res = await loginUser(emailRef.current, passwordRef.current);
    setIsLoading(false);
    if (!res.success) {
      Alert.alert(t("login"), res.msg);
    }
  };
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <BackButton iconSize={28} />
        <View style={{ gap: 5, marginTop: spacingY._20 }}>
          <Typo size={30} fontWeight={"800"} style={styles.welcomeText}>
            {t("dear_user")},
          </Typo>
          <Typo size={30} fontWeight={"800"} style={styles.welcomeText}>
            {t("welcome_back")}
          </Typo>
        </View>
        <View style={styles.form}>
          <Typo size={16} color={colors.textLighter}>
            {t("login_subtext")}
          </Typo>
          <Typo size={18} fontWeight={"800"}>
            {t("enter_email")}:
          </Typo>
          <Input
            label={""}
            error={null}
            placeholder={"e.g. example@gmial.com"}
            onChangeText={(value) => (emailRef.current = value)}
            icon={
              <Icons.At
                size={verticalScale(26)}
                weight="fill"
                color={colors.neutral300}
              />
            }
          />
          <Typo size={18} fontWeight={"800"}>
            {t("enter_password")}:
          </Typo>
          <Input
            label={""}
            error={null}
            secureTextEntry={isSecure}
            onChangeText={(value) => (passwordRef.current = value)}
            icon={
              <TouchableOpacity onPress={toggleSecureEntry}>
                {isSecure ? (
                  <Icons.EyeSlash weight="fill" size={26} color={colors.text} />
                ) : (
                  <Icons.Eye weight="fill" size={26} color={colors.text} />
                )}
              </TouchableOpacity>
            }
          />
          <Pressable
            onPress={() => router.push("/(auth)/ForgotPasswordScreen")}
          >
            <Typo style={styles.forgotPassword}>{t("forgot_password")}</Typo>
          </Pressable>
          <Button loading={isLoading} onPress={handleSubmit}>
            <Typo fontWeight={"700"} color={colors.black} size={21}>
              {t("login")}
            </Typo>
          </Button>
        </View>
        <View style={styles.footer}>
          <Typo size={15}>{t("no_account")}</Typo>
          <Pressable onPress={() => router.navigate("/(auth)/register")}>
            <Typo size={15} fontWeight={"700"} color={colors.primary}>
              {t("sign_up")}
            </Typo>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    direction: "rtl",
    flex: 1,
    gap: spacingY._30,
    paddingHorizontal: spacingX._20,
  },
  welcomeText: {
    fontSize: verticalScale(20),
    fontWeight: "bold",
    color: colors.text,
  },
  form: {
    // direction: "rtl",
    gap: spacingY._10,
  },
  forgotPassword: {
    fontWeight: "500",
    color: colors.text,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  footerText: {
    textAlign: "center",
    color: colors.text,
    fontSize: verticalScale(15),
  },
});
