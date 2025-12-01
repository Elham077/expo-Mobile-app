import ImageUpload from "@/components/imageUpload";
import Typo from "@/components/Typo";
import { db } from "@/config/firebase.client";
import { colors, spacingY } from "@/constants/theme";
import { useAuth } from "@/contexts/authContext";
import { addDoc, collection } from "firebase/firestore";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { Button, TextInput } from "react-native-paper";

const BrandForm = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [brand, setBrand] = useState({
    name: "",
    businessName: "",
    category: "",
    country: "",
    website: "",
    description: "",
    logo: "",
  });

  const categories = [
    { label: "تجهیزات پزشکی عمومی", value: "general" },
    { label: "تجهیزات تصویربرداری", value: "imaging" },
    { label: "تجهیزات آزمایشگاهی", value: "lab" },
    { label: "تجهیزات بیمارستانی", value: "hospital" },
    { label: "ایرانی", value: "iranian" },
  ];

  const countries = [
    { label: "آمریکا", value: "usa" },
    { label: "آلمان", value: "germany" },
    { label: "ژاپن", value: "japan" },
    { label: "ایران", value: "iran" },
    // ... سایر کشورها
  ];

  const handleSubmit = async () => {
    if (!brand.name) {
      Alert.alert("خطا", "نام برند الزامی است");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "brands"), {
        ...brand,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: user?.uid,
      });
      Alert.alert("موفق", "برند با موفقیت ثبت شد");
      setBrand({
        name: "",
        businessName: "",
        category: "",
        country: "",
        website: "",
        description: "",
        logo: "",
      });
    } catch (error) {
      Alert.alert("خطا", "مشکلی در ثبت برند پیش آمد");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ثبت برند جدید</Text>

      <TextInput
        label="نام برند *"
        value={brand.name}
        onChangeText={(text) => setBrand({ ...brand, name: text })}
        style={styles.input}
        mode="outlined"
      />
      <Typo size={18} color={colors.black} style={styles.productLabel}>
        نام تجاری برند
      </Typo>
      <TextInput
        value={brand.businessName}
        onChangeText={(text) => setBrand({ ...brand, businessName: text })}
        style={styles.input}
        mode="outlined"
      />
      <Dropdown
        data={categories}
        value={brand.category}
        onChange={(item) => setBrand({ ...brand, category: item.value })}
        style={styles.input}
        labelField="label"
        valueField="value"
      />
      <Dropdown
        placeholder="کشور سازنده"
        data={countries}
        value={brand.country}
        onChange={(item) => setBrand({ ...brand, country: item.value })}
        style={styles.input}
        labelField="label"
        valueField="value"
      />
      <TextInput
        placeholder="وبسایت (اختیاری)"
        value={brand.website}
        onChangeText={(text) => setBrand({ ...brand, website: text })}
        style={styles.input}
        mode="outlined"
        keyboardType="url"
      />

      <TextInput
        label="توضیحات (اختیاری)"
        value={brand.description}
        onChangeText={(text) => setBrand({ ...brand, description: text })}
        style={[styles.input, { height: 100 }]}
        mode="outlined"
        multiline
      />

      <ImageUpload
        placeholder="لوگوی برند"
        file={brand.logo}
        onSelect={(uri) => setBrand({ ...brand, logo: uri })}
        onClear={() => setBrand({ ...brand, logo: "" })}
      />

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        disabled={loading || !brand.name}
        style={styles.button}
      >
        ثبت برند
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  productLabel: {
    direction: "rtl",
    marginTop: spacingY._12,
    marginBottom: spacingY._5,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  button: {
    marginTop: 20,
    paddingVertical: 5,
  },
});

export default BrandForm;
