import { firestore } from "@/config/firebase.client";
import { colors } from "@/constants/theme";
import { ExpensesType, ResponseType, SellType } from "@/types";
import {
  getLast12Months,
  getLast7Days
} from "@/utils/dateHelpers"; // باید وجود داشته باشد
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { scale } from "react-native-size-matters";

// تابع کمکی تبدیل تاریخ از هر نوع به Date استاندارد
function parseDate(value: any): Date | null {
  if (!value) return null;

  if (value instanceof Timestamp) {
    return value.toDate();
  }
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === "string") {
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d;
  }
  if (typeof value === "number") {
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d;
  }

  return null;
}

export const fetchWeeklyStatsSalesExpenses =
  async (): Promise<ResponseType> => {
    try {
      const db = firestore;
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6); // شامل امروز و 6 روز قبل

      // 1. Query for sales
      const salesQuery = query(
        collection(db, "sales"),
        where("date", ">=", Timestamp.fromDate(sevenDaysAgo)),
        where("date", "<=", Timestamp.fromDate(today)),
        orderBy("date", "desc")
      );

      // 2. Query for expenses
      const expensesQuery = query(
        collection(db, "expenses"),
        where("created", ">=", Timestamp.fromDate(sevenDaysAgo)),
        where("created", "<=", Timestamp.fromDate(today)),
        orderBy("date", "desc") // توجه کنید orderBy روی همان فیلدی باشد که where زدید
      );

      const [salesSnapshot, expensesSnapshot] = await Promise.all([
        getDocs(salesQuery),
        getDocs(expensesQuery),
      ]);

      const weeklyData = getLast7Days(); // returns: [{ day: "Mon", date: "2025-06-15", income: 0, expense: 0 }, ...]

      const sales: SellType[] = [];
      const expenses: ExpensesType[] = [];

      // 3. Process sales (as income)
      salesSnapshot.forEach((doc) => {
        const sale = doc.data() as SellType;
        sale.id = doc.id;
        sales.push(sale);

        const dateObj = parseDate(sale.date);
        if (!dateObj) return;
        const saleDate = dateObj.toISOString().split("T")[0];

        const dayData = weeklyData.find((day) => day.date === saleDate);
        if (dayData) {
          dayData.income += sale.PriceAfterLoan || 0; // استفاده از فیلد قیمت نهایی فروش
        }
      });

      // 4. Process expenses
      expensesSnapshot.forEach((doc) => {
        const expense = doc.data() as ExpensesType;
        expense.id = doc.id;
        expenses.push(expense);

        const dateObj = parseDate(expense.date);
        if (!dateObj) return;
        const expenseDate = dateObj.toISOString().split("T")[0];

        const dayData = weeklyData.find((day) => day.date === expenseDate);
        if (dayData) {
          dayData.expense += expense.amount || 0;
        }
      });

      // 5. Prepare chart data
      const stats = weeklyData.flatMap((day) => [
        {
          value: day.income,
          label: day.day,
          spacing: scale(4),
          labelWidth: scale(30),
          frontColor: colors.primary,
        },
        {
          value: day.expense,
          frontColor: colors.rose,
        },
      ]);

      return {
        success: true,
        data: {
          stats,
          sales,
          expenses,
        },
      };
    } catch (err: any) {
      console.log("error fetching weekly stats: ", err);
      return {
        success: false,
        msg: err.message,
      };
    }
  };

export const fetchMonthlyStatsSalesExpenses =
  async (): Promise<ResponseType> => {
    try {
      const db = firestore;
      const today = new Date();
      const twelveMonthsAgo = new Date(
        today.getFullYear(),
        today.getMonth() - 11,
        1
      );

      // Query sales
      const salesQuery = query(
        collection(db, "sales"),
        where("date", ">=", Timestamp.fromDate(twelveMonthsAgo)),
        where("date", "<=", Timestamp.fromDate(today)),
        orderBy("date", "desc")
      );

      // Query expenses
      const expensesQuery = query(
        collection(db, "expenses"),
        where("created", ">=", Timestamp.fromDate(twelveMonthsAgo)),
        where("created", "<=", Timestamp.fromDate(today)),
        orderBy("created", "desc")
      );

      const [salesSnapshot, expensesSnapshot] = await Promise.all([
        getDocs(salesQuery),
        getDocs(expensesQuery),
      ]);

      const monthlyData = getLast12Months();
      const sales: SellType[] = [];
      const expenses: ExpensesType[] = [];

      salesSnapshot.forEach((doc) => {
        const sale = doc.data() as SellType;
        sale.id = doc.id;
        sales.push(sale);

        const dateObj = parseDate(sale.date);
        if (!dateObj) return;
        const monthName = dateObj.toLocaleDateString("default", {
          month: "short",
        });
        const shortYear = dateObj.getFullYear().toString().slice(-2);
        const key = `${monthName} ${shortYear}`;

        const monthData = monthlyData.find((m) => m.month === key);
        if (monthData) {
          monthData.income += sale.PriceAfterLoan || 0;
        }
      });

      expensesSnapshot.forEach((doc) => {
        const exp = doc.data() as ExpensesType;
        exp.id = doc.id;
        expenses.push(exp);

        const dateObj = parseDate(exp.date);
        if (!dateObj) return;
        const monthName = dateObj.toLocaleDateString("default", {
          month: "short",
        });
        const shortYear = dateObj.getFullYear().toString().slice(-2);
        const key = `${monthName} ${shortYear}`;

        const monthData = monthlyData.find((m) => m.month === key);
        if (monthData) {
          monthData.expense += exp.amount || 0;
        }
      });

      const stats = monthlyData.flatMap((month) => [
        {
          value: month.income,
          label: month.month,
          spacing: scale(4),
          labelWidth: scale(46),
          frontColor: colors.primary,
        },
        {
          value: month.expense,
          frontColor: colors.rose,
        },
      ]);

      return {
        success: true,
        data: {
          stats,
          sales,
          expenses,
        },
      };
    } catch (err: any) {
      console.log("error fetching monthly stats: ", err);
      return { success: false, msg: "Failed to fetch monthly stats" };
    }
  };
// export const fetchYearlyStatsSalesExpenses =
//   async (): Promise<ResponseType> => {
//     try {
//       const db = firestore;

//       // Fetch all sales and expenses
//       const [salesSnapshot, expensesSnapshot] = await Promise.all([
//         getDocs(query(collection(db, "sales"))),
//         getDocs(query(collection(db, "expenses"))),
//       ]);

//       const sales: SellType[] = [];
//       const expenses: ExpensesType[] = [];

//       let allDates: Date[] = [];

//       salesSnapshot.forEach((doc) => {
//         const sale = doc.data() as SellType;
//         sale.id = doc.id;
//         sales.push(sale);

//         const dateObj = parseDate(sale.date);
//         if (dateObj) allDates.push(dateObj);
//       });

//       expensesSnapshot.forEach((doc) => {
//         const exp = doc.data() as ExpensesType;
//         exp.id = doc.id;
//         expenses.push(exp);

//         const dateObj = parseDate(exp.date);
//         if (dateObj) allDates.push(dateObj);
//       });

//       const firstTransactionDate =
//         allDates.length > 0
//           ? allDates.reduce((earliest, d) => (d < earliest ? d : earliest))
//           : new Date();

//       const firstYear = firstTransactionDate.getFullYear();
//       const currentYear = new Date().getFullYear();

//       const yearlyData = getYearsRange(firstYear, currentYear);

//       sales.forEach((sale) => {
//         const dateObj = parseDate(sale.date);
//         if (!dateObj) return;

//         const year = dateObj.getFullYear().toString();
//         const yearData = yearlyData.find((y) => y.year === year);
//         if (yearData) {
//           yearData.income += sale.PriceAfterLoan || 0;
//         }
//       });

//       expenses.forEach((exp) => {
//         const dateObj = parseDate(exp.date);
//         if (!dateObj) return;

//         const year = dateObj.getFullYear().toString();
//         const yearData = yearlyData.find((y) => y.year === year);
//         if (yearData) {
//           yearData.expense += exp.amount || 0;
//         }
//       });

//       const stats = yearlyData.flatMap((year) => [
//         {
//           value: year.income,
//           label: year.year,
//           spacing: scale(4),
//           labelWidth: scale(35),
//           frontColor: colors.primary,
//         },
//         {
//           value: year.expense,
//           frontColor: colors.rose,
//         },
//       ]);

//       return {
//         success: true,
//         data: {
//           stats,
//           sales,
//           expenses,
//         },
//       };
//     } catch (err: any) {
//       console.log("error fetching yearly stats: ", err);
//       return { success: false, msg: "Failed to fetch yearly stats" };
//     }
//   };
