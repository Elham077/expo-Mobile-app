import Typo from "@/components/Typo";
import { db } from "@/config/firebase.client";
import { colors } from "@/constants/theme";
import { BrandType } from "@/types";
import { useRouter } from "expo-router";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import * as Icons from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const BrandList = () => {
  const [brands, setBrands] = useState<BrandType[]>([]);
  const [filtered, setFiltered] = useState<BrandType[]>([]);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    const q = query(collection(db, "brands"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const brandData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as BrandType[];
      setBrands(brandData);
      setFiltered(brandData);
    });

    return () => unsubscribe();
  }, []);

  const handleSearch = (text: string) => {
    setSearch(text);
    const filteredData = brands.filter((item) =>
      item.name.toLowerCase().includes(text.toLowerCase())
    );
    setFiltered(filteredData);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "حذف برند",
      "آیا مطمئن هستید که می‌خواهید این برند را حذف کنید؟",
      [
        { text: "لغو", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: async () => {
            await deleteDoc(doc(db, "brands", id));
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: BrandType }) => (
    <View style={styles.card}>
      {item.logo ? (
        <Image source={{ uri: item.logo }} style={styles.logo} />
      ) : (
        <View style={styles.placeholderLogo}>
          <Typo style={styles.placeholderText}>{item.name[0]}</Typo>
        </View>
      )}
      <View style={styles.info}>
        <Typo style={styles.name}>{item.name}</Typo>
        {item.businessName && <Typo>نام تجاری: {item.businessName}</Typo>}
        {item.category && <Typo>دسته: {item.category}</Typo>}
        {item.country && <Typo>کشور: {item.country}</Typo>}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/(modals)/BrandFormScreen",
              params: { id: item.id },
            })
          }
        >
          <Icons.PencilSimple size={22} color={"blue"} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => item.id && handleDelete(item.id)}>
          <Icons.Trash size={22} color={colors.rose} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <TextInput
        placeholder="جستجو بر اساس نام برند..."
        style={styles.searchInput}
        value={search}
        onChangeText={handleSearch}
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id ?? ""}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 50 }}
      />
    </View>
  );
};

export default BrandList;

const styles = StyleSheet.create({
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 44,
    backgroundColor: "#fff",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
    elevation: 1,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  placeholderLogo: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  placeholderText: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.black,
    marginBottom: 4,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
});
