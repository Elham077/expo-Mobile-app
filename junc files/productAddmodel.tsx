// import BackButton from "@/components/BackButton";
// import Button from "@/components/Button";
// import EngInput from "@/components/engInput";
// import Header from "@/components/Header";
// import ModalWrapper from "@/components/ModalWrapper";
// import Typo from "@/components/Typo";
// import { db } from "@/config/firebase.client";
// import { colors, spacingY } from "@/constants/theme";
// import { uploadFileToCloudinary } from "@/services/imageServices";
// import { InventoryType } from "@/types";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import * as ImagePicker from "expo-image-picker";
// import {
//   addDoc,
//   collection,
//   deleteDoc,
//   doc,
//   onSnapshot,
//   updateDoc,
// } from "firebase/firestore";
// import React, { useEffect, useState } from "react";
// import { useTranslation } from "react-i18next";
// import {
//   Alert,
//   Image,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";

// const ProductAddModel = () => {
//   const { t } = useTranslation();
//   const [loading, setLoading] = useState(false);
//   const [form, setForm] = useState<InventoryType>({
//     name: "",
//     brand: "",
//     description: "",
//     price: 0,
//     quantity: 0,
//     expireDate: "",
//     image: "",
//     created: "",
//     updated: "",
//   });
//   const [selectedProduct, setSelectedProduct] = useState<InventoryType | null>(
//     null
//   );
//   const [showDatePicker, setShowDatePicker] = useState(false);

//   useEffect(() => {
//     const unsub = onSnapshot(collection(db, "inventory"), (snapshot) => {
//       const data = snapshot.docs.map((docSnap) => ({
//         ...(docSnap.data() as InventoryType),
//         id: docSnap.id,
//       }));
//     });
//     return () => unsub();
//   }, []);

//   const handleDelete = (id: string) => {
//     Alert.alert(t("confirm_delete"), t("confirm_delete_msg"), [
//       { text: t("cancel"), style: "cancel" },
//       {
//         text: t("delete"),
//         style: "destructive",
//         onPress: async () => {
//           try {
//             await deleteDoc(doc(db, "inventory", id));
//             Alert.alert(t("deleted"), t("deleted_success"));
//           } catch {
//             Alert.alert(t("error"), t("delete_failed"));
//           }
//         },
//       },
//     ]);
//   };

//   const handleSave = async () => {
//     if (!form.name || form.price <= 0)
//       return Alert.alert(t("invalid_input"), t("fill_required_fields"));
//     if (form.expireDate && new Date(form.expireDate) < new Date())
//       return Alert.alert(t("invalid_date"), t("past_date_warning"));

//     setLoading(true);
//     let imageUrl = form.image;
//     try {
//       if (imageUrl && !imageUrl.startsWith("http")) {
//         const uploadRes = await uploadFileToCloudinary(imageUrl, "products");
//         if (!uploadRes.success)
//           throw new Error(uploadRes.msg || "Upload failed");
//         imageUrl = uploadRes.data;
//       }

//       const productToSave: InventoryType = {
//         ...form,
//         image: imageUrl,
//         created: selectedProduct?.created || new Date().toISOString(),
//         updated: new Date().toISOString(),
//       };

//       if (selectedProduct?.id) {
//         await updateDoc(
//           doc(db, "inventory", selectedProduct.id),
//           productToSave
//         );
//         Alert.alert(t("updated"), t("update_success"));
//       } else {
//         await addDoc(collection(db, "inventory"), productToSave);
//         Alert.alert(t("added"), t("add_success"));
//       }

//       setForm({
//         name: "",
//         brand: "",
//         description: "",
//         price: 0,
//         quantity: 0,
//         expireDate: "",
//         image: "",
//         created: "",
//         updated: "",
//       });
//       setSelectedProduct(null);
//     } catch (err) {
//       Alert.alert(t("error"), t("save_failed"));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePickImage = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       quality: 0.7,
//     });
//     if (!result.canceled && result.assets?.[0]?.uri) {
//       setForm({ ...form, image: result.assets[0].uri });
//     }
//   };

//   return (
//     <ModalWrapper>
//       <View style={styles.container}>
//         <Header
//           title={t("add_product")}
//           leftIcon={<BackButton />}
//           style={{ flexDirection: "row-reverse", marginBottom: spacingY._20 }}
//         />
//         <ScrollView style={styles.form}>
//           <Typo size={18} color={colors.text} style={styles.productLabel}>
//             {t("product_name")}
//           </Typo>
//           <EngInput
//             placeholder={t("name")}
//             value={form.name}
//             onChangeText={(v) => setForm({ ...form, name: v })}
//           />

//           <Typo size={18} color={colors.text} style={styles.productLabel}>
//             {t("brand")}
//           </Typo>
//           <EngInput
//             placeholder={t("brand")}
//             value={form.brand}
//             onChangeText={(v) => setForm({ ...form, brand: v })}
//           />

//           <Typo size={18} color={colors.text} style={styles.productLabel}>
//             {t("description")}
//           </Typo>
//           <EngInput
//             placeholder={t("description")}
//             value={form.description}
//             onChangeText={(v) => setForm({ ...form, description: v })}
//           />

//           <Typo size={18} color={colors.text} style={styles.productLabel}>
//             {t("price")}
//           </Typo>
//           <EngInput
//             placeholder={t("price")}
//             keyboardType="numeric"
//             value={form.price.toString()}
//             onChangeText={(v) =>
//               setForm({ ...form, price: parseFloat(v) || 0 })
//             }
//           />

//           <Typo size={18} color={colors.text} style={styles.productLabel}>
//             {t("quantity")}
//           </Typo>
//           <EngInput
//             placeholder={t("quantity")}
//             keyboardType="numeric"
//             value={form.quantity?.toString()}
//             onChangeText={(v) =>
//               setForm({ ...form, quantity: parseInt(v) || 0 })
//             }
//           />

//           <Typo size={18} color={colors.text} style={styles.productLabel}>
//             {t("expire_date")}
//           </Typo>
//           <TouchableOpacity onPress={() => setShowDatePicker(true)}>
//             <Typo style={{ color: colors.black }}>
//               {form.expireDate
//                 ? new Date(form.expireDate).toDateString()
//                 : t("select_expire_date")}
//             </Typo>
//           </TouchableOpacity>

//           {showDatePicker && (
//             <DateTimePicker
//               mode="date"
//               display="spinner"
//               value={form.expireDate ? new Date(form.expireDate) : new Date()}
//               onChange={(_, date) => {
//                 setShowDatePicker(false);
//                 if (date) setForm({ ...form, expireDate: date.toISOString() });
//               }}
//             />
//           )}

//           <Typo size={18} color={colors.text} style={styles.productLabel}>
//             {t("product_image")}
//           </Typo>
//           <Button onPress={handlePickImage}><Typo>{t("pick_image")}</Typo></Button>
//           {form.image && (
//             <Image
//               source={{ uri: form.image }}
//               style={{
//                 width: 100,
//                 height: 100,
//                 marginVertical: 8,
//                 borderRadius: 8,
//               }}
//             />
//           )}

//           {selectedProduct?.id && (
//             <TouchableOpacity
//               onPress={() => handleDelete(selectedProduct.id!)}
//               style={styles.deleteButton}
//             >
//               <Typo style={styles.deleteText}>{t("delete")}</Typo>
//             </TouchableOpacity>
//           )}

//           <Button
//             loading={loading}
//             style={styles.saveButton}
//             onPress={handleSave}
//           >
//             <Typo style={styles.saveText}>
//               {selectedProduct ? t("edit_product") : t("add_product")}
//             </Typo>
//           </Button>
//         </ScrollView>
//       </View>
//     </ModalWrapper>
//   );
// };

// export default ProductAddModel;

// const styles = StyleSheet.create({
//   container: {
//     direction: "rtl",
//     flex: 1,
//     paddingHorizontal: spacingY._20,
//     paddingVertical: spacingY._30,
//   },
//   form: {},
//   productLabel: {
//     direction: "rtl",
//     paddingRight: 30,
//   },
//   deleteButton: {
//     backgroundColor: "#ef4444",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   deleteText: {
//     color: "#fff",
//     fontWeight: "bold",
//   },
//   saveButton: {
//     backgroundColor: "#a3e635",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   saveText: {
//     color: "#000",
//     fontWeight: "bold",
//   },
// });
