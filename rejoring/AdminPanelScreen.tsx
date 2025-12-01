import { colors } from "@/constants/theme";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  deleteUser,
  fetchAllUsers,
  updateUserRole,
} from "../../services/userServices";
import { UserType } from "../../types"; // اگر اینجا تایپ جدا ساختی

const AdminPanelScreen = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    const allUsers = await fetchAllUsers();
    // Ensure each user matches UserType shape
    const formattedUsers: UserType[] = allUsers.map((user: any) => ({
      uid: user.uid ?? user.id ?? "",
      email: user.email ?? null,
      name: user.name ?? null,
      number: user.number ?? null,
      address: user.address ?? null,
      role: user.role ?? "user",
      isEmployee: user.isEmployee === "Employee" || user.isEmployee === "NotAnEmployee" ? user.isEmployee : "Employee",
      image: user.image ?? null,
    }));
    setUsers(formattedUsers);
    setLoading(false);
  };

  const handleRoleChange = async (uid: string, currentRole: string) => {
    const nextRole =
      currentRole === "admin"
        ? "user"
        : currentRole === "user"
        ? "manager"
        : "admin";
    await updateUserRole(uid, nextRole);
    await loadUsers();
  };

  const handleDelete = async (uid: string) => {
    Alert.alert("تأیید حذف", "آیا مطمئن هستی که می‌خواهی کاربر را حذف کنی؟", [
      { text: "لغو" },
      {
        text: "حذف",
        onPress: async () => {
          await deleteUser(uid);
          await loadUsers();
        },
        style: "destructive",
      },
    ]);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 400 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>مدیریت کاربران</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item?.uid || Math.random().toString()}
        renderItem={({ item }) =>
          item ? (
            <View style={styles.card}>
              {item.image && (
                <Image source={{ uri: item.image }} style={styles.image} />
              )}
              <Text>نام: {item.name || "ناموجود"}</Text>
              <Text>ایمیل: {item.email || "ندارد"}</Text>
              <Text>شماره تماس: {item.number || "ندارد"}</Text>
              <Text>آدرس: {item.address || "ندارد"}</Text>
              <Text>نقش: {item.role}</Text>

              <View style={styles.buttonRow}>
                <Button
                  title="تغییر نقش"
                  onPress={() => handleRoleChange(item.uid!, item.role!)}
                />
                <Button
                  title="حذف"
                  color="red"
                  onPress={() => handleDelete(item.uid!)}
                />
              </View>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.neutral900,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    alignSelf: "center",
    color: colors.textLight,
  },
  card: {
    direction: "rtl",
    backgroundColor: colors.neutral300,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: colors.white,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
});

export default AdminPanelScreen;
