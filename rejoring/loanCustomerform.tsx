import { getLoanSales, settleLoan } from "@/services/sellServices";
import { SellType } from "@/types";
import { useEffect, useState } from "react";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";

const LoanListScreen = () => {
  const [loanSales, setLoanSales] = useState<SellType[]>([]);

  useEffect(() => {
    const fetchLoans = async () => {
      const data = await getLoanSales();
      setLoanSales(data);
    };
    fetchLoans();
  }, []);

  // در داخل تابع handleSettleLoan
  const handleSettleLoan = async (sale: SellType) => {
    Alert.alert(
      "تسویه حساب",
      `آیا می‌خواهی قرض ${sale.customerName} را تسویه کنی؟`,
      [
        { text: "لغو", style: "cancel" },
        {
          text: "بله، تسویه کن",
          onPress: async () => {
            const success = await settleLoan(sale.id!, sale.Price);
            if (success) {
              alert("تسویه حساب موفقانه انجام شد");
              // لیست را دوباره تازه کن
              const data = await getLoanSales();
              setLoanSales(data);
            } else {
              alert("خطا در تسویه حساب");
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: SellType }) => (
    <View className="p-4 border-b border-gray-300">
      <Text className="font-bold">{item.customerName}</Text>
      <Text>مقدار قرض: {item.loanAmount} افغانی</Text>
      <Text>مقدار پرداخت‌شده: {item.PriceAfterLoan} افغانی</Text>
      <Text>شماره تماس: {item.customerNumber || "نامشخص"}</Text>

      <TouchableOpacity
        onPress={() => handleSettleLoan(item)}
        className="mt-2 bg-green-600 rounded p-2"
      >
        <Text className="text-white text-center">تسویه حساب</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      data={loanSales}
      keyExtractor={(item) => item.id!}
      renderItem={renderItem}
    />
  );
};

export default LoanListScreen;
