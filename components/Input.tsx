import { colors, radius, spacingX } from "@/constants/theme";
import { InputProps } from "@/types";
import { I18nManager, StyleSheet, Text, TextInput, View } from "react-native";
import React, { useState } from "react";
import { verticalScale } from "@/utils/styling";

const Input = ({
  containerStyle,
  inputStyle,
  icon,
  label,
  error,
  inputRef,
  ...rest
}: InputProps) => {
  const [focused, setFocused] = useState(false);
  const isRTL = I18nManager.isRTL;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.container,
          { borderColor: focused ? colors.primary : colors.neutral300 },
          error && { borderColor: colors.rose },
        ]}
      >
        {icon && icon}
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            { textAlign: isRTL ? "right" : "left" },
            inputStyle,
          ]}
          placeholderTextColor={colors.neutral400}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export default Input;

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },
  label: {
    fontSize: verticalScale(13),
    color: colors.white,
    marginBottom: verticalScale(4),
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: radius._17,
    borderCurve: "continuous",
    paddingHorizontal: spacingX._15,
    gap: spacingX._10,
    height: verticalScale(54),
  },
  input: {
    flex: 1,
    color: colors.white,
    fontSize: verticalScale(14),
  },
  errorText: {
    color: colors.rose,
    fontSize: verticalScale(12),
    marginTop: verticalScale(4),
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
});
