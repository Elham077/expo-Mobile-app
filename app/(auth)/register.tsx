import BackButton from "@/components/BackButton";
import Button from "@/components/Button";
import Input from "@/components/Input";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, spacingX, spacingY } from "@/constants/theme";
import { useAuth } from "@/contexts/authContext";
import { verticalScale } from "@/utils/styling";
import { useRouter } from "expo-router";
import * as Icons from "phosphor-react-native";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
export default function Register() {
  const [showPassword, setShowPassword] = useState(true);
  const numberRef = useRef("");
  const addressRef = useRef("");
  const nameRef = useRef("");
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const { t } = useTranslation();
  const [isSecure, setIsSecure] = useState(true);

  const toggleSecureEntry = () => {
    setIsSecure((prev) => !prev);
  };
  // const toggleShowPassword = () => {
  //   setShowPassword(!showPassword);
  // };
  const handleSubmit = async () => {
    if (
      !emailRef.current ||
      !passwordRef.current ||
      !nameRef.current ||
      !numberRef.current ||
      !addressRef.current
    ) {
      Alert.alert(t("sign_up"), t("please_fill_all_fields"));
      return;
    }
    setIsLoading(true);
    const res = await registerUser(
      emailRef.current,
      passwordRef.current,
      nameRef.current,
      numberRef.current,
      addressRef.current
    );
    setIsLoading(false);
    setShowPassword(true);
    console.log("====================================");
    console.log("registration Result: ", res);
    console.log("====================================");
    if (!res.success) {
      Alert.alert(t("sign_up"), res.msg);
    }
  };
  return (
    <ScreenWrapper>
      <ScrollView style={styles.container}>
        {/* {=======================( ----> BackButton (0004ElhamKohistani) )=========================== */}
        <BackButton iconSize={28} />
        <View style={{ gap: 5, marginTop: spacingY._20 }}>
          <Typo size={30} fontWeight={"800"}>
            {t("get_started")}
          </Typo>
        </View>
        {/* {=======================( ----> Form / submit btn (0005ElhamKohistani) )=========================== */}
        <View style={styles.form}>
          <Typo size={16} color={colors.textLighter}>
            {t("create_account")}
          </Typo>
          <Typo size={18} color={colors.text}>
            {t("enter_name")}
          </Typo>
          <Input
            label={""}
            error={null}
            placeholder={"e.g. Mohammad Elham"}
            onChangeText={(value) => (nameRef.current = value)}
            icon={
              <Icons.User
                size={verticalScale(26)}
                weight="fill"
                color={colors.neutral300}
              />
            }
          />
          <Typo size={18} color={colors.text}>
            {t("enter_number")}
          </Typo>
          <Input
            label={""}
            error={null}
            placeholder={"e.g. 0700716013"}
            onChangeText={(value) => (numberRef.current = value)}
            icon={
              <Icons.Phone
                size={verticalScale(26)}
                weight="fill"
                color={colors.neutral300}
              />
            }
          />
          <Typo size={18} color={colors.text}>
            {t("enter_address")}
          </Typo>
          <Input
            label={""}
            error={null}
            placeholder={"kabul district 17"}
            onChangeText={(value) => (addressRef.current = value)}
            icon={
              <Icons.MapPin
                size={verticalScale(26)}
                weight="fill"
                color={colors.neutral300}
              />
            }
          />
          <Typo size={18} color={colors.text}>
            {t("enter_email")}
          </Typo>
          <Input
            label={""}
            error={null}
            placeholder={"e.g. example@hmail.com"}
            onChangeText={(value) => (emailRef.current = value)}
            icon={
              <Icons.At
                size={verticalScale(26)}
                weight="fill"
                color={colors.neutral300}
              />
            }
          />
          <Typo size={18} color={colors.text}>
            {t("enter_password")}
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
          <Button
            loading={isLoading}
            onPress={handleSubmit}
            style={{ marginTop: 10 }}
          >
            <Typo fontWeight={"700"} color={colors.black} size={21}>
              {t("sign_up")}
            </Typo>
          </Button>
        </View>
        {/* {=======================( ----> Footer Of login Page (0005ElhamKohistani) )=========================== */}
        <View style={styles.footer}>
          <Typo size={15}>{t("already_have_account")}</Typo>
          <Pressable onPress={() => router.navigate("/(auth)/login")}>
            <Typo size={15} fontWeight={"700"} color={colors.primary}>
              {t("sign_in")}
            </Typo>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
// export default Register
const styles = StyleSheet.create({
  container: {
    direction: "rtl",
    flex: 1,
    gap: spacingY._30,
    paddingHorizontal: spacingX._20,
  },
  wlcomeText: {
    fontSize: verticalScale(20),
    fontWeight: "bold",
    color: colors.text,
  },
  form: {
    gap: spacingY._10,
  },
  forgotPassword: {
    textAlign: "right",
    fontWeight: "500",
    color: colors.text,
  },
  footer: {
    padding: spacingY._30,
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
