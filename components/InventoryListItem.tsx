import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { useAuth } from "@/contexts/authContext";
import { deleteProduct } from "@/services/inventoryServices";
import { InventoryType } from "@/types";
import { moderateScale, verticalScale } from "@/utils/styling";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as Icons from "phosphor-react-native";
import React from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import Typo from "./Typo";

const InventoryListItem = ({
  item,
  index,
  onDelete,
  onSelect,
}: {
  item: InventoryType;
  index: number;
  onDelete?: () => void;
  onSelect?: (id: string) => void;
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const openInventory = () => {
    if (!item?.id) return;
    router.push({
      pathname: "/(modals)/AddOrEditProductForm",
      params: {
        id: item.id,
        name: item.name,
        image: item.image,
      },
    });
  };

  const handleDelete = () => {
    Alert.alert("حذف محصول", `آیا مطمئن هستید که "${item.name}" را حذف کنید؟`, [
      { text: "انصراف", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          if (item.id) {
            await deleteProduct(String(item.id));
            onDelete?.();
          }
        },
      },
    ]);
  };

  const isOutOfStock = (item.quantity ?? 0) <= 0;
  const getExpireDate = () => {
    if (!item.expireDate) return undefined;
    if (item.expireDate instanceof Date) return item.expireDate;
    if (typeof (item.expireDate as any).toDate === "function")
      return (item.expireDate as any).toDate();
    if (
      typeof item.expireDate === "string" ||
      typeof item.expireDate === "number"
    ) {
      return new Date(item.expireDate);
    }
    return undefined;
  };
  const isExpired = !!item.expireDate && getExpireDate() < new Date();
  const isExpiringSoon =
    item.expireDate &&
    getExpireDate()?.getTime() - Date.now() <= 30 * 24 * 60 * 60 * 1000;
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100)
        .springify()
        .damping(13)}
      style={styles.shadowContainer}
    >
      <View
        style={[
          styles.container,
          isOutOfStock && styles.outOfStockContainer,
          isExpired && styles.expiredContainer,
        ]}
      >
        {/* تصویر محصول */}
        <View style={styles.imageContainer}>
          <Image
            style={styles.image}
            source={
              item?.image?.uri
                ? { uri: item.image.uri }
                : item?.image
                ? { uri: item.image }
                : require("@/assets/images/placeholder.png")
            }
            contentFit="cover"
            placeholder={require("@/assets/images/placeholder.png")}
            transition={300}
            onError={(e) => console.log("Image load error:")}
          />
          {isExpired && (
            <Animated.View
              style={styles.expiredBadge}
              entering={FadeIn.duration(300)}
            >
              <Typo size={10} color={colors.white} fontWeight="bold">
                منقضی
              </Typo>
            </Animated.View>
          )}
          {isExpiringSoon && (
            <Animated.View
              style={styles.expiredBadge}
              entering={FadeIn.duration(300)}
            >
              <Typo size={10} color={colors.white} fontWeight="bold">
                به زودی منقضی می شود
              </Typo>
            </Animated.View>
          )}
        </View>

        {/* اطلاعات */}
        <View style={styles.details}>
          <View style={styles.header}>
            <Typo size={16} fontWeight="bold">
              {item.name}
            </Typo>
            {item.brand && (
              <Typo size={12} color={colors.neutral400}>
                {item.brand}
              </Typo>
            )}
          </View>

          <View style={styles.priceContainer}>
            <Typo size={14} color={colors.neutral300}>
              قیمت خرید:{" "}
              <Typo size={14} color={colors.white}>
                {item.purchasedPrice.toLocaleString()} افغانی
              </Typo>
            </Typo>
            <Typo size={14} color={colors.neutral300}>
              قیمت فروش:{" "}
              <Typo size={14} color={colors.white}>
                {item.sellingPrice?.toLocaleString() || "--"} افغانی
              </Typo>
            </Typo>
          </View>

          <View style={styles.footer}>
            {item.expireDate && (
              <View style={styles.dateBadge}>
                <Icons.Calendar
                  size={14}
                  color={colors.neutral400}
                  weight="bold"
                />
                <Typo size={12} color={colors.neutral400}>
                  {getExpireDate()?.toLocaleDateString("fa-IR")}
                </Typo>
              </View>
            )}
            <View
              style={[
                styles.stockBadge,
                isOutOfStock ? styles.outOfStockBadge : styles.inStockBadge,
              ]}
            >
              <Icons.Stack
                size={14}
                color={isOutOfStock ? colors.rose : colors.green}
                weight="bold"
              />
              <Typo size={12} color={isOutOfStock ? colors.rose : colors.green}>
                {isOutOfStock ? "ناموجود" : `${item.quantity} عدد`}
              </Typo>
            </View>
          </View>
        </View>

        {/* دکمه‌ها */}
        {(user?.role === "admin" || user?.role === "manager") && (
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={handleDelete}
              style={styles.deleteButton}
            >
              <Icons.Trash
                size={moderateScale(18)}
                color={colors.rose}
                weight="fill"
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={openInventory} style={styles.editButton}>
              <Icons.Pencil
                size={moderateScale(18)}
                color={colors.primary}
                weight="fill"
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  shadowContainer: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
    marginBottom: spacingY._12,
    // برای iOS
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral800,
    borderRadius: radius._15,
    padding: spacingX._12,
    minHeight: verticalScale(100),
    maxHeight: verticalScale(150),
    borderWidth: 1,
    borderColor: colors.neutral700,
  },
  outOfStockContainer: {
    opacity: 0.8,
    borderColor: colors.neutral600,
  },
  expiredContainer: {
    borderColor: colors.rose,
  },
  imageContainer: {
    height: verticalScale(130),
    width: verticalScale(120),
    borderRadius: radius._12,
    borderWidth: 1,
    borderColor: colors.neutral600,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  expiredBadge: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.rose,
    paddingVertical: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  details: {
    flex: 1,
    marginLeft: spacingX._12,
    gap: spacingY._7,
  },
  header: {
    gap: 2,
  },
  priceContainer: {
    gap: 4,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._10,
    marginTop: spacingY._5,
  },
  dateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.neutral700,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius._10,
  },
  stockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius._10,
  },
  inStockBadge: {
    backgroundColor: colors.green + "20",
  },
  outOfStockBadge: {
    backgroundColor: colors.rose + "20",
  },
  actions: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: "100%",
    paddingVertical: spacingY._5,
    marginLeft: spacingX._10,
  },
  deleteButton: {
    backgroundColor: colors.neutral700,
    padding: 6,
    borderRadius: radius._10,
  },
  editButton: {
    backgroundColor: colors.neutral700,
    padding: 6,
    borderRadius: radius._10,
  },
  selectButton: {
    backgroundColor: colors.neutral700,
    padding: 6,
    borderRadius: radius._10,
  },
});

export default InventoryListItem;
