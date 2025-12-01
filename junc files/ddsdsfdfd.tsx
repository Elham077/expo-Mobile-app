import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors } from "@/constants/theme";
import { Picker } from "@react-native-picker/picker";
// import * as Device from "expo-device";
// import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { InventoryType } from "../../types";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/config/firebase.client";

const InventoryScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<
    "expireDate" | "created" | "updated" | "name"
  >("expireDate");
  const [products, setProducts] = useState<InventoryType[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<InventoryType | null>(
    null
  );
  const [form, setForm] = useState<InventoryType>({ name: "", price: 0 });
  const filteredAndSorted = products
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      const aDate = new Date(a[sortBy] || "");
      const bDate = new Date(b[sortBy] || "");
      return aDate.getTime() - bDate.getTime();
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
  const totalPositiveQtyPrice = products
    .filter((p) => (p.quantity ?? 0) > 0)
    .reduce((sum, p) => sum + p.price, 0);
  
  useEffect(() => {
    if (selectedProduct) {
      setForm(selectedProduct);
    } else {
      setForm({ name: "", price: 0 });
    }
  }, [selectedProduct]);

  return (
    <ScreenWrapper style={styles.container}>
      <View style={styles.summaryContainer}>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>Total price</Text>
          <Text style={styles.summaryValue}>${totalPositiveQtyPrice}</Text>
        </View>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>Total Products</Text>
          <Text style={styles.summaryValue}>{products.length}</Text>
        </View>
      </View>

      <View style={styles.searchSortContainer}>
        <TextInput
          placeholder="Search by name"
          placeholderTextColor="#000"
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
            <Picker.Item label="Expire Date" value="expireDate" />
            <Picker.Item label="Created Date" value="created" />
            <Picker.Item label="Updated Date" value="updated" />
            <Picker.Item label="Name" value="name" />
          </Picker>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {filteredAndSorted.map((item) => {
          const isExpiringSoon =
            item.expireDate &&
            new Date(item.expireDate).getTime() - Date.now() <=
              30 * 24 * 60 * 60 * 1000;

          return (
            <TouchableOpacity
              key={item.id}
              style={styles.productCard}
              onPress={() => {
                setSelectedProduct(item);
                router.push("/(modals)/ProductAddScreen");
              }}
            >
              <View style={styles.productCardFirst}>
                {item.image && (
                  <Image
                    source={{ uri: item.image }}
                    style={styles.productImage}
                  />
                )}
                <View style={styles.insideChild}>
                  <Typo style={styles.productName}>
                    Product Name: {item.name}
                  </Typo>
                  <Typo style={styles.productDetail}>
                    Product price: ${item.price}
                  </Typo>
                  <Typo style={styles.productDetail}>
                    Product Quantity: {item.quantity}
                  </Typo>
                  {isExpiringSoon && (
                    <Text
                      style={{
                        alignSelf: "center",
                        color: "red",
                        fontWeight: "bold",
                      }}
                    >
                      ⚠️ Expiring Soon
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setSelectedProduct(null);
          router.push("/(modals)/ProductAddScreen");
        }}
      >
        <Text style={styles.addText}>+ Add Product</Text>
      </TouchableOpacity>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    direction: "ltr",
    flex: 1,
    backgroundColor: colors.neutral900,
    padding: 5,
  },
  formContainer: {
    direction: "ltr",
    flex: 1,
    backgroundColor: colors.neutral900,
    padding: 15,
    paddingTop: 30,
    paddingBottom: 30,
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  summaryBox: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginHorizontal: 4,
    alignItems: "center",
  },
  summaryText: {
    fontSize: 12,
    color: colors.black,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.black,
  },
  searchSortContainer: {
    gap: 4,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    marginHorizontal: 4,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 2,
    height: 60,
    color: colors.black,
  },
  pickerWrapper: {
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
  },
  sortPicker: {
    height: 60,
    width: 140,
    color: colors.black,
  },
  productLabel: {
    direction: "rtl",
    paddingRight: 30,
  },
  productCard: {
    backgroundColor: colors.neutral100,
    padding: 2,
    borderRadius: 8,
    marginBottom: 5,
  },
  productCardFirst: {
    flexDirection: "row",
    width: "100%",
    height: 100,
    justifyContent: "space-around",
    gap: 3,
    padding: 3,
  },
  insideChild: {
    width: "70%",
    height: "100%",
    flexDirection: "column",
    alignItems: "flex-start",
    paddingLeft: 5,
  },
  productImage: {
    flex: 1,
    width: "30%",
    height: "100%",
    borderRadius: 8,
  },
  productName: {
    flex: 1,
    color: colors.black,
    fontSize: 14,
  },
  productDetail: {
    flex: 1,
    color: colors.black,
    fontSize: 12,
  },
  input: {
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 10,
    color: colors.neutral400,
  },
  dateInput: {
    backgroundColor: "#d4d4d4",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: "#ef4444",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  deleteText: {
    color: "#fff",
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#a3e635",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  saveText: {
    color: "#000",
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#a3e635",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 16,
  },
  addText: {
    color: "#000",
    fontWeight: "bold",
  },
});

export default InventoryScreen;
