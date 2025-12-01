/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/no-unused-vars */

import Button from "@/components/Button";
import Header from "@/components/Header";
import ImageUpload from "@/components/imageUpload";
import Input from "@/components/Input";
import ModalWrapper from "@/components/ModalWrapper";
import Typo from "@/components/Typo";
import { expenseCategories } from "@/constants/data";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { scale, verticalScale } from "@/utils/styling";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Icons from "phosphor-react-native";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";

const TransactionModal = () => {
  return (
    <ModalWrapper>
      <View style={styles.container}>
        <Header
          title={selectedProduct?.id ? t("update_product") : t("add_product")}
          leftIcon={
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={[styles.button]}
            >
              <Icons.CaretLeft
                size={verticalScale(26)}
                color={colors.white}
                weight="bold"
              />
            </TouchableOpacity>
          }
          style={{ flexDirection: "row-reverse", marginBottom: spacingY._20 }}
        />
        {/*===================== form================= */}
        <ScrollView
          contentContainerStyle={styles.form}
          showsVerticalScrollIndicator={false}
        >
          {/* Transaction Drop Down */}
          <View style={styles.inputContainer}>
            {/* Product Name */}
            <Typo size={18} color={colors.text} style={styles.productLabel}>
              {t("product_name")}
            </Typo>
            <EngInput
              placeholder="Name"
              value={form.name}
              onChangeText={(v) => setForm({ ...form, name: v })}
              style={styles.input}
            />
          </View>
          {/* Wallets Drop Down */}
          <View style={styles.inputContainer}>
            {/* Product Brand */}
          <Typo size={18} color={colors.text} style={styles.productLabel}>
            {t("brand")}
          </Typo>
          <EngInput
            placeholder="Brand"
            value={form.brand}
            onChangeText={(v) => setForm({ ...form, brand: v })}
            style={styles.input}
          />
          </View>
          {/* expense category Drop Down */}
            <View style={styles.inputContainer}>
              {/* Product Description */}
          <Typo size={18} color={colors.text} style={styles.productLabel}>
            {t("description")}
          </Typo>
          <EngInput
            placeholder="Description"
            value={}
            onChangeText={})}
            style={styles.input}
          />
            </View>
        <View style={styles.inputContainer}>
          {/* Product Price */}
          <Typo size={18} color={colors.text} style={styles.productLabel}>
            {t("price")}
          </Typo>
          <EngInput
            placeholder="Price"
            keyboardType="numeric"
            value={form.price.toString()}
            onChangeText={(v) => setForm({ ...form, price: parseFloat(v) })}
            style={styles.input}
          />
          </View>
        <View style={styles.inputContainer}>
            <Typo size={18} color={colors.text} style={styles.productLabel}>
            {t("quantity")}
          </Typo>
          <EngInput
            placeholder="Quantity"
            keyboardType="numeric"
            value={form.quantity?.toString() || ""}
            onChangeText={(v) => setForm({ ...form, quantity: parseInt(v) })}
            style={styles.input}
          />
        </View>

          {/* date Picker */}
          <View style={styles.inputContainer}>
            <Typo size={18} color={colors.text} style={styles.productLabel}>
            {t("expire_date")}
          </Typo>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={styles.dateInput}
          >
            <Typo style={{ color: colors.black }}>
              {form.expireDate
                ? new Date(form.expireDate).toDateString()
                : "Select Expire Date"}
            </Typo>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              mode="date"
              display="spinner"
              value={form.expireDate ? new Date(form.expireDate) : new Date()}
              onChange={(_, date) => {
                setShowDatePicker(false);
                if (date) setForm({ ...form, expireDate: date.toISOString() });
              }}
            />
          )}
          </View>
          <View style={styles.inputContainer}>
            <Typo color={colors.neutral200} size={16}>
              Amount
            </Typo>
            <Input
              keyboardType="numeric"
              value={transaction.amount?.toString()}
              onChangeText={(value) =>
                setTransaction({
                  ...transaction,
                  amount: Number(value.replace(/[^0-9]/g, "")),
                })
              }
            />
          </View>
          <View style={styles.inputContainer}>
            <View style={styles.flexRow}>
              <Typo color={colors.neutral200} size={16}>
                Description
              </Typo>
              <Typo color={colors.neutral500} size={14}>
                (optional)
              </Typo>
            </View>
            <Input
              value={form.description}
              multiline
              containerStyle={{
                flexDirection: "row",
                height: verticalScale(100),
                alignItems: "flex-start",
                paddingVertical: 15,
              }}
              onChangeText={(value) =>
                (v) => setForm({ ...form, description: v})
              }
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.flexRow}>
              <Typo color={colors.neutral200} size={16}>
                Product Image
              </Typo>
              <Typo color={colors.neutral500} size={14}>
                (optional)
              </Typo>
            </View>
            {/* Image input */}
            <ImageUpload
              file={transaction.image}
              onClear={() => setTransaction({ ...transaction, image: null })}
              onSelect={(file) =>
                setTransaction({ ...transaction, image: file })
              }
              placeholder="Upload Image"
            />
          </View>
        </ScrollView>
      </View>
      <View style={styles.footer}>
        {oldTransaction?.id && !loading && (
          <Button
            style={{
              backgroundColor: colors.rose,
              paddingHorizontal: spacingX._15,
            }}
            onPress={showDeleteAlert}
          >
            <Icons.Trash
              color={colors.white}
              size={verticalScale(24)}
              weight="bold"
            />
          </Button>
        )}
        <Button onPress={onSubmit} loading={loading} style={{ flex: 1 }}>
          <Typo color={colors.black} fontWeight={"700"}>
            {oldTransaction?.id ? "Update" : "Submit"}
          </Typo>
        </Button>
      </View>
    </ModalWrapper>
  );
};

export default TransactionModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingY._20,
  },
  form: {
    gap: spacingY._20,
    paddingVertical: spacingY._15,
    paddingBottom: spacingY._40,
  },
  flexRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._5,
  },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: spacingX._20,
    gap: scale(12),
    paddingTop: spacingY._15,
    borderTopColor: colors.neutral700,
    marginBottom: spacingY._5,
    borderTopWidth: 1,
  },
  dateInput: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start",
    height: verticalScale(54),
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.neutral300,
    borderRadius: radius._17,
    borderCurve: "continuous",
    paddingHorizontal: spacingX._15,
  },
  inputContainer: {
    gap: spacingY._10,
  },
  iosDropDown: {
    flexDirection: "row",
    height: verticalScale(54),
    alignItems: "center",
    justifyContent: "center",
    fontSize: verticalScale(14),
    borderWidth: 1,
    color: colors.white,
    borderColor: colors.neutral300,
    borderRadius: radius._17,
    borderCurve: "continuous",
    paddingHorizontal: spacingX._15,
  },
  androidDropDown: {
    // flexDirection: "row",
    height: verticalScale(54),
    alignItems: "center",
    justifyContent: "center",
    fontSize: verticalScale(14),
    borderWidth: 1,
    color: colors.white,
    borderColor: colors.neutral300,
    borderRadius: radius._17,
    borderCurve: "continuous",
    // paddingHorizontal: spacingX._15,
  },
  iosDataPicker: {
    backgroundColor: "red",
  },
  dataPickerButtton: {
    backgroundColor: colors.neutral700,
    alignSelf: "flex-end",
    padding: spacingY._7,
    marginRight: spacingX._7,
    paddingHorizontal: spacingY._15,
    borderRadius: radius._10,
  },
  dropdwnListContainer: {
    backgroundColor: colors.neutral900,
    borderRadius: radius._15,
    borderCurve: "continuous",
    paddingVertical: spacingY._7,
    top: 5,
    borderColor: colors.neutral500,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 5,
  },
  dropDownContainer: {
    height: verticalScale(54),
    borderWidth: 1,
    borderColor: colors.neutral300,
    paddingHorizontal: spacingX._15,
    borderRadius: radius._15,
    borderCurve: "continuous",
  },
  dropdownItemText: {
    color: colors.white,
  },
  dropdownSelectedText: {
    color: colors.white,
    fontSize: verticalScale(14),
  },
  dropdownPlaceholder: {
    color: colors.white,
  },
  dropdownItemContainer: {
    borderRadius: radius._15,
  },
  dropdownIcon: {
    height: verticalScale(30),
    tintColor: colors.neutral300,
  },
});






  
  button: {
    backgroundColor: colors.neutral600,
    alignSelf: "flex-end",
    borderRadius: radius._12,
    borderCurve: "continuous",
    padding: 5,
  },