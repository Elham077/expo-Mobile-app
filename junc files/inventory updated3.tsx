// ======================================================================================

// import BackButton from "@/components/BackButton";
// import Button from "@/components/Button";
// import EngInput from "@/components/engInput";
// import Header from "@/components/Header";
// import ImageUpload from "@/components/imageUpload";
// import ModalWrapper from "@/components/ModalWrapper";
// import Typo from "@/components/Typo";
// import { db } from "@/config/firebase.client";
// import { equipmentCategories } from "@/constants/productCategoryData";
// import { colors, radius, spacingX, spacingY } from "@/constants/theme";
// import { uploadFileToCloudinary } from "@/services/imageServices";
// import { InventoryType } from "@/types";
// import { verticalScale } from "@/utils/styling";
// import DateTimePicker from "@react-native-community/datetimepicker";
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
//   Platform,
//   Pressable,
//   ScrollView,
//   StyleSheet,
//   TouchableOpacity,
//   View,
// } from "react-native";

// import { Dropdown } from "react-native-element-dropdown";
// const ProductAddModel = () => {
//   const { t } = useTranslation();
//   const [loading, setLoading] = useState(false);
//   const [form, setForm] = useState<InventoryType>({
//     name: "",
//     category: "",
//     brand: "",
//     purchasedPrice: 0,
//     sellingPrice: 0,
//     quantity: 0,
//     expireDate: "",
//     description: "",
//     image: "",
//     created: "",
//     updated: "",
//   });
//   const [selectedProduct, setSelectedProduct] = useState<InventoryType | null>(
//     null
//   );
//   const [products, setProducts] = useState<InventoryType[]>([]);

//   const [showDatePicker, setShowDatePicker] = useState(false);

//   useEffect(() => {
//     const unsub = onSnapshot(collection(db, "inventory"), (snapshot) => {
//       const updated = snapshot.docs.map((docSnap) => ({
//         ...(docSnap.data() as InventoryType),
//         id: docSnap.id,
//       }));
//       setProducts(updated); // داده‌های جدید ست شوند
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
//   const onDateChange = (_: any, selectedDate?: Date) => {
//     if (selectedDate) {
//       setForm({ ...form, expireDate: selectedDate.toISOString() });
//     }
//     setShowDatePicker(false);
//   };
//   const handleSave = async () => {
//     if (!form.name || form.purchasedPrice <= 0)
//       return Alert.alert(t("invalid_input"), t("fill_required_fields"));
//     // Normalize expireDate to a Date object for comparison
//     let expireDateObj: Date | null = null;
//     if (form.expireDate) {
//       if (
//         typeof form.expireDate === "string" ||
//         form.expireDate instanceof Date
//       ) {
//         expireDateObj = new Date(form.expireDate);
//       } else if (
//         "toDate" in form.expireDate &&
//         typeof form.expireDate.toDate === "function"
//       ) {
//         expireDateObj = form.expireDate.toDate();
//       }
//     }
//     if (expireDateObj && expireDateObj < new Date())
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
//         created:
//           selectedProduct?.created ?? form.created ?? new Date().toISOString(),
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
//         category: "",
//         brand: "",
//         description: "",
//         purchasedPrice: 0,
//         sellingPrice: 0,
//         quantity: 0,
//         expireDate: "",
//         image: "",
//         created: "",
//         updated: "",
//       });
//       setSelectedProduct(null);
//       // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     } catch (err) {
//       Alert.alert(t("error"), t("save_failed"));
//     } finally {
//       setLoading(false);
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
//           {/* name input */}
//           <Typo size={18} color={colors.text} style={styles.productLabel}>
//             {t("product_name")}
//           </Typo>
//           <EngInput
//             value={form.name}
//             onChangeText={(v) => setForm({ ...form, name: v })}
//           />
//           <View style={styles.inputContainer}>
//             <Typo color={colors.neutral200} size={16}>
//               Expense category
//             </Typo>
//             {/* dropdown here */}
//             <Dropdown
//               style={styles.dropDownContainer}
//               activeColor={colors.neutral700}
//               placeholderStyle={styles.dropdownPlaceholder}
//               selectedTextStyle={styles.dropdownSelectedText}
//               iconStyle={styles.dropdownIcon}
//               data={Object.values(equipmentCategories)}
//               maxHeight={300}
//               labelField="label"
//               valueField="value"
//               itemTextStyle={styles.dropdownItemText}
//               itemContainerStyle={styles.dropdownItemContainer}
//               containerStyle={styles.dropdwnListContainer}
//               placeholder={"Select category"}
//               value={form.category}
//               onChange={(item) => {
//                 setForm({ ...form, category: item.value || "" });
//               }}
//             />
//           </View>
//           <Typo size={18} color={colors.text} style={styles.productLabel}>
//             {t("brand")}
//           </Typo>
//           <EngInput
//             value={form.brand}
//             onChangeText={(v) => setForm({ ...form, brand: v })}
//           />
//           <View style={styles.inputContainer}>
//             <View style={styles.flexRow}>
//               <Typo color={colors.neutral200} size={16}>
//                 Description
//               </Typo>
//               <Typo color={colors.neutral500} size={14}>
//                 (optional)
//               </Typo>
//             </View>
//             <EngInput
//               value={form.description}
//               multiline
//               containerStyle={{
//                 flexDirection: "row",
//                 height: verticalScale(100),
//                 alignItems: "flex-start",
//                 paddingVertical: 15,
//               }}
//               onChangeText={(value) => setForm({ ...form, description: value })}
//             />
//           </View>
//           <Typo size={18} color={colors.text} style={styles.productLabel}>
//             {t("price")}
//           </Typo>
//           <EngInput
//             keyboardType="numeric"
//             value={form.purchasedPrice.toString()}
//             onChangeText={(v) => {
//               const parsed = parseFloat(v);
//               if (!isNaN(parsed)) setForm({ ...form, purchasedPrice: parsed });
//             }}
//           />
//           <Typo size={18} color={colors.text} style={styles.productLabel}>
//             {t("selling_price")}
//           </Typo>
//           <EngInput
//             keyboardType="numeric"
//             value={form.sellingPrice.toString()}
//             onChangeText={(v) => {
//               const parsed = parseFloat(v);
//               if (!isNaN(parsed)) setForm({ ...form, sellingPrice: parsed });
//             }}
//           />
//           <Typo size={18} color={colors.text} style={styles.productLabel}>
//             {t("quantity")}
//           </Typo>
//           <EngInput
//             keyboardType="numeric"
//             value={form.quantity?.toString()}
//             onChangeText={(v) => {
//               const parsed = parseFloat(v);
//               if (!isNaN(parsed)) setForm({ ...form, quantity: parsed });
//             }}
//           />

//           <Typo size={18} color={colors.text} style={styles.productLabel}>
//             {t("expire_date")}
//           </Typo>
//           <TouchableOpacity onPress={() => setShowDatePicker(true)}>
//             <Typo style={{ color: colors.black }}>
//               {form.expireDate
//                 ? (typeof form.expireDate === "string"
//                     ? new Date(form.expireDate)
//                     : form.expireDate instanceof Date
//                     ? form.expireDate
//                     : "toDate" in form.expireDate
//                     ? form.expireDate.toDate()
//                     : new Date()
//                   ).toDateString()
//                 : t("select_expire_date")}
//             </Typo>
//           </TouchableOpacity>

//           {showDatePicker && (
//             <DateTimePicker
//               mode="date"
//               display="spinner"
//               value={
//                 form.expireDate
//                   ? typeof form.expireDate === "string"
//                     ? new Date(form.expireDate)
//                     : form.expireDate instanceof Date
//                     ? form.expireDate
//                     : "toDate" in form.expireDate &&
//                       typeof form.expireDate.toDate === "function"
//                     ? form.expireDate.toDate()
//                     : new Date()
//                   : new Date()
//               }
//               onChange={(_, date) => {
//                 setShowDatePicker(false);
//                 if (date) setForm({ ...form, expireDate: date.toISOString() });
//               }}
//             />
//           )}
//           {/* date Picker */}
//           <View style={styles.inputContainer}>
//             <Typo color={colors.neutral200} size={16}>
//               Date
//             </Typo>
//             {!showDatePicker && (
//               <Pressable
//                 style={styles.dateInput}
//                 onPress={() => setShowDatePicker(true)}
//               >
//                 <Typo size={14}>
//                   {(form.expireDate as Date).toLocaleDateString()}
//                 </Typo>
//               </Pressable>
//             )}
//             {showDatePicker && (
//               <View style={Platform.OS == "ios" && styles.iosDataPicker}>
//                 <DateTimePicker
//                   themeVariant="dark"
//                   value={form.expireDate as Date}
//                   textColor={colors.white}
//                   mode="date"
//                   display="spinner"
//                   onChange={onDateChange}
//                 />
//                 {Platform.OS == "ios" && (
//                   <TouchableOpacity
//                     style={styles.dataPickerButtton}
//                     onPress={() => setShowDatePicker(false)}
//                   >
//                     <Typo size={15} fontWeight={"500"}>
//                       Ok
//                     </Typo>
//                   </TouchableOpacity>
//                 )}
//               </View>
//             )}
//           </View>
//           <Typo size={18} color={colors.text} style={styles.productLabel}>
//             {t("product_image")}
//           </Typo>
//           <ImageUpload
//             file={form.image}
//             onClear={() => setForm({ ...form, image: "" })}
//             onSelect={(file) => setForm({ ...form, image: file })}
//           />

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
//     paddingHorizontal: spacingY._15,
//     paddingVertical: spacingY._7,
//   },
//   form: {},
//   flexRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: spacingX._5,
//   },
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
//   inputContainer: {
//     gap: spacingY._10,
//   },
//   iosDataPicker: {
//     backgroundColor: "red",
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
//   dataPickerButtton: {
//     backgroundColor: colors.neutral700,
//     alignSelf: "flex-end",
//     padding: spacingY._7,
//     marginRight: spacingX._7,
//     paddingHorizontal: spacingY._15,
//     borderRadius: radius._10,
//   },
//   dateInput: {
//     flex: 1,
//     flexDirection: "row",
//     justifyContent: "flex-start",
//     height: verticalScale(54),
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: colors.neutral300,
//     borderRadius: radius._17,
//     borderCurve: "continuous",
//     paddingHorizontal: spacingX._15,
//   },
//   dropdwnListContainer: {
//     backgroundColor: colors.neutral900,
//     borderRadius: radius._15,
//     borderCurve: "continuous",
//     paddingVertical: spacingY._7,
//     top: 5,
//     borderColor: colors.neutral500,
//     shadowColor: colors.black,
//     shadowOffset: { width: 0, height: 5 },
//     shadowOpacity: 1,
//     shadowRadius: 15,
//     elevation: 5,
//   },
//   dropDownContainer: {
//     height: verticalScale(54),
//     borderWidth: 1,
//     borderColor: colors.neutral300,
//     paddingHorizontal: spacingX._15,
//     borderRadius: radius._15,
//     borderCurve: "continuous",
//   },
//   dropdownItemText: {
//     color: colors.white,
//   },
//   dropdownSelectedText: {
//     color: colors.white,
//     fontSize: verticalScale(14),
//   },
//   dropdownPlaceholder: {
//     color: colors.white,
//   },
//   dropdownItemContainer: {
//     borderRadius: radius._15,
//   },
//   dropdownIcon: {
//     height: verticalScale(30),
//     tintColor: colors.neutral300,
//   },
// });
// ==============================================================================================================
// // components/AddOrEditProductForm.tsx
// import ScreenWrapper from "@/components/ScreenWrapper";
// import { auth, db } from "@/config/firebase.client"; // مسیر فایل کانفیگ Firebase تو
// import { uploadFileToCloudinary } from "@/services/imageServices";
// import * as ImagePicker from "expo-image-picker";
// import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
// import React, { useState } from "react";
// import {
//   Button,
//   Image,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";

// type InventoryType = {
//   id?: string;
//   name: string;
//   brand?: string;
//   purchasedPrice: number;
//   sellingPrice: number;
//   expireDate: string;
//   quantity?: number;
//   description?: string;
//   image?: string | null;
//   created?: string;
//   updated?: string;
//   ownerName?: string;
// };

// type Props = {
//   product?: InventoryType | null;
//   onFinish?: () => void;
// };

// const AddOrEditProductForm = ({ product, onFinish }: Props) => {
//   const isEditMode = !!product;

//   const [name, setName] = useState(product?.name || "");
//   const [brand, setBrand] = useState(product?.brand || "");
//   const [purchasedPrice, setPurchasedPrice] = useState(
//     product?.purchasedPrice.toString() || ""
//   );
//   const [sellingPrice, setSellingPrice] = useState(
//     product?.sellingPrice.toString() || ""
//   );
//   const [expireDate, setExpireDate] = useState(product?.expireDate || "");
//   const [quantity, setQuantity] = useState(product?.quantity?.toString() || "");
//   const [description, setDescription] = useState(product?.description || "");
//   const [imageUri, setImageUri] = useState<string | null>(
//     product?.image || null
//   );

//   const pickImage = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//     });
//     if (!result.canceled) {
//       setImageUri(result.assets[0].uri);
//     }
//   };
//   const getCurrentUserName = () => {
//     const user = auth.currentUser;

//     if (!user) return "Unknown";

//     if (user.displayName) return user.displayName;

//     return user.email || "NoName";
//   };
//   const getCurrentTimestamp = () => new Date().toISOString();

//   const handleSubmit = async () => {
//     try {
//       const ownerName = await getCurrentUserName();
//       let imageUrl: string | null = imageUri;
//       if (imageUri && !imageUri.startsWith("http")) {
//         const uploadResult = await uploadFileToCloudinary(
//           { uri: imageUri },
//           "inventory"
//         );
//         imageUrl = typeof uploadResult === "string" ? uploadResult : null;
//       }
//       const payload: InventoryType = {
//         name,
//         brand,
//         purchasedPrice: parseFloat(purchasedPrice),
//         sellingPrice: parseFloat(sellingPrice),
//         expireDate,
//         quantity: quantity ? parseInt(quantity) : undefined,
//         description,
//         image: imageUrl || null,
//         ownerName,
//         updated: getCurrentTimestamp(),
//         ...(isEditMode ? {} : { created: getCurrentTimestamp() }),
//       };
//       if (isEditMode && product?.id) {
//         const docRef = doc(db, "inventory", product.id);
//         await updateDoc(docRef, payload);
//       } else {
//         await addDoc(collection(db, "inventory"), payload);
//       }
//       onFinish?.();
//     } catch (error) {
//       console.error("خطا در ذخیره محصول:", error);
//     }
//   };

//   return (
//     <ScreenWrapper>
//         <View style={{ padding: 16, gap: 8 }}>
//       <TextInput
//         placeholder="Product Name"
//         value={name}
//         onChangeText={setName}
//       />
//       <TextInput
//         placeholder="Brand (optional)"
//         value={brand}
//         onChangeText={setBrand}
//       />
//       <TextInput
//         placeholder="Purchased Price"
//         value={purchasedPrice}
//         onChangeText={setPurchasedPrice}
//         keyboardType="numeric"
//       />
//       <TextInput
//         placeholder="Selling Price"
//         value={sellingPrice}
//         onChangeText={setSellingPrice}
//         keyboardType="numeric"
//       />
//       <TextInput
//         placeholder="Expire Date (YYYY-MM-DD)"
//         value={expireDate}
//         onChangeText={setExpireDate}
//       />
//       <TextInput
//         placeholder="Quantity (optional)"
//         value={quantity}
//         onChangeText={setQuantity}
//         keyboardType="numeric"
//       />
//       <TextInput
//         placeholder="Description (optional)"
//         value={description}
//         onChangeText={setDescription}
//         multiline
//       />

//       <TouchableOpacity onPress={pickImage}>
//         <Text style={{ color: "blue" }}>
//           {imageUri ? "Change Image" : "Pick Image"}
//         </Text>
//       </TouchableOpacity>

//       {imageUri && (
//         <Image source={{ uri: imageUri }} style={{ width: 100, height: 100 }} />
//       )}

//       <Button
//         title={isEditMode ? "Update Product" : "Add Product"}
//         onPress={handleSubmit}
//       />
//     </View>
//     </ScreenWrapper>
//   );
// };

// export default AddOrEditProductForm;
