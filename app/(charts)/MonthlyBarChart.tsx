import React from "react";
import { BarChart } from "react-native-gifted-charts";
import { View, Text } from "react-native";
import { colors } from "@/constants/theme";

interface Props {
  data: { label: string; sales: number; expenses: number }[];
}

const MonthlyBarChart: React.FC<Props> = ({ data }) => {
  // تبدیل داده‌ها به قالب مناسب
  const chartData = data.flatMap((item, index) => [
    {
      label: item.label, // مثلاً "Jan"
      value: item.sales,
      frontColor: colors.primary,
    },
    {
      label: "", // فاصله بین هر دو بار
      value: item.expenses,
      frontColor: colors.rose,
    },
  ]);

  return (
    <View style={{ padding: 16, backgroundColor: "#fff", borderRadius: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
        📊 Monthly Sales vs Expenses
      </Text>
      <BarChart
        data={chartData}
        barWidth={16}
        spacing={10}
        noOfSections={4}
        barBorderRadius={4}
        yAxisLabelPrefix="AF "
        isAnimated
        hideRules
        xAxisThickness={1}
        yAxisThickness={1}
        maxValue={Math.max(...chartData.map((item) => item.value)) + 5000}
      />
    </View>
  );
};

export default MonthlyBarChart;
