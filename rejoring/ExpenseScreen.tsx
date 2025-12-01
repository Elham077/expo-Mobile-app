// components/ExpenseForm.tsx
import Button from "@/components/Button";
import ImageUpload from "@/components/imageUpload";
import Input from "@/components/Input";
import Typo from "@/components/Typo";
import { db } from "@/config/firebase.client";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { uploadFileToCloudinary } from "@/services/imageServices";
import { verticalScale } from "@/utils/styling";
import { useLocalSearchParams, useRouter } from "expo-router";
import { addDoc, collection, doc, getDoc, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, StyleSheet, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import BackButton from "@/components/BackButton";
import Header from "@/components/Header";
import ModalWrapper from "@/components/ModalWrapper";
import { expenseCategories } from "@/constants/expenceData";
import { useAuth } from "@/contexts/authContext";
import { ExpensesType } from "@/types";
const ExpenseForm = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const [form, setForm] = useState<ExpensesType>({
    category: "عمومی",
    expenseCost: 0,
    description: "",
    image: null,
    ownerName: user?.name ?? "",
  });

  useEffect(() => {
    const loadExpense = async () => {
      if (id) {
        setLoading(true);
        try {
          const docRef = doc(db, "expenses", id as string);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data() as ExpensesType;
            setForm({
              ...data,
              created: data.created?.toString(),
            });
          }
        } catch (error) {
          Alert.alert("خطا", "خطا در دریافت اطلاعات هزینه");
        } finally {
          setLoading(false);
        }
      }
    };

    loadExpense();
  }, [id]);

  const handleSubmit = async () => {
    if (!form.expenseCost || form.expenseCost <= 0) {
      return Alert.alert("خطا", "مبلغ هزینه باید بیشتر از صفر باشد");
    }

    setLoading(true);
    let imageUrl = form.image || null;

    try {
      // آپلود عکس اگر وجود دارد
      const isLocalImage =
        typeof imageUrl === "string" &&
        imageUrl.trim() !== "" &&
        !imageUrl.startsWith("http");

      if (isLocalImage) {
        const uploadRes = await uploadFileToCloudinary(imageUrl, "products");
        if (!uploadRes.success) {
          throw new Error(uploadRes.msg || "Upload failed");
        }
        imageUrl = uploadRes.data;
      }

      const expenseData: ExpensesType = {
        ...form,
        image: imageUrl,
        expenseCost: Number(form.expenseCost),
        created: id ? form.created : new Date().toISOString(),
      };

      if (id) {
        // ویرایش هزینه موجود
        await setDoc(doc(db, "expenses", id as string), expenseData);
        Alert.alert("موفق", "هزینه با موفقیت ویرایش شد");
      } else {
        // ایجاد هزینه جدید
        await addDoc(collection(db, "expenses"), expenseData);
        Alert.alert("موفق", "هزینه جدید ثبت شد");
      }

      router.back();
    } catch (error) {
      console.error("Error saving expense:", error);
      Alert.alert("خطا", "خطا در ذخیره اطلاعات هزینه");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper scrollEnabled keyboardAvoiding>
      <View style={styles.container}>
        <Header
          title={t("add_expense")}
          leftIcon={<BackButton />}
          style={{ flexDirection: "row-reverse", marginBottom: spacingY._20 }}
        />
        <Typo size={18} style={styles.sectionTitle}>
          دسته‌بندی هزینه
        </Typo>
        <Dropdown
          style={styles.dropDownContainer}
          activeColor={colors.neutral700}
          placeholderStyle={styles.dropdownPlaceholder}
          selectedTextStyle={styles.dropdownSelectedText}
          iconStyle={styles.dropdownIcon}
          data={Object.values(expenseCategories)}
          maxHeight={300}
          labelField="label"
          valueField="value"
          itemTextStyle={styles.dropdownItemText}
          itemContainerStyle={styles.dropdownItemContainer}
          containerStyle={styles.dropdwnListContainer}
          placeholder={t("select_category")}
          value={form.category}
          onChange={(item) => {
            setForm({ ...form, category: item.value || "" });
          }}
        />
        <Typo size={18} style={styles.sectionTitle}>
          مبلغ هزینه (افغانی)
        </Typo>
        <Input
          error={null}
          label=""
          keyboardType="numeric"
          value={form.expenseCost.toString()}
          onChangeText={(text) => {
            const num = parseFloat(text) || 0;
            setForm({ ...form, expenseCost: num });
          }}
          placeholder="مبلغ را وارد کنید"
        />

        <Typo size={18} style={styles.sectionTitle}>
          توضیحات (اختیاری)
        </Typo>
        <Input
          error={null}
          label=""
          multiline
          numberOfLines={3}
          value={form.description}
          onChangeText={(text) => setForm({ ...form, description: text })}
          placeholder="توضیحات هزینه"
        />

        <Typo size={18} style={styles.sectionTitle}>
          تصویر فاکتور (اختیاری)
        </Typo>
        <ImageUpload
          file={form.image}
          onClear={() => setForm({ ...form, image: "" })}
          onSelect={(file) => setForm({ ...form, image: file })}
        />
        <Button
          loading={loading}
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Typo size={18} fontWeight={"800"} color={colors.black}>{id ? "ذخیره تغییرات" : "ثبت هزینه"}</Typo>
        </Button>
      </View>
    </ModalWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.neutral900,
  },
  dropdwnListContainer: {
    backgroundColor: colors.neutral800, // تضاد مناسب با متن سفید
    borderRadius: radius._15,
    width: "100%",
    textAlign: "center",
    paddingVertical: spacingY._7,
    marginTop: spacingY._5,
    borderColor: colors.neutral500,
    borderWidth: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  dropDownContainer: {
    height: verticalScale(54),
    borderWidth: 1,
    borderColor: colors.neutral300,
    paddingHorizontal: spacingX._15,
    borderRadius: radius._15,
    justifyContent: "center",
    marginTop: spacingY._5,
  },
  dropdownItemText: {
    color: colors.white,
    textAlign: "center",
  },
  dropdownSelectedText: {
    color: colors.white,
    fontSize: verticalScale(14),
    textAlign: "center",
  },
  dropdownPlaceholder: {
    color: colors.neutral400,
  },
  dropdownItemContainer: {
    borderRadius: radius._15,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacingY._5,
  },

  dropdownIcon: {
    height: verticalScale(30),
    tintColor: colors.neutral300,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  submitButton: {
    marginTop: 24,
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 16,
    alignItems: "center",
  },
});

export default ExpenseForm;
// import ModalWrapper from "@/components/ModalWrapper";
// import { useRouter } from "expo-router";
// import { getAuth } from "firebase/auth";
// import { addDoc, collection, getFirestore } from "firebase/firestore";
// import React, { useState } from "react";
// import {
//   Alert,
//   ScrollView,
//   Text,
//   TextInput,
//   TouchableOpacity,
// } from "react-native";

// type ExpensesType = {
//   id?: string;
//   title: string;
//   category: string;
//   expenseCost: number;
//   description?: string;
//   uid?: string;
//   created?: string;
// };

// type Props = {
//   visible: boolean;
//   onClose: () => void;
//   onSuccess?: (expense: ExpensesType) => void;
// };

// const db = getFirestore();
// const auth = getAuth();

// const ExpenseModal: React.FC<Props> = ({ onSuccess }) => {
//   const router = useRouter();
//   const [form, setForm] = useState<ExpensesType>({
//     title: "",
//     expenseCost: 0,
//     category: "",
//     description: "",
//   });

//   const updateForm = (key: keyof ExpensesType, value: any) => {
//     setForm((prev) => ({ ...prev, [key]: value }));
//   };

//   const handleSubmit = async () => {
//     if (!form.title.trim()) {
//       return Alert.alert("Validation Error", "Title is required.");
//     }

//     if (isNaN(form.expenseCost) || form.expenseCost < 0) {
//       return Alert.alert("Validation Error", "Expense cost must be ≥ 0.");
//     }

//     const user = auth.currentUser;
//     if (!user)
//       return Alert.alert("Authentication Error", "User not logged in.");

//     const expense: ExpensesType = {
//       ...form,
//       uid: user.uid,
//       created: new Date().toISOString().split("T")[0], // YYYY-MM-DD
//     };

//     try {
//       await addDoc(collection(db, "expenses"), expense);
//       Alert.alert("Success", "Expense recorded successfully.");
//       onSuccess?.(expense);
//       setForm({ title: "", expenseCost: 0,category:"", description: "" }); // reset form
//     } catch (error) {
//       console.error(error);
//       Alert.alert("Error", "Failed to add expense.");
//     }
//   };

//   return (
//     <ModalWrapper scrollEnabled keyboardAvoiding>
//       <ScrollView contentContainerStyle={{ padding: 20 }}>
//         <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 20 }}>
//           Add Expense
//         </Text>

//         <Text>Title:</Text>
//         <TextInput
//           value={form.title}
//           onChangeText={(text) => updateForm("title", text)}
//           placeholder="e.g., Rent, Repair"
//           style={{ borderBottomWidth: 1, marginBottom: 15 }}
//         />

//         <Text>Expense Cost:</Text>
//         <TextInput
//           value={form.expenseCost.toString()}
//           onChangeText={(text) => updateForm("expenseCost", Number(text))}
//           keyboardType="numeric"
//           placeholder="e.g., 100"
//           style={{ borderBottomWidth: 1, marginBottom: 15 }}
//         />

//         <Text>Description (optional):</Text>
//         <TextInput
//           value={form.description}
//           onChangeText={(text) => updateForm("description", text)}
//           placeholder="e.g., Maintenance of ECG machine"
//           multiline
//           numberOfLines={4}
//           style={{
//             borderWidth: 1,
//             marginBottom: 20,
//             padding: 10,
//             borderRadius: 6,
//             textAlignVertical: "top",
//           }}
//         />

//         <TouchableOpacity
//           onPress={handleSubmit}
//           style={{
//             backgroundColor: "#4CAF50",
//             padding: 15,
//             borderRadius: 6,
//             marginBottom: 10,
//           }}
//         >
//           <Text style={{ color: "white", textAlign: "center" }}>
//             Submit Expense
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity onPress={() => router.back()}>
//           <Text style={{ color: "red", textAlign: "center" }}>Cancel</Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </ModalWrapper>
//   );
// };

// export default ExpenseModal;
