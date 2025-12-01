/* eslint-disable react/display-name */
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { InventoryType } from "@/types";
import { scale, verticalScale } from "@/utils/styling";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as Icons from "phosphor-react-native";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import Typo from "./Typo";

interface InventoryListItemProps {
  item: InventoryType;
  index: number;
  router: ReturnType<typeof useRouter>;
}

const InventoryListItem = React.memo(
  ({ item, index, router }: InventoryListItemProps) => {
    const openInventory = React.useCallback(() => {
      const params = {
        id: item?.id,
        name: item?.name,
        image: item?.image,
        price: item?.purchasedPrice?.toString(),
        expireDate:
          typeof item?.expireDate === "string"
            ? item.expireDate.split("/")[2]
            : item?.expireDate instanceof Date
            ? item.expireDate.getFullYear().toString()
            : "",
        quantity: item?.quantity?.toString(),
        brand: item?.brand,
        description: item?.description,
      };

      router.push({
        pathname: "/(modals)/AddOrEditProductForm",
        params,
      });
    }, [item, router]);

    const formatDate = (date?: Date | number | string) => {
      if (!date) return "No expiry";

      try {
        const dateObj = date instanceof Date ? date : new Date(date);
        if (isNaN(dateObj.getTime())) return "Invalid date";

        return dateObj.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      } catch {
        return "Invalid date";
      }
    };

    const isExpired =
      item?.expireDate &&
      (() => {
        // Handle Firestore Timestamp if present
        if (item.expireDate && typeof item.expireDate === "object" && typeof (item.expireDate as any).toDate === "function") {
          return (item.expireDate as any).toDate() < new Date();
        }
        // Handle Firestore Timestamp if present
        if (item.expireDate && typeof item.expireDate === "object" && typeof (item.expireDate as any).toDate === "function") {
          return (item.expireDate as any).toDate() < new Date();
        }
        return new Date(item.expireDate as string | number | Date) < new Date();
      })();

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 200)
          .springify()
          .damping(13)}
        style={styles.animatedContainer}
      >
        <TouchableOpacity
          style={[styles.container, isExpired && styles.expiredContainer]}
          onPress={openInventory}
          activeOpacity={0.7}
        >
          {/* Product Image */}
          <View style={styles.imageContainer}>
            <Image
              style={styles.image}
              source={item?.image}
              contentFit="cover"
              transition={100}
              placeholder={require("../assets/images/card.png")}
              placeholderContentFit="contain"
            />
            {isExpired && (
              <View style={styles.expiredBadge}>
                <Typo size={10} color={colors.white} fontWeight="700">
                  EXPIRED
                </Typo>
              </View>
            )}
          </View>

          {/* Product Info */}
          <View style={styles.infoContainer}>
            <View>
              <Typo
                size={16}
                style={
                  isExpired ? [styles.name, styles.expiredText] : styles.name
                }
              >
                {item?.name || "Unnamed Product"}
              </Typo>
              <Typo size={12} color={colors.neutral400} style={styles.brand}>
                {item?.brand || "No brand"}
              </Typo>
            </View>

            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Icons.Money
                  size={scale(14)}
                  color={isExpired ? colors.rose : colors.primary}
                  weight="bold"
                />
                <Typo
                  size={14}
                  style={[styles.detailText, isExpired && styles.expiredText]}
                >
                  {item?.purchasedPrice?.toFixed(2) || "0.00"}
                </Typo>
              </View>

              <View style={styles.detailItem}>
                <Icons.Stack
                  size={scale(14)}
                  color={isExpired ? colors.rose : colors.primary}
                  weight="bold"
                />
                <Typo
                  size={14}
                  style={[styles.detailText, isExpired && styles.expiredText]}
                >
                  {item?.quantity || 0}
                </Typo>
              </View>

              <View style={styles.detailItem}>
                <Icons.PixLogo
                  size={scale(14)}
                  color={isExpired ? colors.rose : colors.primary}
                  weight="bold"
                />
                <Typo
                  size={14}
                  style={[styles.detailText, isExpired && styles.expiredText]}
                >
                  {item?.brand || "No brand"}
                </Typo>
              </View>
              {/* <View style={styles.detailItem}>
              <Icons.CalendarBlank size={scale(14)} color={isExpired ? colors.rose : colors.primary} weight="bold" />
              <Typo size={14} style={[styles.detailText, isExpired && styles.expiredText]}>
                {formatDate(item?.expireDate)}
              </Typo>
            </View> */}
            </View>
          </View>

          {/* Chevron */}
          <Icons.CaretLeft
            size={verticalScale(20)}
            weight="bold"
            color={isExpired ? colors.rose : colors.neutral400}
            style={styles.chevron}
          />
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  animatedContainer: {
    marginBottom: verticalScale(12),
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: radius._12,
    padding: spacingY._5,
    shadowColor: colors.neutral700,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  expiredContainer: {
    borderLeftWidth: 4,
    borderLeftColor: colors.rose,
  },
  imageContainer: {
    height: verticalScale(70),
    width: verticalScale(70),
    borderRadius: radius._10,
    overflow: "hidden",
    position: "relative",
    marginRight: spacingX._12,
    marginLeft: 15,
    backgroundColor: colors.neutral100,
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
    paddingVertical: verticalScale(2),
    alignItems: "center",
  },
  infoContainer: {
    flex: 1,
    gap: spacingY._7,
    overflow: "hidden",
  },
  name: {
    fontWeight: "600",
    color: colors.neutral800,
  },
  brand: {
    fontWeight: "500",
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacingX._5,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._3,
    flexShrink: 1,
  },
  detailText: {
    color: colors.neutral600,
    flexShrink: 1,
  },
  expiredText: {
    color: colors.rose,
  },
  chevron: {
    marginLeft: spacingX._7,
  },
});

export default InventoryListItem;
