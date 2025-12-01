// app/(tabs)/sales.tsx

import React, { useEffect, useState } from "react";
import { View, FlatList, ActivityIndicator, StyleSheet, Alert, Pressable } from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "@/config/firebase.client";
import { SellType } from "@/types";
import Typo from "@/components/Typo";
import { colors, spacingY } from "@/constants/theme";
import { deleteSaleAndUpdateInventory } from "@/services/sellServices";
import * as Icon from "phosphor-react-native"
const SalesList = () => {
  const [sales, setSales] = useState<SellType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const salesSnapshot = await getDocs(collection(firestore, "sales"));
        const salesData: SellType[] = salesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as SellType[];
        setSales(salesData);
      } catch (error) {
        console.error("خطا در دریافت فروش‌ها:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color={colors.primary} />;
  }
const handleDelete = async (saleId: string) => {
  Alert.alert("حذف فروش", "آیا مطمئن هستید؟", [
    { text: "لغو" },
    {
      text: "حذف",
      style: "destructive",
      onPress: async () => {
        const res = await deleteSaleAndUpdateInventory(saleId);
        if (res.success) {
          setSales((prev) => prev.filter((s) => s.id !== saleId));
        } else {
          Alert.alert("خطا", res.msg || "حذف انجام نشد");
        }
      },
    },
  ]);
};
  const renderItem = ({ item }: { item: SellType }) => (
    <View style={styles.itemContainer}>
      <Typo size={16} fontWeight="bold">{item.inventoryProduct}</Typo>
      <Typo size={14}>مشتری: {item.customerName || "بدون نام"}</Typo>
      <Typo size={14}>قیمت: {item.Price?.toLocaleString()} ریال</Typo>
      <Typo size={14}>
        وضعیت: {item.loan ? "قرضی" : "پرداخت کامل"}
      </Typo>
      <Typo size={12} color={colors.neutral400}>
        فروشنده: {item.ownerName || "نامشخص"}
      </Typo>
      <Typo size={12} color={colors.neutral300}>
        تاریخ: {(
          item.date && typeof item.date === "object" && "toDate" in item.date
            ? item.date.toDate()
            : new Date(item.date)
        ).toLocaleDateString("fa-IR")}
      </Typo>
      <Pressable
  style={{ position: "absolute", right: 10, top: 10 }}
  onPress={() => handleDelete(item.id!)}
>
  <Icon.Trash color="red" size={20} />
</Pressable>;
    </View>
  );

  return (
    <FlatList
      data={sales}
      keyExtractor={(item) => item.id!}
      renderItem={renderItem}
      contentContainerStyle={{ padding: spacingY._10 }}
    />
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: colors.neutral800,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.neutral600,
  },
});

export default SalesList;
