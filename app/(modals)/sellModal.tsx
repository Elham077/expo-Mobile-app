// app/(tabs)/sell/new.tsx
import { useForm, Controller } from "react-hook-form";
import { Text, TextInput, View, Button, Alert, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import { firestore } from "@/config/firebase.client";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import { useAuth } from "@/contexts/authContext"; // فرضی: برای دریافت user
import { createSell } from "@/services/sellServices";
import { InventoryProduct, SellType } from "@/types";



export default function SellNewScreen() {
  const { user } = useAuth(); // فرضی
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<InventoryProduct | null>(null);
  const [loan, setLoan] = useState(false);

  const { control, handleSubmit, watch, setValue } = useForm<SellType>({
    defaultValues: {
      quantity: 1,
      loan: false,
      date: new Date(),
    },
  });

  const watchedQuantity = watch("quantity");
  const watchedLoanAmount = watch("loanAmount");

  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(firestore, "inventory"));
      const list: InventoryProduct[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.quantity > 0) {
          list.push({
            id: doc.id,
            name: data.name,
            quantity: data.quantity,
            sellingPrice: data.sellingPrice,
          });
        }
      });
      setProducts(list);
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      setValue("Price", selectedProduct.sellingPrice);
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (loan && watchedLoanAmount != null && selectedProduct) {
      const result = selectedProduct.sellingPrice - watchedLoanAmount;
      setValue("PriceAfterLoan", result);
    }
  }, [watchedLoanAmount, loan]);

  const onSubmit = async (data: SellType) => {
  if (!selectedProduct) return;

  const result = await createSell({
    ...data,
    inventoryProduct: selectedProduct.id,
    Price: selectedProduct.sellingPrice,
    ownerName: user?.name || "ناشناس",
    date: new Date(),
  });

  if (result.success) {
    Alert.alert("موفق", "فروش با موفقیت ثبت شد");
  } else {
    Alert.alert("خطا", result.msg || "ثبت فروش ناموفق بود");
  }
};

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text>محصول</Text>
      <Picker
        selectedValue={selectedProduct?.id}
        onValueChange={(itemValue) => {
          const prod = products.find((p) => p.id === itemValue);
          if (prod) {
            setSelectedProduct(prod);
            setValue("inventoryProduct", prod.name);
          }
        }}
      >
        {products.map((product) => (
          <Picker.Item
            key={product.id}
            label={`${product.name} (${product.quantity})`}
            value={product.id}
          />
        ))}
      </Picker>

      <Text>تعداد</Text>
      <Controller
        control={control}
        name="quantity"
        render={({ field: { onChange, value } }) => (
          <TextInput
            keyboardType="numeric"
            value={value?.toString()}
            onChangeText={(val) => onChange(Number(val))}
          />
        )}
      />

      <Text>قیمت</Text>
      <Controller
        control={control}
        name="Price"
        render={({ field: { value } }) => (
          <TextInput value={value?.toString()} editable={false} />
        )}
      />

      <Text>نوع پرداخت</Text>
      <Picker
        selectedValue={loan ? "loan" : "fullPaid"}
        onValueChange={(val) => {
          const isLoan = val === "loan";
          setLoan(isLoan);
          setValue("loan", isLoan);
        }}
      >
        <Picker.Item label="نقداً (Full Paid)" value="fullPaid" />
        <Picker.Item label="قرض (Loan)" value="loan" />
      </Picker>

      {loan && (
        <>
          <Text>مقدار قرض</Text>
          <Controller
            control={control}
            name="loanAmount"
            render={({ field: { onChange, value } }) => (
              <TextInput
                keyboardType="numeric"
                value={value?.toString()}
                onChangeText={(val) => onChange(Number(val))}
              />
            )}
          />
          <Text>بعد قرض (قیمت باقی‌مانده)</Text>
          <Controller
            control={control}
            name="PriceAfterLoan"
            render={({ field: { value } }) => (
              <TextInput value={value?.toString()} editable={false} />
            )}
          />
        </>
      )}

      <Text>تخفیف (اختیاری)</Text>
      <Controller
        control={control}
        name="discount"
        render={({ field: { onChange, value } }) => (
          <TextInput
            keyboardType="numeric"
            value={value?.toString()}
            onChangeText={(val) => onChange(Number(val))}
          />
        )}
      />

      <Text>نام مشتری</Text>
      <Controller
        control={control}
        name="customerName"
        render={({ field: { onChange, value } }) => (
          <TextInput value={value} onChangeText={onChange} />
        )}
      />

      <Text>شماره مشتری</Text>
      <Controller
        control={control}
        name="customerNumber"
        render={({ field: { onChange, value } }) => (
          <TextInput
            keyboardType="numeric"
            value={value?.toString()}
            onChangeText={(val) => onChange(Number(val))}
          />
        )}
      />

      <Text>توضیحات</Text>
      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, value } }) => (
          <TextInput value={value} onChangeText={onChange} multiline />
        )}
      />

      <Button title="ثبت فروش" onPress={handleSubmit(onSubmit)} />
    </ScrollView>
  );
}
