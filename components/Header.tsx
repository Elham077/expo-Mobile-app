import { HeaderProps } from "@/types";
import React from "react";
import { StyleSheet, View } from "react-native";
import Typo from "./Typo";

const Header = ({ title = "", leftIcon, style }: HeaderProps) => {
  return (
    <View style={[styles.container, style]}>
      {leftIcon && <View>{leftIcon}</View>}
      {title && (
        <Typo
          size={22}
          fontWeight={"600"}
          style={{ textAlign: "center", width: leftIcon ? "82%" : "100%" }}
        >
          {title}
        </Typo>
      )}
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    direction: "rtl",
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
  },
});
