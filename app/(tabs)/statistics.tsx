import Header from "@/components/Header";
import Loading from "@/components/Loading";
import ScreenWrapper from "@/components/ScreenWrapper";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import {
  fetchMonthlyStatsSalesExpenses,
  fetchWeeklyStatsSalesExpenses,
} from "@/services/statisticsService";
import { scale, verticalScale } from "@/utils/styling";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";
const Statistics = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      setChartLoading(true);
      try {
        if (activeIndex == 0) {
          const result = await fetchWeeklyStatsSalesExpenses();
          if (result && result.success) {
            setChartData(result.data.stats || []);
          } else {
            setChartData([]);
          }
        }
        if (activeIndex == 1) {
          const result = await fetchMonthlyStatsSalesExpenses();
          if (result && result.success) {
            setChartData(result.data.stats || []);
          } else {
            setChartData([]);
          }
        }
      } catch (error) {
        setChartData([]);
        Alert.alert("Error", "Failed to fetch statistics.");
      }
      setChartLoading(false);
    };

    fetchData();
  }, [activeIndex]);

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <Header title="Statistics" />
        </View>
        <ScrollView
          contentContainerStyle={{
            gap: spacingY._20,
            paddingTop: spacingY._5,
            paddingBottom: verticalScale(100),
          }}
          showsVerticalScrollIndicator={false}
        >
          <SegmentedControl
            values={["Weekly", "Monthly"]}
            selectedIndex={activeIndex}
            onChange={(event) => {
              setActiveIndex(event.nativeEvent.selectedSegmentIndex);
            }}
            tintColor={colors.neutral200}
            backgroundColor={colors.neutral800}
            appearance="dark"
            activeFontStyle={styles.segmentFontStyle}
            style={styles.sagmentStyle}
            fontStyle={{ ...styles.segmentFontStyle, color: colors.white }}
          />

          <View style={styles.chartContainer}>
            {chartData.length > 0 ? (
              <BarChart
                data={chartData}
                barWidth={scale(12)}
                spacing={[1.2].includes(activeIndex) ? scale(25) : scale(16)}
                roundedTop
                roundedBottom
                hideRules
                yAxisLabelPrefix="$"
                yAxisThickness={0}
                xAxisThickness={0}
                yAxisLabelWidth={
                  [1.2].includes(activeIndex) ? scale(35) : scale(38)
                }
                yAxisTextStyle={{ color: colors.neutral350 }}
                xAxisLabelTextStyle={{
                  color: colors.neutral350,
                  fontSize: verticalScale(12),
                }}
                noOfSections={3}
                minHeight={5}
                // maxValue={100}
              />
            ) : (
              <View style={styles.noChart}></View>
            )}
            {chartLoading && (
              <View style={styles.chartLoadingContainer}>
                <Loading color={colors.white} />
              </View>
            )}
          </View>
          {/* transactions */}
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default Statistics;

const styles = StyleSheet.create({
  chartContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  chartLoadingContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: radius._12,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  header: {},
  noChart: {
    backgroundColor: "rgba(0,0,0,0.6)",
    height: verticalScale(210),
  },
  searchIcon: {
    backgroundColor: colors.neutral700,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 100,
    height: verticalScale(35),
    width: verticalScale(35),
    borderCurve: "continuous",
  },
  sagmentStyle: {
    height: scale(37),
  },
  segmentFontStyle: {
    fontSize: verticalScale(13),
    fontWeight: "bold",
    color: colors.black,
  },
  container: {
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._5,
    gap: spacingY._10,
  },
});

// import React, { useEffect, useState } from "react";
// import { View, Text, ScrollView, ActivityIndicator } from "react-native";
// import { fetchWeeklyStatsSalesExpenses } from "@/services/statisticsService";
// import { useAuth } from "@/contexts/authContext";
// import WeeklyBarChart from "../(charts)/WeeklyBarChart";
// import MonthlyBarChart from "../(charts)/MonthlyBarChart";

// const TestScreen = () => {
//   const { user } = useAuth(); // فرض بر اینکه user شامل uid است
//   const [loading, setLoading] = useState(true);
//   const [stats, setStats] = useState<any[]>([]);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       if (!user?.uid) return;

//       const result = await fetchWeeklyStatsSalesExpenses();

//       if (result.success) {
//         setStats(result.data.stats);
//       } else {
//         setError(result.msg ?? "An unknown error occurred.");
//       }

//       setLoading(false);
//     };

//     fetchData();
//   }, []);

//   if (loading) return <ActivityIndicator size="large" color="#000" />;
//   if (error) return <Text style={{ color: "red" }}>{error}</Text>;

//   return (
//     <ScrollView contentContainerStyle={{ padding: 20 }}>
//       <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
//         📊 Weekly Stats (Sales & Expenses)
//       </Text>
//        {stats.length > 0 ? (
//       <MonthlyBarChart data={stats} />
//     ) : (
//       <Text>No data to display</Text>
//     )}
//     </ScrollView>
//   );
// };

// export default TestScreen;
