import { Dimensions, ScrollView, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useEffect, useState } from "react";
import { getAllSales } from "@/services/sellServices";
import { getAllExpenses } from "@/services/expense";
import { SellType, ExpensesType } from "@/types";

const screenWidth = Dimensions.get("window").width;

const ReportChart = () => {
  const [salesData, setSalesData] = useState<number[]>([]);
  const [expenseData, setExpenseData] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
    loadChartData();
  }, []);

  const loadChartData = async () => {
    const sales: SellType[] = await getAllSales();
    const expenses: ExpensesType[] = await getAllExpenses();

    // تولید لیبل‌های 7 روز اخیر
    const today = new Date();
    const last7Days: string[] = [];
    const dayTotals: { [key: string]: { sales: number; expenses: number } } = {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const label = `${d.getMonth() + 1}/${d.getDate()}`;
      last7Days.push(label);
      dayTotals[label] = { sales: 0, expenses: 0 };
    }

    // پر کردن مجموع‌ها
    sales.forEach((sale) => {
      const d = new Date(sale.date as string);
      const label = `${d.getMonth() + 1}/${d.getDate()}`;
      if (label in dayTotals) {
        dayTotals[label].sales += sale.PriceAfterLoan * sale.quantity;
      }
    });

    expenses.forEach((exp) => {
      const d = new Date(exp.date as string);
      const label = `${d.getMonth() + 1}/${d.getDate()}`;
      if (label in dayTotals) {
        dayTotals[label].expenses += exp.amount;
      }
    });

    setLabels(last7Days);
    setSalesData(last7Days.map((l) => dayTotals[l].sales));
    setExpenseData(last7Days.map((l) => dayTotals[l].expenses));
  };

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 20 }}>📊 نمودار فروش و هزینه (هفتگی)</Text>

      <LineChart
        data={{
          labels: labels,
          datasets: [
            {
              data: salesData,
              color: () => "#22c55e", // فروش
              strokeWidth: 2,
            },
            {
              data: expenseData,
              color: () => "#ef4444", // هزینه
              strokeWidth: 2,
            },
          ],
          legend: ["فروش", "هزینه"],
        }}
        width={screenWidth - 32}
        height={260}
        yAxisSuffix=" AF"
        chartConfig={{
          backgroundGradientFrom: "#ffffff",
          backgroundGradientTo: "#ffffff",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(17, 24, 39, ${opacity})`,
          labelColor: () => "#374151",
        }}
        bezier
        style={{
          borderRadius: 12,
        }}
      />
    </ScrollView>
  );
};

export default ReportChart;
