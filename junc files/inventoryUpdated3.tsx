
// import Button from "@/components/Button";
// import Header from "@/components/Header";
// import Input from "@/components/Input";
// import Loading from "@/components/Loading";
// import ScreenWrapper from "@/components/ScreenWrapper";
// import Typo from "@/components/Typo";
// import { db } from "@/config/firebase.client";
// import { colors, radius, spacingX, spacingY } from "@/constants/theme";
// import { useAuth } from "@/contexts/authContext";
// import useFetchData from "@/hooks/useFetchData";
// import { InventoryType } from "@/types";
// import { verticalScale } from "@/utils/styling";
// import { Picker } from "@react-native-picker/picker";
// import { useRouter } from "expo-router";
// import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
// import * as Icon from "phosphor-react-native";
// import React, { useEffect, useState } from "react";
// import { useTranslation } from "react-i18next";
// import {
//   FlatList,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";

// const Inventory = () => {
//   const router = useRouter();
//   const [search, setSearch] = useState("");
//   const { t } = useTranslation();
//   const { user } = useAuth();
//   const [products, setProducts] = useState<InventoryType[]>([]);
//   const [loadingProducts, setLoadingProducts] = useState(true);
//   const [sortBy, setSortBy] = useState<
//     "expireDate" | "created" | "updated" | "name"
//   >("expireDate");
//   const [selectedProduct, setSelectedProduct] = useState<InventoryType | null>(
//     null
//   );
//   const {
//     data: Inventory,
//     error,
//     loading,
//   } = useFetchData<InventoryType>("Inventory", [orderBy("created", "desc")]);

//   useEffect(() => {
//     if (Inventory) setProducts(Inventory);
//   }, [Inventory]);
//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         setLoadingProducts(true);

//         const q = query(collection(db, "inventory"));
//         const unsubscribe = onSnapshot(
//           q,
//           (snapshot) => {
//             const productsData = snapshot.docs.map((doc) => ({
//               id: doc.id,
//               name: doc.data().name || "",
//               category: doc.data().category || "",
//               brand: doc.data().brand || "",
//               purchasedPrice: doc.data().purchasedPrice || 0,
//               sellingPrice: doc.data().sellingPrice || 0,
//               quantity: doc.data().quantity || 0,
//               expireDate: doc.data().expireDate || "",
//               description: doc.data().description || "",
//               image: doc.data().image || "",
//               created: doc.data().created || "",
//               updated: doc.data().updated || "",
//             }));

//             console.log("Fetched products:", productsData);
//             setProducts(productsData);
//             setLoadingProducts(false);
//           },
//           (error) => {
//             console.error("Error fetching products:", error);
//             setLoadingProducts(false);
//           }
//         );

//         return () => unsubscribe();
//       } catch (error) {
//         console.error("Error in fetchProducts:", error);
//         setLoadingProducts(false);
//       }
//     };

//     fetchProducts();
//   }, []);

//   const handleSelectProduct = (id: string) => {
//     const product = products.find((p) => p.id === id);
//     if (product) {
//       setSelectedProduct(product);
//     }
//   };

//   const filteredAndSorted = products
//     .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
//     .sort((a, b) => {
//       if (sortBy === "name") return a.name.localeCompare(b.name);
//       const getDate = (val: any) =>
//         val?.toDate?.() instanceof Date ? val.toDate() : new Date(val || "");
//       return getDate(a[sortBy]).getTime() - getDate(b[sortBy]).getTime();
//     });
//   const renderProductItem = ({ item }: { item: InventoryType }) => (
//     <View style={styles.productCard1}>
//       <View style={styles.productHeader}>
//         <Typo size={18} fontWeight="bold">
//           {item.name}
//         </Typo>
//         <Typo color={colors.primary}>{item.sellingPrice} $</Typo>
//       </View>

//       <View style={styles.productDetails}>
//         <Typo>دسته: {item.category || "نامشخص"}</Typo>
//         <Typo>برند: {item.brand || "نامشخص"}</Typo>
//         <Typo>موجودی: {item.quantity}</Typo>
//       </View>

//       <View style={styles.productActions}>
//         <Button
//           onPress={() =>
//             router.push({
//               pathname: "/(modals)/AddOrEditProductForm",
//               params: { id: item.id },
//             })
//           }
//         >
//           <Typo size={14}>ویرایش</Typo>
//         </Button>
//       </View>
//     </View>
//   );
//   return (
//     <ScreenWrapper scrollable={false}>
//       <View style={styles.container}>
//         <Header
//           title={t("inventory")}
//           style={{ marginVertical: spacingY._10, marginBottom: spacingY._10 }}
//         />

//         <View style={styles.firstchild}>
//           <View style={styles.totalPrice}>
//             <Typo size={30} fontWeight={"400"} color={colors.neutral700}>
//               <Icon.Bank color={colors.textLighter} weight="fill" size={30} />{" "}
//               45.832 AF
//             </Typo>
//           </View>
//           <View style={styles.productTotalQuantity}>
//             <Typo size={30} fontWeight={"400"} color={colors.neutral700}>
//               <Icon.Factory
//                 color={colors.textLighter}
//                 weight="fill"
//                 size={30}
//               />{" "}
//               15.398 AF
//             </Typo>
//           </View>
//         </View>

//         <View style={styles.searchContainer}>
//           <Input
//             label=""
//             error={false}
//             icon={<Icon.MagnifyingGlass size={26} />}
//             placeholder="Search by name"
//             placeholderTextColor="#000"
//             value={search}
//             onChangeText={setSearch}
//             style={styles.searchInput}
//           />
//         </View>

//         <View style={styles.pickerWrapper}>
//           <Picker
//             selectedValue={sortBy}
//             style={styles.sortPicker}
//             onValueChange={(itemValue) => setSortBy(itemValue)}
//           >
//             <Picker.Item label="Expire Date" value="expireDate" />
//             <Picker.Item label="Created Date" value="created" />
//             <Picker.Item label="Updated Date" value="updated" />
//             <Picker.Item label="Name" value="name" />
//           </Picker>
//         </View>

//         <View style={styles.Inventory}>
//           <View style={styles.flexRow}>
//             <Typo size={20} fontWeight={"500"}>
//               Products
//             </Typo>
//             <TouchableOpacity
//               onPress={() => router.push("/(modals)/AddOrEditProductForm")}
//             >
//               <Icon.PlusCircle
//                 weight="fill"
//                 color={colors.primary}
//                 size={verticalScale(33)}
//               />
//             </TouchableOpacity>
//           </View>

//           {loading ? (
//             <Loading size="large" />
//           ) : error ? (
//             <View style={styles.errorContainer}>
//               <Typo color={colors.rose}>{error}</Typo>
//             </View>
//           ) : products.length === 0 ? (
//             <View style={styles.emptyContainer}>
//               <Typo>هیچ محصولی یافت نشد</Typo>
//             </View>
//           ) : (
//             <FlatList
//               data={products}
//               renderItem={renderProductItem}
//               keyExtractor={(item) => item.id ?? ""}
//               contentContainerStyle={styles.listContent}
//               ListHeaderComponent={
//                 <Typo size={20} style={styles.listHeader}>
//                   لیست محصولات
//                 </Typo>
//               }
//             />
//           )}

//           {/* <ScrollView style={{ flex: 1 }}>
//             {filteredAndSorted.map((item) => {
//               const isExpiringSoon =
//                 item.expireDate &&
//                 (() => {
//                   let expireDateObj: Date;
//                   if (
//                     typeof item.expireDate === "object" &&
//                     item.expireDate !== null &&
//                     "toDate" in item.expireDate &&
//                     typeof item.expireDate.toDate === "function"
//                   ) {
//                     expireDateObj = item.expireDate.toDate();
//                   } else {
//                     expireDateObj = new Date(
//                       item.expireDate as string | number | Date
//                     );
//                   }
//                   return (
//                     expireDateObj.getTime() - Date.now() <=
//                     30 * 24 * 60 * 60 * 1000
//                   );
//                 })();

//               return (
//                 <TouchableOpacity
//                   key={item.id}
//                   style={styles.productCard}
//                   onPress={() => item.id && handleSelectProduct(item.id)}
//                 >
//                   <View style={styles.productCardFirst}>
//                     {item.image && (
//                       <Image
//                         source={{ uri: item.image }}
//                         style={styles.productImage}
//                       />
//                     )}
//                     <View style={styles.insideChild}>
//                       <Typo style={styles.productName}>
//                         Product Name: {item.name}
//                       </Typo>
//                       <Typo style={styles.productDetail}>
//                         Product price: ${item.purchasedPrice}
//                       </Typo>
//                       <Typo style={styles.productDetail}>
//                         Product Quantity: {item.quantity}
//                       </Typo>
//                       {isExpiringSoon && (
//                         <Text
//                           style={{
//                             alignSelf: "center",
//                             color: "red",
//                             fontWeight: "bold",
//                           }}
//                         >
//                           ⚠️ Expiring Soon
//                         </Text>
//                       )}
//                     </View>
//                   </View>
//                 </TouchableOpacity>
//               );
//             })}
//           </ScrollView> */}
//         </View>

//         <TouchableOpacity
//           style={styles.addButton}
//           onPress={() => {
//             if (selectedProduct?.id) {
//               router.push({
//                 pathname: "/(modals)/AddOrEditProductForm",
//                 params: { id: selectedProduct.id },
//               });
//             }
//           }}
//           disabled={!selectedProduct}
//         >
//           <Text style={styles.addText}>Add Product</Text>
//         </TouchableOpacity>
//       </View>
//     </ScreenWrapper>
//   );
// };

// export default Inventory;

// const styles = StyleSheet.create({
//   container1: {
//     flex: 1,
//     backgroundColor: colors.neutral900,
//     paddingHorizontal: spacingX._15,
//   },
//   listContent: {
//     paddingBottom: spacingY._25,
//   },
//   listHeader: {
//     marginVertical: spacingY._25,
//     textAlign: 'center',
//   },
//   productCard1: {
//     backgroundColor: colors.white,
//     borderRadius: radius._15,
//     padding: spacingY._15,
//     marginBottom: spacingY._15,
//     shadowColor: colors.black,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   productHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: spacingY._10,
//   },
//   productDetails: {
//     marginVertical: spacingY._10,
//     gap: spacingY._25,
//   },
//   productActions: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   container: {
//     height: "100%",
//   },
//   firstchild: {
//     height: "20%",
//     backgroundColor: "white",
//     borderRadius: 20,
//     elevation: 8,
//     shadowColor: colors.neutral200,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.23,
//     shadowRadius: 2.62,
//   },
//   totalPrice: {
//     padding: spacingX._10,
//     justifyContent: "center",
//     alignItems: "center",
//     height: "49%",
//   },
//   productTotalQuantity: {
//     padding: spacingX._10,
//     alignItems: "center",
//     justifyContent: "center",
//     height: "49%",
//   },
//   searchContainer: {
//     marginBottom: 5,
//     marginTop: 5,
//     width: "100%",
//     backgroundColor: colors.white,
//     borderRadius: 16,
//   },
//   searchInput: {
//     flex: 1,
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     paddingHorizontal: 8,
//     height: 45,
//     color: "#000",
//   },
//   flexRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: spacingY._10,
//   },
//   Inventory: {
//     flex: 1,
//     backgroundColor: colors.neutral900,
//     borderTopRightRadius: radius._30,
//     borderTopLeftRadius: radius._30,
//     padding: spacingX._20,
//     paddingTop: spacingX._25,
//   },
//   listStyle: {
//     paddingVertical: spacingY._25,
//     paddingTop: spacingY._15,
//   },
//   pickerWrapper: {
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     overflow: "hidden",
//     height: "8%",
//   },
//   sortPicker: {
//     height: "100%",
//     width: "100%",
//     color: "#000",
//   },
//   productCard: {
//     backgroundColor: colors.neutral100,
//     padding: 2,
//     borderRadius: 8,
//     marginBottom: 5,
//   },
//   productCardFirst: {
//     flexDirection: "row",
//     width: "100%",
//     height: 100,
//     justifyContent: "space-around",
//     gap: 3,
//     padding: 3,
//   },
//   insideChild: {
//     width: "70%",
//     height: "100%",
//     flexDirection: "column",
//     alignItems: "flex-start",
//     paddingLeft: 5,
//   },
//   productImage: {
//     flex: 1,
//     width: "30%",
//     height: "100%",
//     borderRadius: 8,
//   },
//   productName: {
//     flex: 1,
//     color: colors.black,
//     fontSize: 14,
//   },
//   productDetail: {
//     flex: 1,
//     color: colors.black,
//     fontSize: 12,
//   },
//   addButton: {
//     backgroundColor: "#a3e635",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginVertical: 16,
//   },
//   addText: {
//     color: "#000",
//     fontWeight: "bold",
//   },
//   // productImage: {
//   //   width: 80,
//   //   height: 80,
//   //   borderRadius: 8,
//   //   marginRight: 10,
//   //   backgroundColor: "#eee",
//   // },
// });

// // ============================================================
// // import InventoryListItem from "@/components/CardProduct";
// // import Header from "@/components/Header";
// // import Input from "@/components/Input";
// // import Loading from "@/components/Loading";
// // import ScreenWrapper from "@/components/ScreenWrapper";
// // import Typo from "@/components/Typo";
// // import { colors, radius, spacingX, spacingY } from "@/constants/theme";
// // import { useAuth } from "@/contexts/authContext";
// // import useFetchData from "@/hooks/useFetchData";
// // import { InventoryType } from "@/types";
// // import { verticalScale } from "@/utils/styling";
// // import { Picker } from "@react-native-picker/picker";
// // import { useRouter } from "expo-router";
// // import { orderBy, where } from "firebase/firestore";
// // import * as Icon from "phosphor-react-native";
// // import React, { useState } from "react";
// // import { useTranslation } from "react-i18next";
// // import {
// //   FlatList,
// //   StyleSheet,
// //   Text,
// //   TouchableOpacity,
// //   View,
// // } from "react-native";
// // const Inventory = () => {
// //   const router = useRouter();
// //   const [search, setSearch] = useState("");
// //   const { t } = useTranslation();
// //   const { user } = useAuth();
// //   const [products, setProducts] = useState<InventoryType[]>([]);
// //   const [sortBy, setSortBy] = useState<
// //     "expireDate" | "created" | "updated" | "name"
// //   >("expireDate");
// //   const [selectedProduct, setSelectedProduct] = useState<InventoryType | null>(
// //     null
// //   );
// //   const {
// //     data: Inventory,
// //     error,
// //     loading,
// //   } = useFetchData<InventoryType>("Inventory", [
// //     where("uid", "==", user?.uid),
// //     orderBy("created", "desc"),
// //   ]);
// //   const handleSelectProduct = (id: string) => {
// //     const product = products.find((p) => p.id === id);
// //     if (product) {
// //       setSelectedProduct(product);
// //       router.push("/(modals)/AddOrEditProductForm");
// //     }
// //   };
// //   const filteredAndSorted = products
// //     .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
// //     .sort((a, b) => {
// //       if (sortBy === "name") return a.name.localeCompare(b.name);
// //       const getDate = (val: any) => {
// //         if (
// //           val &&
// //           typeof val === "object" &&
// //           "toDate" in val &&
// //           typeof val.toDate === "function"
// //         ) {
// //           return val.toDate();
// //         }
// //         return new Date(val || "");
// //       };
// //       const aDate = getDate(a[sortBy]);
// //       const bDate = getDate(b[sortBy]);
// //       return aDate.getTime() - bDate.getTime();
// //     });
// //   return (
// //     <ScreenWrapper scrollable={false}>
// //       <View style={styles.container}>
// //         <Header
// //           title={t("inventory")}
// //           style={{ marginVertical: spacingY._10, marginBottom: spacingY._10 }}
// //         />
// //         <View style={styles.firstchild}>
// //           <View style={styles.totalPrice}>
// //             <Typo size={30} fontWeight={"400"} color={colors.neutral700}>
// //               <Icon.Bank color={colors.textLighter} weight="fill" size={30} />{" "}
// //               45.832 AF
// //             </Typo>
// //           </View>
// //           <View style={styles.productTotalQuantity}>
// //             <Typo size={30} fontWeight={"400"} color={colors.neutral700}>
// //               <Icon.Factory
// //                 color={colors.textLighter}
// //                 weight="fill"
// //                 size={30}
// //               />{" "}
// //               15.398 AF
// //             </Typo>
// //           </View>
// //         </View>
// //         <View style={styles.searchContainer}>
// //           <Input
// //             label=""
// //             error={false}
// //             icon={<Icon.MagnifyingGlass size={26} />}
// //             placeholder="Search by name"
// //             placeholderTextColor="#000"
// //             value={search}
// //             onChangeText={setSearch}
// //             style={styles.searchInput}
// //           />
// //         </View>
// //         <View style={styles.pickerWrapper}>
// //           <Picker
// //             selectedValue={sortBy}
// //             style={styles.sortPicker}
// //             onValueChange={(itemValue) => setSortBy(itemValue)}
// //           >
// //             <Picker.Item label="Expire Date" value="expireDate" />
// //             <Picker.Item label="Created Date" value="created" />
// //             <Picker.Item label="Updated Date" value="updated" />
// //             <Picker.Item label="Name" value="name" />
// //           </Picker>
// //         </View>
// //         <View style={styles.Inventory}>
// //           {/* header */}
// //           <View style={styles.flexRow}>
// //             <Typo size={20} fontWeight={"500"}>
// //               Products
// //             </Typo>
// //             <TouchableOpacity
// //               onPress={() => router.push("/(modals)/AddOrEditProductForm")}
// //             >
// //               <Icon.PlusCircle
// //                 weight="fill"
// //                 color={colors.primary}
// //                 size={verticalScale(33)}
// //               ></Icon.PlusCircle>
// //             </TouchableOpacity>
// //           </View>
// //           {/*  todo: Inventory list  */}
// //           {loading && <Loading />}
// //           <FlatList
// //             data={Inventory}
// //             renderItem={({ item, index }) => {
// //               return (
// //                 <InventoryListItem item={item} index={index} router={router} />
// //               );
// //             }}
// //             contentContainerStyle={styles.listStyle}
// //           />
// //         </View>
// //         <TouchableOpacity
// //           onPress={() => {
// //             if (selectedProduct?.id) {
// //               router.push({
// //                 pathname: "/(modals)/AddOrEditProductForm",
// //                 params: { id: selectedProduct.id },
// //               });
// //             }
// //           }}
// //           disabled={!selectedProduct}
// //         >
// //           <Text>ویرایش</Text>
// //         </TouchableOpacity>

// //         <TouchableOpacity
// //           style={styles.addButton}
// //           onPress={() => {
// //             if (selectedProduct?.id) {
// //               router.push({
// //                 pathname: "/(modals)/AddOrEditProductForm",
// //                 params: { id: selectedProduct.id },
// //               });
// //             }
// //           }}
// //           disabled={!selectedProduct}
// //         >
// //           <Text style={styles.addText}>+ Add Product</Text>
// //         </TouchableOpacity>
// //       </View>
// //     </ScreenWrapper>
// //   );
// // };

// // export default Inventory;

// // const styles = StyleSheet.create({
// //   container: {
// //     height: "100%",
// //   },
// //   firstchild: {
// //     height: "20%",
// //     backgroundColor: "white",
// //     borderRadius: 20,
// //     elevation: 8,
// //     shadowColor: colors.neutral200,
// //     shadowOffset: {
// //       width: 0,
// //       height: 2,
// //     },
// //     shadowOpacity: 0.23,
// //     shadowRadius: 2.62,
// //   },
// //   totalPrice: {
// //     padding: spacingX._10,
// //     justifyContent: "center",
// //     alignItems: "center",
// //     height: "49%",
// //   },
// //   productTotalQuantity: {
// //     padding: spacingX._10,
// //     alignItems: "center",
// //     justifyContent: "center",
// //     height: "49%",
// //   },
// //   searchContainer: {
// //     marginBottom: 5,
// //     marginTop: 5,
// //     width: "100%",
// //     backgroundColor: colors.white,
// //     borderRadius: 16,
// //   },
// //   searchInput: {
// //     flex: 1,
// //     backgroundColor: "#fff",
// //     borderRadius: 16,
// //     paddingHorizontal: 8,
// //     marginRight: 2,
// //     height: 45,
// //     color: "#000",
// //   },
// //   flexRow: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //     marginBottom: spacingY._10,
// //   },
// //   Inventory: {
// //     flex: 1,
// //     backgroundColor: colors.neutral900,
// //     borderTopRightRadius: radius._30,
// //     borderTopLeftRadius: radius._30,
// //     padding: spacingX._20,
// //     paddingTop: spacingX._25,
// //   },
// //   listStyle: {
// //     paddingVertical: spacingY._25,
// //     paddingTop: spacingY._15,
// //   },
// //   pickerWrapper: {
// //     backgroundColor: "#fff",
// //     borderRadius: 16,
// //     overflow: "hidden",
// //     height: "8%",
// //   },
// //   sortPicker: {
// //     height: "100%",
// //     width: "100%",
// //     color: "#000",
// //   },
// //   inventory: {
// //     flex: 1,
// //     backgroundColor: colors.neutral900,
// //     borderTopRightRadius: radius._30,
// //     borderTopLeftRadius: radius._30,
// //     padding: spacingX._20,
// //     paddingTop: spacingX._25,
// //   },
// //   productCard: {
// //     backgroundColor: colors.neutral100,
// //     padding: 2,
// //     borderRadius: 8,
// //     marginBottom: 5,
// //   },
// //   productCardFirst: {
// //     flexDirection: "row",
// //     width: "100%",
// //     height: 100,
// //     justifyContent: "space-around",
// //     gap: 3,
// //     padding: 3,
// //   },
// //   insideChild: {
// //     width: "70%",
// //     height: "100%",
// //     flexDirection: "column",
// //     alignItems: "flex-start",
// //     paddingLeft: 5,
// //   },
// //   productImage: {
// //     flex: 1,
// //     width: "30%",
// //     height: "100%",
// //     borderRadius: 8,
// //   },
// //   productName: {
// //     flex: 1,
// //     color: colors.black,
// //     fontSize: 14,
// //   },
// //   productDetail: {
// //     flex: 1,
// //     color: colors.black,
// //     fontSize: 12,
// //   },
// //   addButton: {
// //     backgroundColor: "#a3e635",
// //     padding: 12,
// //     borderRadius: 8,
// //     alignItems: "center",
// //     marginVertical: 16,
// //   },
// //   addText: {
// //     color: "#000",
// //     fontWeight: "bold",
// //   },
// // });
// // function useAuth(): { user: any; } {
// //   throw new Error("Function not implemented.");
// // }
// // <ScrollView style={{ flex: 1 }}>
// //           {filteredAndSorted.map((item) => {
// //             const isExpiringSoon =
// //               item.expireDate &&
// //               (() => {
// //                 let expireDateObj: Date;
// //                 if (
// //                   typeof item.expireDate === "object" &&
// //                   item.expireDate !== null &&
// //                   "toDate" in item.expireDate &&
// //                   typeof item.expireDate.toDate === "function"
// //                 ) {
// //                   expireDateObj = item.expireDate.toDate();
// //                 } else {
// //                   expireDateObj = new Date(
// //                     item.expireDate as string | number | Date
// //                   );
// //                 }
// //                 return (
// //                   expireDateObj.getTime() - Date.now() <=
// //                   30 * 24 * 60 * 60 * 1000
// //                 );
// //               })();

// //             return (
// //               <TouchableOpacity
// //                 key={item.id}
// //                 style={styles.productCard}
// //                 onPress={() => item.id && handleSelectProduct(item.id)}
// //               >
// //                 <View style={styles.productCardFirst}>
// //                   {item.image && (
// //                     <Image
// //                       source={{ uri: item.image }}
// //                       style={styles.productImage}
// //                     />
// //                   )}
// //                   <View style={styles.insideChild}>
// //                     <Typo style={styles.productName}>
// //                       Product Name: {item.name}
// //                     </Typo>
// //                     <Typo style={styles.productDetail}>
// //                       Product price: ${item.purchasedPrice}
// //                     </Typo>
// //                     <Typo style={styles.productDetail}>
// //                       Product Quantity: {item.quantity}
// //                     </Typo>
// //                     {isExpiringSoon && (
// //                       <Text
// //                         style={{
// //                           alignSelf: "center",
// //                           color: "red",
// //                           fontWeight: "bold",
// //                         }}
// //                       >
// //                         ⚠️ Expiring Soon
// //                       </Text>
// //                     )}
// //                   </View>
// //                 </View>
// //               </TouchableOpacity>
// //             );
// //           })}
// //         </ScrollView>
