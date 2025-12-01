import React, { useState } from "react";
import { View, TextInput, Button, Text, Alert } from "react-native";
import { useAuth } from "@/contexts/authContext";
import { sendAdminMessage } from "@/services/adminMSG";

const SendMessage = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { user } = useAuth();

  const handleSend = async () => {
    if (!title || !content) {
      return Alert.alert("خطا", "همه فیلدها را پر کنید");
    }

    const success = await sendAdminMessage({
      title,
      content,
      sender: user?.name || "Unknown",
      date: new Date(),
    });

    if (success) {
      Alert.alert("موفق", "پیام ارسال شد");
      setTitle("");
      setContent("");
    } else {
      Alert.alert("خطا", "ارسال پیام با مشکل مواجه شد");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>عنوان پیام</Text>
      <TextInput value={title} onChangeText={setTitle} style={{ borderBottomWidth: 1 }} />

      <Text style={{ marginTop: 10 }}>متن پیام</Text>
      <TextInput
        value={content}
        onChangeText={setContent}
        multiline
        style={{ borderWidth: 1, marginTop: 5, height: 100, padding: 8 }}
      />

      <Button title="ارسال پیام" onPress={handleSend} />
    </View>
  );
};

export default SendMessage;
