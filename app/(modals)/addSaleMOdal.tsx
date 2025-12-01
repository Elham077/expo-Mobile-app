import BackButton from "@/components/BackButton";
import Button from "@/components/Button";
import Header from "@/components/Header";
import Input from "@/components/Input";
import Typo from "@/components/Typo";
import { firestore } from "@/config/firebase.client";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { useAuth } from "@/contexts/authContext";
import { createSell, updateSale } from "@/services/sellServices";
import { SellType } from "@/types";
import { verticalScale } from "@/utils/styling";
import { Picker } from "@react-native-picker/picker";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, TextInput, View } from "react-native";

type Props = {
  saleToEdit?: SellType;
  onSuccess?: () => void;
};

const SellForm: React.FC<Props> = ({ saleToEdit, onSuccess }) => {
  const editMode = !!saleToEdit;
  const { user } = useAuth();

  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>(
    saleToEdit?.inventoryProduct || ""
  );
  const [productDetails, setProductDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [quantity, setQuantity] = useState<number>(saleToEdit?.quantity || 1);
  const [loan, setLoan] = useState<"fullPaid" | "loan">(
    saleToEdit?.loan ? "loan" : "fullPaid"
  );
  const [loanAmount, setLoanAmount] = useState<number>(
    saleToEdit?.loanAmount || 0
  );
  const [priceAfterLoan, setPriceAfterLoan] = useState<number>(
    saleToEdit?.PriceAfterLoan || 0
  );
  const [discount, setDiscount] = useState<number>(saleToEdit?.discount || 0);
  const [customerName, setCustomerName] = useState(
    saleToEdit?.customerName || ""
  );
  const [customerNumber, setCustomerNumber] = useState<string>(
    saleToEdit?.customerNumber?.toString() || ""
  );
  const [description, setDescription] = useState(saleToEdit?.description || "");

  // Fetch products list
  useEffect(() => {
    const q = query(
      collection(firestore, "inventory"),
      where("quantity", ">", 0)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(items);
    });
    return () => unsubscribe();
  }, []);

  // Get selected product details
  useEffect(() => {
    if (!selectedProductId) return;
    const selected = products.find((p) => p.id === selectedProductId);
    if (selected) {
      setProductDetails(selected);
      // Reset quantity if in edit mode
      if (!editMode) {
        setQuantity(1);
      }
    }
  }, [selectedProductId, products]);

  // Calculate price after loan
  useEffect(() => {
    const basePrice = productDetails?.sellingPrice * quantity|| 0;
    const afterLoan = loan === "loan" ? basePrice - loanAmount : basePrice;
    setPriceAfterLoan(afterLoan - discount);
  }, [loanAmount, loan, productDetails, discount]);

  const validateForm = (): boolean => {
    if (!selectedProductId) {
      Alert.alert("خطا", "لطفاً یک محصول انتخاب کنید");
      return false;
    }

    if (!quantity || quantity <= 0) {
      Alert.alert("خطا", "تعداد باید بیشتر از صفر باشد");
      return false;
    }

    if (!editMode && quantity > (productDetails?.quantity || 0)) {
      Alert.alert("خطا", "تعداد انتخاب‌شده بیشتر از موجودی است");
      return false;
    }

    if (loan === "loan" && (!loanAmount || loanAmount <= 0)) {
      Alert.alert("خطا", "مبلغ قرض باید بیشتر از صفر باشد");
      return false;
    }

    if (loan === "loan" && loanAmount >= (productDetails?.sellingPrice * quantity || 0)) {
      Alert.alert("خطا", "مبلغ قرض باید کمتر از قیمت محصول باشد");
      return false;
    }

    if (discount < 0) {
      Alert.alert("خطا", "تخفیف نمی‌تواند منفی باشد");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    const sellData: SellType = {
      inventoryProduct: selectedProductId,
      quantity,
      Price: productDetails.sellingPrice,
      loan: loan === "loan",
      loanAmount: loan === "loan" ? loanAmount : 0,
      PriceAfterLoan: priceAfterLoan,
      discount,
      date: editMode ? saleToEdit?.date || new Date() : new Date(),
      customerName,
      customerNumber: customerNumber ? parseInt(customerNumber) : undefined,
      description,
      ownerName: user?.name || "unknown",
    };

    try {
      let result;
      if (editMode && saleToEdit?.id) {
        result = await updateSale(saleToEdit.id, sellData);
      } else {
        result = await createSell(sellData);
      }

      if (result.success) {
        Alert.alert("موفق", editMode ? "فروش بروزرسانی شد" : "فروش ثبت شد", [
          { text: "باشه", onPress: onSuccess },
        ]);
      } else {
        Alert.alert("خطا", result.msg || "مشکلی پیش آمد");
      }
    } catch (error) {
      Alert.alert("خطا", "خطایی در ارتباط با سرور رخ داد");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header
        title={"ثبت فروش"}
        leftIcon={<BackButton />}
        style={{ flexDirection: "row-reverse", marginBottom: spacingY._10 }}
      />
      <View style={styles.formGroup}>
        <Typo size={18} style={styles.label}>انتخاب محصول *</Typo>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedProductId}
            onValueChange={setSelectedProductId}
            enabled={!editMode}
            style={styles.picker}
          >
            <Picker.Item label="محصول را انتخاب کنید" value="" color={colors.textLight} style={{textAlign: "center"}}/>
            {products.map((product) => (
              <Picker.Item
                key={product.id}
                label={`${product.name} (موجودی: ${product.quantity})`}
                value={product.id}
              />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Typo size={18} style={styles.label}>تعداد *</Typo>
        <Input
        label=""
        error={null}
          keyboardType="numeric"
          value={quantity.toString()}
          onChangeText={(text) => setQuantity(Number(text) || 0)}
        />
        {productDetails && (
          <Typo style={styles.hint}>
            موجودی: {productDetails.quantity} | قیمت واحد:{" "}
            {productDetails.sellingPrice.toLocaleString()}
          </Typo>
        )}
      </View>

      <View style={styles.formGroup}>
        <Typo size={18} style={styles.label}>قیمت کل</Typo>
        <TextInput
          style={[styles.input, styles.disabledInput]}
          editable={false}
          value={
            productDetails
              ? (productDetails.sellingPrice * quantity).toLocaleString()
              : "0"
          }
        />
      </View>

      <View style={styles.formGroup}>
        <Typo size={18} style={styles.label}>نوع پرداخت *</Typo>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={loan}
            onValueChange={(value) => setLoan(value as "loan" | "fullPaid")}
            style={styles.picker}
          >
            <Picker.Item label="نقداً پرداخت شده" value="fullPaid" />
            <Picker.Item label="قرض" value="loan" />
          </Picker>
        </View>
      </View>

      {loan === "loan" && (
        <>
          <View style={styles.formGroup}>
            <Typo size={18} style={styles.label}>مقدار نسیه *</Typo>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={loanAmount.toString()}
              onChangeText={(text) => setLoanAmount(Number(text) || 0)}
            />
          </View>

          <View style={styles.formGroup}>
            <Typo size={18} style={styles.label}>قیمت پس از نسیه</Typo>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              editable={false}
              value={priceAfterLoan.toLocaleString()}
            />
          </View>
        </>
      )}

      <View style={styles.formGroup}>
        <Typo size={18} style={styles.label}>تخفیف (اختیاری)</Typo>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={discount.toString()}
          onChangeText={(text) => setDiscount(Number(text) || 0)}
          placeholder="مبلغ تخفیف"
        />
      </View>

      <View style={styles.formGroup}>
        <Typo size={18} style={styles.label}>نام مشتری</Typo>
        <TextInput
          style={styles.input}
          value={customerName}
          onChangeText={setCustomerName}
          placeholder="نام مشتری"
        />
      </View>

      <View style={styles.formGroup}>
        <Typo size={18} style={styles.label}>شماره مشتری</Typo>
        <Input
          label=""
          error={null}
          keyboardType="phone-pad"
          value={customerNumber}
          onChangeText={setCustomerNumber}
          placeholder="شماره تماس"
        />
      </View>

      <View style={styles.formGroup}>
        <Typo size={18} style={styles.label}>توضیحات</Typo>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          placeholder="توضیحات اضافی"
        />
      </View>
      <Button onPress={handleSubmit} disabled={loading}>
        <Typo size={18} fontWeight={"700"} color={colors.primaryDark}>
          {editMode ? "بروزرسانی فروش" : "ثبت فروش"}
        </Typo>
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    direction: "rtl",
    padding: 20,
    backgroundColor: colors.neutral900,
  },
  formGroup: {
    marginBottom: 15,
    backgroundColor: colors.neutral900
  },
  label: {
    direction: "rtl",
    marginTop: spacingY._12,
    marginBottom: spacingY._5,
  },
  input: {
    height: verticalScale(56),
    borderWidth: 1,
    borderColor: colors.neutral350,
    borderRadius: 16,
    padding: 10,
    fontSize: 16,
  },
  disabledInput: {
    backgroundColor: "#f5f5f5",
    color: "#666",
  },
  pickerContainer: {
    color: colors.neutral600,
    height: verticalScale(54),
    borderWidth: 1,
    borderColor: colors.neutral300,
    paddingHorizontal: spacingX._15,
    borderRadius: radius._15,
    justifyContent: "center",
    marginTop: spacingY._5,
    overflow: "hidden",
  },
  picker: {
    height: verticalScale(70),
    borderWidth: 1,
    borderColor: colors.neutral300,
    paddingHorizontal: spacingX._15,
    borderRadius: radius._15,
    justifyContent: "center",
    marginTop: spacingY._5,
    fontSize: verticalScale(14),
    textAlign: "center",
    alignItems: "center",
    paddingVertical: spacingY._5,
    width: "100%",
    backgroundColor: colors.neutral900,
    color: colors.textLight
  },
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
  },
  hint: {
    fontSize: 12,
    color: colors.neutral500,
    marginTop: 5,
  },
});

export default SellForm;
