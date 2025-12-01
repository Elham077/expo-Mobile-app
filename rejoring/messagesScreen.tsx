import { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { getAllAdminMessages } from "@/services/adminMSG";
import { AdminMSG } from "@/types";

const Messages = () => {
  const [messages, setMessages] = useState<AdminMSG[]>([]);

  useEffect(() => {
    getAllAdminMessages().then(setMessages);
  }, []);

  const renderItem = ({ item }: { item: AdminMSG }) => (
    <View style={{ backgroundColor: "#e5e5e5", margin: 10, padding: 12, borderRadius: 8 }}>
      <Text style={{ fontWeight: "bold", fontSize: 16 }}>{item.title}</Text>
      <Text style={{ marginTop: 4 }}>{item.content}</Text>
      <Text style={{ marginTop: 6, fontSize: 12, color: "#555" }}>
        🕓 {new Date(item.date as string).toLocaleString()} – 👤 {item.sender}
      </Text>
    </View>
  );

  return (
    <FlatList
      data={messages}
      keyExtractor={(item) => item.id!}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 10 }}
    />
  );
};

export default Messages;
