import { useEffect, useState } from "react";
import { Text, View, FlatList } from "react-native";
import { getAllSales } from "@/services/sellServices";
import { SellType } from "@/types";
import { useLocalSearchParams } from "expo-router";
import SellForm from "./addSaleMOdal";

const SalesListScreen = () => {
  const [sales, setSales] = useState<SellType[]>([]);
const { id } = useLocalSearchParams();
  const [saleToEdit, setSaleToEdit] = useState<SellType | undefined>(undefined);

  useEffect(() => {
    const fetchSales = async () => {
      const data = await getAllSales();
      setSales(data);
    };
    fetchSales();
  }, []);
useEffect(() => {
    if (id) {
      getAllSales().then((sales) => {
        const sale = sales.find((s) => s.id === id);
        if (sale) setSaleToEdit(sale);
      });
    }
  }, [id]);

  const renderItem = ({ item }: { item: SellType }) => (
    <View className="p-4 border-b border-gray-300">
      <Text className="font-bold text-lg">{item.inventoryProduct}</Text>
      <Text>تعداد: {item.quantity}</Text>
      <Text>قیمت: {item.Price}</Text>
      {item.discount ? <Text>تخفیف: {item.discount}</Text> : null}
      <Text>مشتری: {item.customerName || "ناشناخته"}</Text>
      <Text>وضعیت پرداخت: {item.loan ? "قرض" : "پرداخت‌شده"}</Text>
      <Text>فروشنده: {item.ownerName || "نامشخص"}</Text>
      <Text className="text-gray-500 text-sm">تاریخ: {new Date(item.date as any).toLocaleString()}</Text>
    </View>
  );

  return (
    <FlatList
      data={sales}
      keyExtractor={(item) => item.id!}
      renderItem={renderItem}
    />
  );
};

export default SalesListScreen;
