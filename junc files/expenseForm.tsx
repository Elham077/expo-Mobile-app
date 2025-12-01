import { View, Text, TextInput, Button, Alert } from "react-native";
import { useState } from "react";
import { useAuth } from "@/contexts/authContext";
import { addExpense } from "@/services/expense";

const ExpenseForm = () => {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!title || !amount) {
      return Alert.alert("خطا", "عنوان و مبلغ الزامی است.");
    }

    const success = await addExpense({
      title,
      amount: Number(amount),
      description,
      date: new Date(),
      ownerName: user?.name || "unknown",
    });

    if (success) {
      Alert.alert("موفق", "هزینه ثبت شد");
      setTitle("");
      setAmount("");
      setDescription("");
    } else {
      Alert.alert("خطا", "ثبت هزینه با مشکل مواجه شد");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>عنوان هزینه</Text>
      <TextInput value={title} onChangeText={setTitle} style={{ borderBottomWidth: 1 }} />

      <Text>مبلغ</Text>
      <TextInput
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={{ borderBottomWidth: 1 }}
      />

      <Text>توضیحات</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        style={{ borderBottomWidth: 1, marginBottom: 20 }}
        multiline
      />

      <Button title="ثبت هزینه" onPress={handleSubmit} />
    </View>
  );
};

export default ExpenseForm;
