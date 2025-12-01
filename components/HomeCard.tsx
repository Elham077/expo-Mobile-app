import { colors, spacingX, spacingY } from "@/constants/theme";
import { useAuth } from "@/contexts/authContext";
import useFetchData from "@/hooks/useFetchData";
import { ExpensesType, SellType } from "@/types";
import { scale, verticalScale } from "@/utils/styling";
import { orderBy } from "firebase/firestore";
import * as Icons from "phosphor-react-native";
import React, { useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Typo from "./Typo";

const HomeCard = () => {
  const { user } = useAuth();
  const [refreshFlag, setRefreshFlag] = useState(false);
  const { data: sales = [], loading: salesLoading } = useFetchData<SellType>(
    "sales",
    [orderBy("date", "desc")],
    [refreshFlag]
  );
  const { data: expenses = [], loading: expensesLoading } =
    useFetchData<ExpensesType>(
      "expenses",
      [orderBy("date", "desc")],
      [refreshFlag]
    );

  const loading = salesLoading || expensesLoading;

  const getTotals = () => {
    const totals = {
      balance: 0,
      income: 0,
      salesCount: 0,
      expenses: 0,
    };

    sales.forEach((s) => {
      totals.income += Number(s.PriceAfterLoan ?? 0);
      totals.salesCount += Number(s.quantity ?? 1);
    });

    expenses.forEach((e) => {
      totals.expenses += Number(e.amount ?? 0);
    });

    // اصلاح: مقدار کل موجودی = درآمد - هزینه‌ها
    totals.balance = totals.income - totals.expenses;

    return totals;
  };

  const totals = getTotals();

  return (
    <ImageBackground
      source={require("../assets/images/card.png")}
      resizeMode="stretch"
      style={styles.bgImage}
    >
      <View style={styles.container}>
        <View>
          {/* Total Balance */}
          <View style={styles.totalBalanceRow}>
            <Typo color={colors.neutral800} size={17} fontWeight={"500"}>
              Total sold Balance
            </Typo>
            <TouchableOpacity onPress={() => setRefreshFlag((prev) => !prev)}>
              <Icons.Repeat
                size={verticalScale(23)}
                color={colors.black}
                weight="fill"
              />
            </TouchableOpacity>
          </View>
          <Typo color={colors.black} size={30} fontWeight={"bold"}>
            Af {loading ? "-----" : totals.balance.toFixed(2)}
          </Typo>
        </View>

        {/* تعداد محصولات فروخته شده */}
        <View style={{ marginVertical: verticalScale(8) }}>
          <Typo size={18} fontWeight="600" color={colors.neutral700}>
            Total Sold Items: {loading ? "-----" : totals.salesCount}
          </Typo>
        </View>

        {/* total expense and income */}
        <View style={styles.stats}>
          {/*  income   */}
          <View style={{ gap: verticalScale(5) }}>
            <View style={styles.incomeExpense}>
              <View style={styles.stateIcon}>
                <Icons.ArrowDown
                  size={verticalScale(15)}
                  color={colors.black}
                  weight="bold"
                />
              </View>
              <Typo size={16} color={colors.neutral700} fontWeight={"500"}>
                Sales
              </Typo>
            </View>
            <View style={{ alignSelf: "center" }}>
              <Typo size={17} color={colors.green} fontWeight={"600"}>
                Af {loading ? "-----" : totals.income.toFixed(2)}
              </Typo>
            </View>
          </View>

          {/*  expense   */}
          <View style={{ gap: verticalScale(5) }}>
            <View style={styles.incomeExpense}>
              <View style={styles.stateIcon}>
                <Icons.ArrowUp
                  size={verticalScale(15)}
                  color={colors.black}
                  weight="bold"
                />
              </View>
              <Typo size={16} color={colors.neutral700} fontWeight={"500"}>
                Expense
              </Typo>
            </View>
            <View style={{ alignSelf: "center" }}>
              <Typo size={17} color={colors.rose} fontWeight={"600"}>
                Af {loading ? "-----" : totals.expenses.toFixed(2)}
              </Typo>
            </View>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

export default HomeCard;

const styles = StyleSheet.create({
  bgImage: {
    height: scale(210),
    width: "100%",
  },
  container: {
    padding: spacingX._20,
    paddingHorizontal: scale(23),
    height: "87%",
    width: "100%",
    justifyContent: "space-between",
  },
  totalBalanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._5,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stateIcon: {
    backgroundColor: colors.neutral350,
    padding: spacingY._5,
    borderRadius: 50,
  },
  incomeExpense: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingY._7,
  },
});
