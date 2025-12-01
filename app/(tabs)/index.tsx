import HomeCard from "@/components/HomeCard";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, spacingX } from "@/constants/theme";
import { useAuth } from "@/contexts/authContext";
import { getProfileImage } from "@/services/imageServices";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import React from "react";
import { Alert, Button, StyleSheet, TouchableOpacity, View } from "react-native";
import { verticalScale } from "react-native-size-matters";
import * as Location from "expo-location";
import { firestore } from "@/config/firebase.client";
const Home = () => {
  const { user } = useAuth();
  const router = useRouter();
  const handleShareLocation = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("اجازه رد شد", "برای اشتراک‌گذاری موقعیت، اجازه لازم است.");
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    const reverse = await Location.reverseGeocodeAsync(location.coords);

    const address = reverse[0]
      ? `${reverse[0].city}, ${reverse[0].region}, ${reverse[0].country}`
      : "آدرس نامشخص";

    // اگر از auth context استفاده می‌کنی

    if (!user) {
      Alert.alert("خطا", "کاربر یافت نشد. لطفاً دوباره وارد شوید.");
      return;
    }
    await addDoc(collection(firestore, "sharedLocations"), {
      uid: user.uid,
      displayName: user.name || "کاربر ناشناس",
      coords: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      },
      address,
      createdAt: serverTimestamp(),
    });

    Alert.alert("موفقیت ✅", "موقعیت شما با موفقیت برای ادمین ارسال شد.");

  } catch (error) {
    console.error("خطا در اشتراک‌گذاری موقعیت:", error);
    Alert.alert("خطا", "اشتراک‌گذاری موقعیت با خطا مواجه شد.");
  }
};
  const buttons = [
    { label: "add Sale", route: "/(modals)/addSaleMOdal" },
    { label: "add brand", route: "/(modals)/BrandFormScreen" },
    { label: "add Expense", route: "/(modals)/ExpenseScreen" },
    { label: "show expese", route: "/(modals)/expenses" },
    { label: "send Message", route: "/(modals)/AdminMessageForm" },
    { label: "Messages", route: "/(modals)/messagesScreen" },
    { label: "expense1", route: "/(Screens)/ExpenseScreen" },
    { label: "brands", route: "/(modals)/BrandsLIstScreen" },
    { label: "brands", route: "/(modals)/BrandsLIstScreen" },
  ];
  const chunk = (arr: any, size: any) =>
    Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
      arr.slice(i * size, i * size + size)
    );
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.userDetails}>
          <Image
            source={getProfileImage(user?.image)}
            style={styles.avatar}
            contentFit="cover"
            transition={100}
          />
          <Typo size={15} fontWeight={"600"} style={styles.userName}>
            {user?.name}
          </Typo>
        </View>
        <View>
          <HomeCard />
        </View>
        <View style={styles.btnContainer}>
          {chunk(buttons, 2).map((row, index) => (
            <View style={styles.row} key={index}>
              {row.map((item: any, i: any) => (
                <TouchableOpacity
                  key={i}
                  style={styles.button}
                  onPress={() => router.push(item.route)}
                >
                  <Typo style={styles.buttonText}>{item.label}</Typo>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
        <Button
          title="📍 اشتراک‌گذاری موقعیت با ادمین"
          onPress={handleShareLocation}
        />
      </View>
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {},
  userDetails: {
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingLeft: 20,
    paddingTop: 20,
  },
  img: {},
  avatar: {
    alignSelf: "center",
    backgroundColor: colors.neutral300,
    height: verticalScale(35),
    width: verticalScale(35),
    borderRadius: 200,
    borderWidth: 2,
    borderColor: colors.white,
  },
  userName: {
    padding: spacingX._7,
  },
  btnContainer: {
    padding: 16,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: "#a3e635", // رنگ سبز ملایم
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
  },
  buttonText: {
    color: "#1a1a1a",
    fontWeight: "600",
    fontSize: 16,
  },
});

// import Button from "@/components/Button";
// import Typo from "@/components/Typo";
// import { colors } from "@/constants/theme";
// import { formatFirestoreDate } from "@/services/changingDate";
// import { getAllSales } from "@/services/sellServices";
// import { SellType } from "@/types";
// import { moderateScale } from "@/utils/styling";
// import { useRouter } from "expo-router";
// import * as Icons from "phosphor-react-native";
// import { Coins, HandCoins } from "phosphor-react-native";
// import { useEffect, useState } from "react";
// import {
//   FlatList,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// const Home = () => {
//   const [sales, setSales] = useState<SellType[]>([]);
//   const [todaySales, setTodaySales] = useState<SellType[]>([]);
//   const [totalToday, setTotalToday] = useState(0);
//   const router = useRouter();
//   useEffect(() => {
//     loadSales();
//   }, []);

//   const loadSales = async () => {
//     const all = await getAllSales();
//     setSales(all);

//     // فیلتر فروش‌های امروز
//     const today = new Date();
//     const filtered = all.filter((sale) => {
//       const saleDate = new Date(sale.date as string);
//       return (
//         saleDate.getDate() === today.getDate() &&
//         saleDate.getMonth() === today.getMonth() &&
//         saleDate.getFullYear() === today.getFullYear()
//       );
//     });
//     setTodaySales(filtered);

//     // جمع کل درآمد امروز
//     const total = filtered.reduce((sum, sale) => {
//       return sum + sale.PriceAfterLoan * sale.quantity;
//     }, 0);

//     setTotalToday(total);
//   };

//   const renderItem = ({ item }: { item: SellType }) => {
//     const isLoan = item.loan;
//     return (
//       <View style={styles.card}>
//         <View style={styles.icon}>
//           {isLoan ? (
//             <HandCoins size={24} color="#f97316" weight="duotone" />
//           ) : (
//             <Coins size={24} color="#22c55e" weight="duotone" />
//           )}
//         </View>
//         <View style={{ flex: 1 }}>
//           <Text style={styles.title}>{item.customerName || "مشتری"}</Text>
//           <Text style={styles.title}>{item.quantity} عدد</Text>
//           <Text style={{ color: "#6b7280" }}>
//             {typeof item.date === "object" &&
//             "seconds" in item.date &&
//             "nanoseconds" in item.date
//               ? formatFirestoreDate(item.date)
//               : ""}
//           </Text>
//         </View>
//         <Text
//           style={{
//             color: isLoan ? "#f97316" : "#22c55e",
//             fontWeight: "bold",
//           }}
//         >
//           {item.PriceAfterLoan} افغانی
//         </Text>
//         <TouchableOpacity onPress={() => router.navigate("/(modals)/AddOrEditProductForm")}>
//           <Icons.Pencil
//             size={moderateScale(18)}
//             color={colors.primary}
//             weight="fill"
//           />
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   return (
//     <View style={{ flex: 1, padding: 16 }}>
//       {/* آمار بالا */}
//       <View style={styles.summaryContainer}>
//         <View style={styles.summaryBox}>
//           <Text style={styles.summaryLabel}>🔢 تعداد فروش امروز</Text>
//           <Text style={styles.summaryValue}>{todaySales.length}</Text>
//         </View>
//         <View style={styles.summaryBox}>
//           <Text style={styles.summaryLabel}>💰 مجموع فروش امروز</Text>
//           <Text style={styles.summaryValue}>{totalToday} AF</Text>
//         </View>
//       </View>
//       <View
//         style={{
//           flexDirection: "row",
//           justifyContent: "space-between",
//           gap: 6,
//           marginBottom: 20,
//         }}
//       >
//         <View style={{ flex: 1, marginRight: 6 }}>
//           <Button onPress={() => router.push("/(modals)/addSaleMOdal")}>
//             <Typo>➕ فروش جدید</Typo>
//           </Button>
//         </View>
//         <View style={{ flex: 1, marginLeft: 6 }}>
//           <Button onPress={() => router.push("/(modals)/AdminMessageForm")}>
//             <Typo>💬 پیام‌ها</Typo>
//           </Button>
//         </View>
//         <View style={{ flex: 1 }}>
//           <Button onPress={() => router.push("/(modals)/expenseForm")}>
//             <Typo>💸 هزینه جدید</Typo>
//           </Button>
//         </View>
//       </View>
//       {/* لیست فروش‌ها */}
//       <Text style={styles.sectionTitle}>🧾 فروش‌های اخیر</Text>
//       <FlatList
//         data={sales}
//         keyExtractor={(item) => item.id!}
//         renderItem={renderItem}
//         contentContainerStyle={{ paddingBottom: 100 }}
//       />
//     </View>
//   );
// };

// export default Home;

// const styles = StyleSheet.create({
//   summaryContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 16,
//   },
//   summaryBox: {
//     flex: 1,
//     backgroundColor: "#f1f5f9",
//     padding: 16,
//     marginHorizontal: 4,
//     borderRadius: 12,
//   },
//   summaryLabel: {
//     fontSize: 14,
//     color: "#64748b",
//   },
//   summaryValue: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginTop: 4,
//     color: "#0f172a",
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 10,
//   },
//   card: {
//     flexDirection: "row",
//     backgroundColor: "#fff",
//     padding: 12,
//     marginBottom: 10,
//     borderRadius: 10,
//     alignItems: "center",
//     gap: 10,
//     elevation: 1,
//   },
//   icon: {
//     padding: 6,
//     borderRadius: 6,
//     backgroundColor: "#f3f4f6",
//   },
//   title: {
//     fontWeight: "bold",
//     fontSize: 16,
//   },
// });

// // import ScreenWrapper from "@/components/ScreenWrapper";
// // import Typo from "@/components/Typo";
// // import { colors, radius, spacingY } from "@/constants/theme";
// // import { formatFirestoreTimestamp } from "@/services/changingDate";
// // import { useFocusEffect, useRouter } from "expo-router";
// // import { getAuth } from "firebase/auth";
// // import { collection, getDocs, getFirestore } from "firebase/firestore";
// // import React, { useEffect, useState } from "react";
// // import {
// //   FlatList,
// //   StyleSheet,
// //   Text,
// //   TextInput,
// //   TouchableOpacity,
// //   View,
// // } from "react-native";

// // const db = getFirestore();
// // const auth = getAuth();

// // const HomeScreen = () => {
// //   const router = useRouter();
// //   const [username, setUsername] = useState("");
// //   const [search, setSearch] = useState("");
// //   type RecordType = {
// //     type: string;
// //     id: string;
// //     date: any;
// //     inventoryProduct?: string; // Add this line
// //     title?: string; // Optionally add this for expense records
// //     Price?: number; // Optionally add this for sale records
// //     expenseCost?: number; // Optionally add this for expense records
// //     [key: string]: any;
// //   };
// //   const [records, setRecords] = useState<RecordType[]>([]);
// //   const [sortType, setSortType] = useState<"date" | "name" | "price">("date");
// //   const [summary, setSummary] = useState({ totalItems: 0, totalPrice: 0 });

// //   useEffect(() => {
// //     const user = auth.currentUser;
// //     if (user) {
// //       setUsername(user.displayName || "User");
// //     }
// //   }, []);

// //   const fetchRecords = async () => {
// //     const salesSnap = await getDocs(collection(db, "sales"));
// //     const expensesSnap = await getDocs(collection(db, "expenses"));

// //     const sales = salesSnap.docs.map((doc) => ({
// //       ...doc.data(),
// //       type: "sale",
// //       id: doc.id,
// //       date: doc.data().date || doc.data().created || "", // Ensure 'date' exists
// //       inventoryProduct: doc.data().inventoryProduct || "", // Ensure property exists
// //       title: "", // Provide default for title
// //       Price: doc.data().Price || 0,
// //       expenseCost: 0,
// //     }));

// //     const expenses = expensesSnap.docs.map((doc) => ({
// //       ...doc.data(),
// //       type: "expense",
// //       id: doc.id,
// //       date: doc.data().date || doc.data().created || "", // Ensure 'date' exists
// //       inventoryProduct: "", // Provide default for inventoryProduct
// //       title: doc.data().title || "",
// //       Price: 0,
// //       expenseCost: doc.data().expenseCost || doc.data().amount || 0,
// //     }));

// //     const thisMonth = new Date().getMonth();
// //     const thisYear = new Date().getFullYear();

// //     const thisMonthSales = sales.filter((s: any) => {
// //       const d = new Date(s.date);
// //       return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
// //     });

// //     const totalItems = thisMonthSales.length;
// //     const totalPrice = thisMonthSales.reduce(
// //       (sum: number, s: any) => sum + (s.Price || 0),
// //       0
// //     );

// //     const all = [...sales, ...expenses];
// //     let filtered = all.filter((item: any) => {
// //       const name = item.type === "sale" ? item.inventoryProduct : item.title;
// //       return name.toLowerCase().includes(search.toLowerCase());
// //     });

// //     if (sortType === "date") {
// //       filtered.sort(
// //         (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
// //       );
// //     } else if (sortType === "name") {
// //       filtered.sort((a, b) => {
// //         const nameA = a.type === "sale" ? a.inventoryProduct : a.title;
// //         const nameB = b.type === "sale" ? b.inventoryProduct : b.title;
// //         return nameA.localeCompare(nameB);
// //       });
// //     } else if (sortType === "price") {
// //       filtered.sort((a, b) => {
// //         const aPrice = a.type === "sale" ? a.Price : a.expenseCost;
// //         const bPrice = b.type === "sale" ? b.Price : b.expenseCost;
// //         return (bPrice || 0) - (aPrice || 0);
// //       });
// //     }

// //     setRecords(filtered);
// //     setSummary({ totalItems, totalPrice });
// //   };

// //   useFocusEffect(
// //     React.useCallback(() => {
// //       fetchRecords();
// //       // eslint-disable-next-line react-hooks/exhaustive-deps
// //     }, [])
// //   );
// //   const renderItem = ({ item }: any) => (
// //     <View style={styles.recordCard}>
// //       <Text style={styles.icon}>{item.type === "sale" ? "💰" : "🧾"}</Text>
// //       <View style={{ flex: 1 }}>
// //         <Text style={styles.title}>
// //           {item.type === "sale" ? item.inventoryProduct : item.title}
// //         </Text>
// //         <Text style={styles.date}>{item.date}</Text>
// //       </View>
// //       <Text style={styles.price}>{item.Price || item.expenseCost}$</Text>
// //     </View>
// //   );

// //   return (
// // <ScreenWrapper style={styles.container} scrollable={false}>
// //     <Typo size={20} style={styles.greeting}>سلام، {username}</Typo>

// //     <TextInput
// //       value={search}
// //       onChangeText={setSearch}
// //       placeholder="جستجو در رکوردها..."
// //       style={styles.searchBar}
// //       placeholderTextColor={colors.neutral500}
// //     />

// //     <View style={styles.summaryContainer}>
// //       <Typo style={styles.summaryText}>
// //         {summary.totalItems} آیتم فروخته شده
// //       </Typo>
// //       <Typo style={styles.summaryText}>
// //         {summary.totalPrice.toLocaleString()} تومان جمع کل
// //       </Typo>
// //     </View>

// //     <View style={styles.actions}>
// //       <TouchableOpacity
// //         onPress={() => router.push("/(modals)/addSaleMOdal")}
// //         style={styles.button}
// //       >
// //         <Typo>فروش</Typo>
// //       </TouchableOpacity>
// //             <TouchableOpacity
// //         onPress={() => router.push("/(modals)/salesScreen")}
// //         style={styles.button}
// //       >
// //         <Typo>list3</Typo>
// //       </TouchableOpacity>
// //             <TouchableOpacity
// //         onPress={() => router.push("/(modals)/salesList")}
// //         style={styles.button}
// //       >
// //         <Typo>list2</Typo>
// //       </TouchableOpacity>
// //             <TouchableOpacity
// //         onPress={() => router.push("/(modals)/loanCustomerScreen")}
// //         style={styles.button}
// //       >
// //         <Typo>list</Typo>
// //       </TouchableOpacity>
// //       <TouchableOpacity
// //         onPress={() => router.push("/(modals)/ExpenseScreen")}
// //         style={styles.button}
// //       >
// //         <Typo>هزینه</Typo>
// //       </TouchableOpacity>
// //       <TouchableOpacity
// //         onPress={() => {
// //           const next =
// //             sortType === "date"
// //               ? "name"
// //               : sortType === "name"
// //               ? "price"
// //               : "date";
// //           setSortType(next);
// //         }}
// //         style={styles.button}
// //       >
// //         <Typo>مرتب سازی ({sortType === "date" ? "تاریخ" : sortType === "name" ? "نام" : "قیمت"})</Typo>
// //       </TouchableOpacity>
// //     </View>

// //     <FlatList
// //       data={records}
// //       keyExtractor={(item) => item.id}
// //       renderItem={({ item }) => (
// //         <View style={styles.recordItem}>
// //           <Typo size={16}>
// //             {item.type === "sale" ? item.inventoryProduct : item.title}
// //           </Typo>
// //           <Typo size={14} color={colors.neutral500}>
// //             {formatFirestoreTimestamp(item.date)}
// //           </Typo>
// //           <Typo size={16} color={item.type === "sale" ? "green" : colors.rose}>
// //             {item.type === "sale" ? "+" : "-"}{item.Price || item.expenseCost} تومان
// //           </Typo>
// //         </View>
// //       )}
// //       contentContainerStyle={styles.listContent}
// //       ListEmptyComponent={
// //         <Typo style={styles.emptyText}>رکوردی یافت نشد</Typo>
// //       }
// //     />
// //   </ScreenWrapper>

// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: { flex: 1, padding: 20, backgroundColor: "#fff" },
// //   greeting: { fontSize: 18, marginBottom: 10 },
// //   searchBar: {
// //     borderWidth: 1,
// //     borderRadius: 6,
// //     padding: 10,
// //     marginBottom: 10,
// //   },
// //   summaryContainer: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     marginBottom: 10,
// //   },
// //   summaryText: { fontSize: 16, fontWeight: "bold" },
// //   actions: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     marginBottom: 10,
// //   },
// //   button: {
// //     backgroundColor: "#ddd",
// //     padding: 10,
// //     borderRadius: 6,
// //   },
// //   recordCard: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     backgroundColor: "#f9f9f9",
// //     padding: 10,
// //     marginBottom: 10,
// //     borderRadius: 6,
// //   },
// //   icon: { fontSize: 24, marginRight: 10 },
// //   title: { fontSize: 16, fontWeight: "bold" },
// //   date: { fontSize: 12, color: "#666" },
// //   price: { fontSize: 16, fontWeight: "bold", color: "green" },
// //     recordItem: {
// //     backgroundColor: colors.neutral800,
// //     borderRadius: radius._10,
// //     padding: spacingY._12,
// //     marginBottom: spacingY._7,
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //   },
// //   listContent: {
// //     paddingBottom: 150,
// //   },
// //   emptyText: {
// //     textAlign: 'center',
// //     marginTop: spacingY._25,
// //     color: colors.neutral500,
// //   },
// // });

// // export default HomeScreen;
