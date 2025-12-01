// // components/PaymentTypeSelector.tsx
// import { colors } from "@/constants/theme";
// import React from "react";
// import { StyleSheet, TouchableOpacity, View } from "react-native";
// import Typo from "./Typo";

// interface PaymentTypeSelectorProps {
//   type: "full" | "installment";
//   onChange: (type: "full" | "installment") => void;
// }

// const PaymentTypeSelector: React.FC<PaymentTypeSelectorProps> = ({
//   type,
//   onChange,
// }) => {
//   return (
//     <View style={styles.container}>
//       <TouchableOpacity
//         style={[styles.button, type === "full" && styles.activeButton]}
//         onPress={() => onChange("full")}
//       >
//         <Typo style={type === "full" ? styles.activeText : styles.inactiveText}>
//           پرداخت کامل
//         </Typo>
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={[styles.button, type === "installment" && styles.activeButton]}
//         onPress={() => onChange("installment")}
//       >
//         <Typo
//           style={
//             type === "installment" ? styles.activeText : styles.inactiveText
//           }
//         >
//           پرداخت اقساطی
//         </Typo>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: "row",
//     marginBottom: 16,
//     borderRadius: 8,
//     overflow: "hidden",
//     borderWidth: 1,
//     borderColor: "#e0e0e0",
//   },
//   button: {
//     flex: 1,
//     paddingVertical: 12,
//     alignItems: "center",
//     backgroundColor: colors.neutral700,
//   },
//   activeButton: {
//     backgroundColor: colors.white,
//   },
//   activeText: {
//     color: colors.black,
//     fontWeight: "bold",
//   },
//   inactiveText: {
//     color: colors.neutral100,
//   },
// });

// export default PaymentTypeSelector;
