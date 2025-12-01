import { useEffect, useState } from "react";
import { View, Text, FlatList, Alert, Button } from "react-native";
import { getAllSales, deleteSaleAndUpdateInventory } from "@/services/sellServices";
import { SellType } from "@/types";
import { useRouter } from "expo-router";

const SalesList = () => {
  const [sales, setSales] = useState<SellType[]>([]);
  const router = useRouter();

  const loadSales = async () => {
    const data = await getAllSales();
    setSales(data);
  };

  useEffect(() => {
    loadSales();
  }, []);

  const handleDelete = (sale: SellType) => {
    Alert.alert(
      "حذف فروش",
      `آیا مطمئن هستید که می‌خواهید فروش ${sale.customerName || "نامشخص"} را حذف کنید؟`,
      [
        { text: "خیر" },
        {
          text: "بله، حذف شود",
          onPress: async () => {
            const res = await deleteSaleAndUpdateInventory(sale.id!);
            if (res.success) {
              Alert.alert("حذف شد", "فروش با موفقیت حذف شد");
              loadSales();
            } else {
              Alert.alert("خطا", res.msg || "مشکلی پیش آمد");
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: SellType }) => (
    <View
      style={{
        backgroundColor: "#f4f4f5",
        marginVertical: 6,
        padding: 12,
        borderRadius: 10,
      }}
    >
      <Text>📦 محصول: {item.inventoryProduct}</Text>
      <Text>👤 مشتری: {item.customerName || "ندارد"}</Text>
      <Text>📅 تاریخ: {new Date(item.date as string).toLocaleDateString()}</Text>
      <Text>🔢 تعداد: {item.quantity}</Text>
      <Text>💰 قیمت کل: {item.Price} × {item.quantity} = {item.Price * item.quantity}</Text>
      <Text>💳 وضعیت: {item.loan ? "قرضی" : "نقدی"}</Text>

      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
        <Button
          title="✏️ ویرایش"
          onPress={() => router.push({ pathname: "/(modals)/addSaleMOdal", params: { id: item.id } })}
        />
        <Button title="🗑 حذف" color="crimson" onPress={() => handleDelete(item)} />
      </View>
    </View>
  );

  return (
    <FlatList
      data={sales}
      keyExtractor={(item) => item.id!}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 20 }}
      ListEmptyComponent={<Text>هیچ فروشی ثبت نشده است.</Text>}
    />
  );
};

export default SalesList;
