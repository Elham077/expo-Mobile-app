import React from "react";
import { BarChart } from "react-native-gifted-charts";
import { View, Text } from "react-native";
import { colors } from "@/constants/theme";

interface Props {
  data: any[]; // داده‌ی برگشتی از fetchWeeklyStatsSalesExpenses().data.stats
}

const WeeklyBarChart: React.FC<Props> = ({ data }) => {
  return (
    <View style={{ padding: 16, backgroundColor: "#fff", borderRadius: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
        📈 Weekly Sales vs Expenses
      </Text>
      <BarChart
        barWidth={18}
        noOfSections={4}
        barBorderRadius={4}
        frontColor={colors.primary}
        data={data}
        yAxisThickness={1}
        xAxisThickness={1}
        spacing={16}
        initialSpacing={12}
        yAxisLabelPrefix="AF "
        isAnimated
        hideRules
        maxValue={Math.max(...data.map((item) => item.value)) + 1000}
      />
    </View>
  );
};

export default WeeklyBarChart;
