import Button from "@/components/Button";
import InventoryListItem from "@/components/InventoryListItem";
import ScreenWrapper from "@/components/ScreenWrapper";
import { colors } from "@/constants/theme";
import { useAuth } from "@/contexts/authContext";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import { collection, getFirestore, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { app } from "../../config/firebase.client";
import { InventoryType } from "../../types";

const db = getFirestore(app);

const InventoryScreen = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<
    "expireDate" | "created" | "updated" | "name"
  >("expireDate");
  const [products, setProducts] = useState<InventoryType[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<InventoryType | null>(
    null
  );
  const { user } = useAuth();
  const [form, setForm] = useState<InventoryType>({
    name: "",
    brand: "",
    description: "",
    purchasedPrice: 0,
    sellingPrice: 0,
    quantity: 0,
    expireDate: "",
    image: "",
    category: "",
    created: "",
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "inventory"), (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        ...(docSnap.data() as InventoryType),
        id: docSnap.id,
      }));
      setProducts(data);
    });
    return () => unsub();
  }, []);

  const filteredAndSorted = products
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      const getDate = (val: any) =>
        val &&
        typeof val === "object" &&
        "toDate" in val &&
        typeof val.toDate === "function"
          ? val.toDate()
          : new Date(val || "");
      const aDate = getDate(a[sortBy]);
      const bDate = getDate(b[sortBy]);
      return aDate.getTime() - bDate.getTime();
    });

  const totalPositiveQtyPrice = products
    .filter((p) => (p.quantity ?? 0) > 0)
    .reduce((sum, p) => sum + (p.purchasedPrice ?? 0) * (p.quantity ?? 0), 0);

  useEffect(() => {
    if (selectedProduct) {
      setForm(selectedProduct);
    } else {
      setForm({
        name: "",
        brand: "",
        description: "",
        purchasedPrice: 0,
        sellingPrice: 0,
        quantity: 0,
        expireDate: "",
        image: "",
        category: "",
        created: "",
      });
    }
  }, [selectedProduct]);

  return (
    <ScreenWrapper style={styles.container}>
      <View style={styles.summaryContainer}>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>{t("total_price")}</Text>
          <Text style={styles.summaryValue}>{totalPositiveQtyPrice} AF</Text>
        </View>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>{t("total_products")}</Text>
          <Text style={styles.summaryValue}>{products.length}</Text>
        </View>
      </View>

      <View style={styles.searchSortContainer}>
        <TextInput
          placeholder={t("search_by_name")}
          placeholderTextColor={colors.black}
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={sortBy}
            style={styles.sortPicker}
            onValueChange={(itemValue) => setSortBy(itemValue)}
          >
            <Picker.Item label={t("expire_date")} value="expireDate" />
            <Picker.Item label={t("created_date")} value="created" />
            <Picker.Item label={t("updated_date")} value="updated" />
            <Picker.Item label={t("name")} value="name" />
          </Picker>
        </View>
      </View>

      <FlatList
        data={filteredAndSorted}
        keyExtractor={(item) => item.id!}
        renderItem={({ item, index }) => (
          <InventoryListItem item={item} index={index} />
        )}
      />

      {(user?.role === "admin" || user?.role === "manager") && (
        <Button
          style={styles.addButton}
          onPress={() => {
            setSelectedProduct(null);
            router.push("");
          }}
        >
          <Text style={styles.addText}>{t("add_product")}</Text>
        </Button>
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral900, padding: 12 },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flex: 1,
    marginHorizontal: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    justifyContent: "center", // مفید برای متن یا TextInput
  },
  summaryText: { fontSize: 12, color: "#000" },
  summaryValue: { fontSize: 16, fontWeight: "bold", color: "#000" },
  searchSortContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    height: 60,
    color: "#000",
  },
  pickerWrapper: {
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
  },
  sortPicker: { height: 60, width: 140, color: "#000" },
  addButton: {
    backgroundColor: "#a3e635",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 16,
  },
  addText: { color: "#000", fontWeight: "bold" },
});

export default InventoryScreen;
