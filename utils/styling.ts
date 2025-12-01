import { Dimensions, PixelRatio } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const [shortDimension, longDimension] =
  SCREEN_WIDTH < SCREEN_HEIGHT
    ? [SCREEN_WIDTH, SCREEN_HEIGHT]
    : [SCREEN_HEIGHT, SCREEN_WIDTH];

const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

// مقیاس‌دهی بر اساس عرض صفحه
export const scale = (size: number) =>
  Math.round(
    PixelRatio.roundToNearestPixel(
      (shortDimension / guidelineBaseWidth) * size
    )
  );

// مقیاس‌دهی بر اساس ارتفاع صفحه
export const verticalScale = (size: number) =>
  Math.round(
    PixelRatio.roundToNearestPixel(
      (longDimension / guidelineBaseHeight) * size
    )
  );

// مقیاس‌دهی متعادل با کنترل فاکتور
export const moderateScale = (size: number, factor: number = 0.5) => {
  const scaledSize = scale(size);
  return Math.round(
    PixelRatio.roundToNearestPixel(size + (scaledSize - size) * factor)
  );
};

// مقیاس‌دهی عمودی متعادل با کنترل فاکتور
export const moderateVerticalScale = (size: number, factor: number = 0.5) => {
  const scaledSize = verticalScale(size);
  return Math.round(
    PixelRatio.roundToNearestPixel(size + (scaledSize - size) * factor)
  );
};

// مقیاس فونت برای متن‌ها (اختیاری)
export const fontSizeScale = (size: number, factor: number = 0.3) => {
  return moderateScale(size, factor);
};