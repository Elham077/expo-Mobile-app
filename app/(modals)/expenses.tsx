import Typo from "@/components/Typo";
import { colors } from "@/constants/theme";
import { formatFirestoreTimestamp } from "@/services/changingDate";
import { deleteExpense, getAllExpenses } from "@/services/expense";
import { ExpensesType } from "@/types";
import { Coins } from "phosphor-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  FadeIn,
  FadeInDown,
  Layout,
  LightSpeedInLeft,
  SlideInUp,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const AnimatedFlatList = Animated.createAnimatedComponent(
  FlatList<ExpensesType>
);

const ExpensesScreen = () => {
  const [expenses, setExpenses] = useState<ExpensesType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const data = await getAllExpenses();
        const mappedExpenses = data.map((item: any) => ({
          id: item.id,
          category: item.category,
          expenseCost: item.expenseCost ?? item.amount ?? 0,
          description: item.description,
          image: item.image ?? null,
          ownerName: item.ownerName,
          created: item.created ?? item.date ?? "",
        }));
        setExpenses(mappedExpenses);
      } catch (err) {
        setError("خطا در دریافت اطلاعات هزینه‌ها");
        console.error("Failed to fetch expenses:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  const renderItem = ({
    item,
    index,
  }: {
    item: ExpensesType;
    index: number;
  }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100)}
      layout={Layout.springify()}
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <Animated.View
          entering={LightSpeedInLeft.delay(200)}
          style={styles.iconContainer}
        >
          <Coins size={20} color="#D1FAE5" weight="fill" />
        </Animated.View>
        <Animated.Text entering={FadeIn.delay(300)} style={styles.amount}>
          {item.expenseCost.toLocaleString()} Af
        </Animated.Text>
      </View>

      <Animated.View
        entering={SlideInUp.delay(400)}
        style={styles.metaContainer}
      >
        <Text style={styles.metaText}>
          📅 {formatFirestoreTimestamp(item.created)}
        </Text>
        <Text style={styles.metaText}>👤 {item.ownerName}</Text>
      </Animated.View>

      <Animated.Text entering={FadeIn.delay(500)} style={styles.description}>
        {item.description || "بدون توضیح"}
      </Animated.Text>
      <Animated.View entering={FadeIn.delay(500)}>
        <TouchableOpacity
          style={{
            width: "100%",
            backgroundColor: colors.primary,
            padding: 10,
            alignItems: "center",
            borderRadius: 16,
            marginTop: 10,
          }}
          onPress={() => item.id && deleteExpense(item.id)}
        >
          <Typo color={colors.black} fontWeight={"600"}>
            حذف مصرف
          </Typo>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Animated.View entering={FadeIn.duration(800)}>
          <ActivityIndicator size="large" color="#10B981" />
        </Animated.View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Animated.Text entering={FadeInDown} style={styles.errorText}>
          {error}
        </Animated.Text>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <AnimatedFlatList
          data={expenses}
          keyExtractor={(item) => item.id!}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Animated.View
              entering={FadeInDown.delay(200)}
              style={styles.emptyState}
            >
              <Text style={styles.emptyText}>هنوز هزینه‌ای ثبت نشده است.</Text>
            </Animated.View>
          }
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

// Styles (Same as previous professional styling)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    direction: "rtl",
    backgroundColor: colors.neutral900,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  iconContainer: {
    backgroundColor: "#10B981",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  amount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  metaContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  metaText: {
    fontSize: 12,
    color: "#6B7280",
  },
  description: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 48,
  },
  emptyText: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
  },
});

export default ExpensesScreen;
