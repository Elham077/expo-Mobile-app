// AdminMessageForm.tsx
import Typo from "@/components/Typo";
import { colors, radius, spacingY } from "@/constants/theme";
import { saveAdminMessage } from "@/services/adminMessages";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, TextInput, View } from "react-native";
// services/auth.ts

import BackButton from "@/components/BackButton";
import Button from "@/components/Button";
import Header from "@/components/Header";
import Input from "@/components/Input";
import { useAuth } from "@/contexts/authContext"; // مسیرت رو تنظیم کن
import { uploadFileToCloudinary } from "@/services/imageServices";

const AdminMessageForm = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const useAdminName = (): string => {
    const { user } = useAuth();
    return user?.name || user?.email || "ادمین ناشناس";
  };
  const adminName = useAdminName();
  const handleSubmit = async () => {
    if (!title.trim() || !message.trim()) {
      Alert.alert("خطا", "عنوان و پیام نمی‌توانند خالی باشند.");
      return;
    }
    const newMessage = {
      title,
      message,
      created: new Date(),
      adminUserName: adminName,
    };

    try {
      await saveAdminMessage(newMessage);
      Alert.alert("موفق", "پیام ارسال شد!");
      router.back();
    } catch (err) {
      Alert.alert("خطا", "در ذخیره پیام مشکلی پیش آمد.");
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={"عنوان پیام"}
        leftIcon={<BackButton />}
        style={{ flexDirection: "row-reverse", marginBottom: spacingY._20 }}
      />
      <Typo size={20} fontWeight={"600"} style={styles.label}>
        عنوان
      </Typo>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
      />

      <Typo size={20} fontWeight={"600"} style={styles.label}>
        متن پیام
      </Typo>
      <TextInput
        placeholder="متن پیام..."
        placeholderTextColor={colors.text}
        multiline
        numberOfLines={5}
        style={[styles.input, styles.textArea]}
        value={message}
        onChangeText={setMessage}
      />

      <Button onPress={handleSubmit}>
        <Typo>ارسال پیام</Typo>
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    direction: "ltr",
    height: "100%",
    padding: 16,
    gap: spacingY._10,
    backgroundColor: colors.neutral900,
  },
  label: {
    textAlign: "right",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.neutral600,
    borderRadius: radius._10,
    padding: spacingY._12,
    color: colors.white,
    textAlign: 'right', // راست‌چین کردن متن ورودی
    writingDirection: 'rtl', // جهت نوشتار راست به چپ
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 16,
    borderColor: colors.neutral350,
    minHeight: 120,
    textAlignVertical: "top",
  },
});

export default AdminMessageForm;
