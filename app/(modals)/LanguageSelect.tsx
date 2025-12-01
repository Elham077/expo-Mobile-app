import BackButton from "@/components/BackButton";
import Header from "@/components/Header";
import ModalWrapper from "@/components/ModalWrapper";
import Typo from "@/components/Typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { useRouter } from "expo-router";
import * as Icons from "phosphor-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, TouchableOpacity, View } from "react-native";
const languages = [
  { code: "fa", label: "فارسی" },
  { code: "ps", label: "پشتو" },
];

export default function LanguageModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const changeLanguage = async (lang: string) => {
    try {
      await i18n.changeLanguage(lang);
      router.back();
    } catch (error) {
      console.error("Language change failed:", error);
    }
  };

  return (
    <ModalWrapper scrollEnabled={false} keyboardAvoiding>
      <Header
        title={t("change_language")}
        leftIcon={<BackButton />}
        style={{
          marginBottom: spacingY._10,
          marginLeft: spacingX._20,
          marginTop: spacingY._30,
        }}
      />

      <View style={styles.container}>
        <Typo size={18} fontWeight="700" style={styles.title}>
          {t("select_language")}
        </Typo>

        <View style={styles.languageList}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              onPress={() => changeLanguage(lang.code)}
              style={[
                styles.languageItem,
                currentLanguage === lang.code && styles.selectedItem,
              ]}
            >
              <Typo size={16} style={styles.languageText}>
                {lang.label}
              </Typo>

              {currentLanguage === lang.code && (
                <Icons.CheckCircle
                  size={24}
                  weight="fill"
                  color={colors.primary}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ModalWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
    padding: spacingY._25,
    // backgroundColor: colors.white,
    borderRadius: radius._12,
    marginHorizontal: spacingX._20,
    maxHeight: "80%",
  },
  title: {
    color: colors.text,
    marginBottom: spacingY._25,
    textAlign: "center",
  },
  languageList: {
    gap: spacingY._12,
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacingY._15,
    backgroundColor: colors.neutral500,
    borderRadius: radius._10,
  },
  selectedItem: {
    backgroundColor: colors.neutral200,
  },
  languageText: {
    color: colors.neutral800,
  },
});
