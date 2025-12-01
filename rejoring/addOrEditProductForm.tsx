/* eslint-disable react-hooks/exhaustive-deps */
import BackButton from "@/components/BackButton";
import Button from "@/components/Button";
import EngInput from "@/components/engInput";
import Header from "@/components/Header";
import ImageUpload from "@/components/imageUpload";
import Input from "@/components/Input";
import Loading from "@/components/Loading";
import ModalWrapper from "@/components/ModalWrapper";
import Typo from "@/components/Typo";
import { db } from "@/config/firebase.client";
import { equipmentCategories } from "@/constants/productCategoryData";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { useAuth } from "@/contexts/authContext";
import { uploadFileToCloudinary } from "@/services/imageServices";
import { InventoryType } from "@/types";
import { verticalScale } from "@/utils/styling";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { useDebouncedCallback } from "use-debounce";

const ProductAddModel = () => {
  const { t } = useTranslation();
  const {user} = useAuth()
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState<{ label: string; value: string }[]>([]);
  const [profitMargin, setProfitMargin] = useState(20);
  const params = useLocalSearchParams();
  const isEditMode = !!params.id;
  const initialFormState: InventoryType = {
    name: "",
    category: "",
    brand: "",
    purchasedPrice: 0,
    sellingPrice: 0,
    quantity: 0,
    expireDate: "",
    description: "",
    image: "",
    created: "",
    updated: "",
    ownerName: user?.name ?? undefined,
  };

  const [form, setForm] = useState<InventoryType>(initialFormState);
  const [selectedProduct, setSelectedProduct] = useState<InventoryType | null>(
    null
  );
  const [products, setProducts] = useState<InventoryType[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  useEffect(() => {
    if (selectedProduct) {
      setForm(selectedProduct);
    } else {
      resetForm();
    }
  }, [selectedProduct]);

  // تابع کمکی برای تبدیل تاریخ
  const normalizeDate = (date: any): Date | null => {
    if (!date) return null;
    if (date instanceof Date) return date;
    if (typeof date === "string") return new Date(date);
    if ("toDate" in date && typeof date.toDate === "function")
      return date.toDate();
    return null;
  };

  // نمایش تاریخ به صورت خوانا
  const displayDate = form.expireDate
    ? normalizeDate(form.expireDate)?.toLocaleDateString()
    : t("select_expire_date");

  // ذخیره خودکار پیشنویس
  const debouncedSaveDraft = useDebouncedCallback(async (draft: any) => {
    try {
      await AsyncStorage.setItem("product_draft", JSON.stringify(draft));
    } catch (error) {
      console.error("Error saving draft:", error);
    }
  }, 1000);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        // دریافت تمام برندها با مرتب‌سازی بر اساس نام
        const q = query(collection(db, "brands"), orderBy("name"));
        const querySnapshot = await getDocs(q);

        // تبدیل داده‌ها به فرمت مورد نیاز برای Dropdown
        const brandsData = querySnapshot.docs.map((doc) => ({
          id: doc.id, // اضافه کردن ID برای استفاده احتمالی
          label: doc.data().name,
          value: doc.data().name,
          // اضافه کردن اطلاعات اضافی در صورت نیاز
          category: doc.data().category || "",
          country: doc.data().country || "",
        }));

        setBrands(brandsData);
      } catch (error) {
        console.error("Error fetching brands:", error);
        Alert.alert("خطا", "مشکلی در دریافت لیست برندها پیش آمد");
      }
    };

    const loadDraft = async () => {
      try {
        const draft = await AsyncStorage.getItem("product_draft");
        if (draft) {
          setForm(JSON.parse(draft));
        }
      } catch (error) {
        console.error("Error loading draft:", error);
      }
    };

    fetchBrands();
    loadDraft();

    const unsub = onSnapshot(collection(db, "inventory"), (snapshot) => {
      const updated = snapshot.docs.map((docSnap) => ({
        ...(docSnap.data() as InventoryType),
        id: docSnap.id,
      }));
      setProducts(updated);
    });
    return () => unsub();
  }, []);
  useEffect(() => {
    if (!isEditMode) {
      debouncedSaveDraft(form);
    }
  }, [form]);
  useEffect(() => {
    const initializeForm = async () => {
      if (isEditMode) {
        // حالت ویرایش - دریافت محصول از Firestore
        const product = products.find((p) => p.id === params.id);
        if (product) {
          setForm(product);
          setSelectedProduct(product);
        }
      } else {
        // حالت اضافه کردن - ریست فرم
        resetForm();
        // پاک کردن پیش‌نویس فقط وقتی در حالت اضافه کردن هستیم
        await AsyncStorage.removeItem("product_draft");
      }
    };

    initializeForm();
  }, [params.id, products]);
  // محاسبه خودکار قیمت فروش
  useEffect(() => {
    if (form.purchasedPrice > 0) {
      setForm((prev) => ({
        ...prev,
        sellingPrice: parseFloat(
          (prev.purchasedPrice * (1 + profitMargin / 100)).toFixed(2)
        ),
      }));
    }
  }, [form.purchasedPrice, profitMargin]);

  // ذخیره پیشنویس هنگام تغییر فرم
  useEffect(() => {
    debouncedSaveDraft(form);
  }, [form]);

  const handleDelete = (id: string) => {
    Alert.alert(t("confirm_delete"), t("confirm_delete_msg"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("delete"),
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "inventory", id));
            router.back()
            Alert.alert(t("deleted"), t("deleted_success"));
          } catch {
            Alert.alert(t("error"), t("delete_failed"));
          }
        },
      },
    ]);
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!form.name) errors.push(t("product_name_required"));
    if (form.purchasedPrice <= 0) errors.push(t("invalid_purchase_price"));
    if (form.sellingPrice < form.purchasedPrice)
      errors.push(t("selling_price_higher"));
    if ((form.quantity ?? 0) < 0) errors.push(t("invalid_quantity"));
    const expireDate = normalizeDate(form.expireDate);
    if (expireDate && expireDate < new Date())
      errors.push(t("past_date_warning"));

    return errors;
  };

  const handleSave = async () => {
    const errors = validateForm();

    if (errors.length > 0) {
      return Alert.alert(t("validation_error"), errors.join("\n"));
    }

    if (!form.name || !form.sellingPrice) {
      return Alert.alert(t("validation_error"), t("fill_required_fields"));
    }

    setLoading(true);
    let imageUrl = form.image;

    try {
      // آپلود عکس به کلادینری (در صورت نیاز)
      const isLocalImage =
        typeof imageUrl === "string" &&
        imageUrl.trim() !== "" &&
        !imageUrl.startsWith("http");
      if (isLocalImage) {
        const uploadRes = await uploadFileToCloudinary(imageUrl, "products");
        if (!uploadRes.success) {
          throw new Error(uploadRes.msg || "Upload failed");
        }
        imageUrl = uploadRes.data;
      }

      const now = new Date().toISOString();

      const productToSave: InventoryType = {
        ...form,
        image: imageUrl,
        created: selectedProduct?.created ?? form.created ?? now,
        updated: now,
      };

      if (selectedProduct?.id) {
      // حالت ویرایش - آپدیت سند موجود
      await updateDoc(doc(db, "inventory", selectedProduct.id), productToSave);
      Alert.alert(t("updated"), t("update_success"));
    } else {
      // حالت اضافه کردن - ایجاد سند جدید با ID خودکار
      const docRef = await addDoc(collection(db, "inventory"), productToSave);
      console.log("Product added with ID: ", docRef.id);
      Alert.alert(t("added"), t("add_success"));
      await AsyncStorage.removeItem("product_draft");
    }

      resetForm();
      router.back();
    } catch (err) {
      console.error("خطا در ذخیره محصول:", err);
      Alert.alert(t("error"), t("save_failed"));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(initialFormState);
    setSelectedProduct(null);
  };

  return (
    <ModalWrapper scrollEnabled keyboardAvoiding>
      <View style={styles.container}>
        <Header
          title={t(selectedProduct ? "edit_product" : "add_product")}
          leftIcon={<BackButton />}
          style={{ flexDirection: "row-reverse", marginBottom: spacingY._20 }}
        />
        <ScrollView
          style={styles.form}
          contentContainerStyle={styles.formContent}
        >
          {/* نام محصول */}
          <Typo size={18} color={colors.text} style={styles.productLabel}>
            {t("product_name")}{" "}
            <Typo size={18} color={colors.rose}>
              *
            </Typo>
          </Typo>
          <Input
            secureTextEntry={false}
            label={""}
            value={form.name}
            onChangeText={(v) => setForm({ ...form, name: v })}
            placeholder={t("enter_product_name")}
            error={null}
          />

          {/* دسته‌بندی */}
          <View style={styles.inputContainer}>
            <Typo color={colors.neutral200} size={16}>
              {t("category")}{" "}
              <Typo size={16} color={colors.rose}>
                *
              </Typo>
            </Typo>
            <Dropdown
              style={styles.dropDownContainer}
              activeColor={colors.neutral700}
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownSelectedText}
              iconStyle={styles.dropdownIcon}
              data={Object.values(equipmentCategories)}
              maxHeight={300}
              labelField="label"
              valueField="value"
              itemTextStyle={styles.dropdownItemText}
              itemContainerStyle={styles.dropdownItemContainer}
              containerStyle={styles.dropdwnListContainer}
              placeholder={t("select_category")}
              value={form.category}
              onChange={(item) => {
                setForm({ ...form, category: item.value || "" });
              }}
            />
          </View>

          {/* برند */}
          <Typo size={18} color={colors.text} style={styles.productLabel}>
            {t("brand")}
          </Typo>
          {brands.length === 0 ? (
            <Loading size="small" color={colors.primary} />
          ) : (
            <Dropdown
              style={styles.dropDownContainer}
              activeColor={colors.neutral700}
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownSelectedText}
              iconStyle={styles.dropdownIcon}
              data={brands}
              maxHeight={300}
              labelField="label"
              valueField="value"
              itemTextStyle={styles.dropdownItemText}
              itemContainerStyle={styles.dropdownItemContainer}
              containerStyle={styles.dropdwnListContainer}
              placeholder={t("select_brand")}
              value={form.brand}
              onChange={(item) => {
                setForm({ ...form, brand: item.value || "" });
              }}
              search
              searchPlaceholder={t("search_brands")}
            />
          )}

          {/* توضیحات */}
          <View style={styles.inputContainer}>
            <View style={styles.flexRow}>
              <Typo color={colors.neutral200} size={16}>
                {t("description")}
              </Typo>
              <Typo color={colors.neutral500} size={14}>
                ({t("optional")})
              </Typo>
            </View>
            <EngInput
              value={form.description}
              multiline
              onChangeText={(value) => setForm({ ...form, description: value })}
              placeholder={t("enter_description")}
              containerStyle={styles.multilineInputContainer}
              inputStyle={{
                textAlignVertical: "top",
                height: verticalScale(200),
              }}
              label={""}
              error={null}
            />
          </View>

          {/* قیمت خرید */}
          <Typo size={18} color={colors.text} style={styles.productLabel}>
            {t("purchase_price")}{" "}
            <Typo size={18} color={colors.rose}>
              *
            </Typo>
          </Typo>
          <Input
            keyboardType="numeric"
            value={form.purchasedPrice.toString()}
            onChangeText={(v) => {
              const parsed = parseFloat(v);
              if (!isNaN(parsed)) setForm({ ...form, purchasedPrice: parsed });
            }}
            placeholder={t("enter_purchase_price")}
            label={""}
            error={null}
          />

          {/* درصد سود */}
          <Typo size={18} color={colors.text} style={styles.productLabel}>
            {t("profit_margin")} ({profitMargin}%)
          </Typo>
          <View style={styles.sliderContainer}>
            <View style={styles.sliderTrack}>
              <View
                style={[
                  styles.sliderProgress,
                  { width: `${Math.min(100, Math.max(0, profitMargin))}%` },
                ]}
              />
            </View>
            <View style={styles.sliderButtons}>
              <TouchableOpacity
                style={styles.sliderButton}
                onPress={() => setProfitMargin((prev) => Math.max(0, prev - 5))}
              >
                <Typo>-</Typo>
              </TouchableOpacity>
              <Typo>{profitMargin}%</Typo>
              <TouchableOpacity
                style={styles.sliderButton}
                onPress={() =>
                  setProfitMargin((prev) => Math.min(100, prev + 5))
                }
              >
                <Typo>+</Typo>
              </TouchableOpacity>
            </View>
          </View>

          {/* قیمت فروش */}
          <Typo size={18} color={colors.text} style={styles.productLabel}>
            {t("selling_price")}
            <Typo size={18} color={colors.rose}>
              *
            </Typo>
          </Typo>
          <Input
            keyboardType="numeric"
            value={form.sellingPrice.toString()}
            onChangeText={(v) => {
              const parsed = parseFloat(v);
              if (!isNaN(parsed)) {
                setForm({ ...form, sellingPrice: parsed });
                if (form.purchasedPrice > 0) {
                  setProfitMargin(
                    Math.round(
                      ((parsed - form.purchasedPrice) / form.purchasedPrice) *
                        100
                    )
                  );
                }
              }
            }}
            placeholder={t("enter_selling_price")}
            label={""}
            error={null}
          />

          {/* تعداد */}
          <Typo size={18} color={colors.text} style={styles.productLabel}>
            {t("quantity")}
          </Typo>
          <Input
            keyboardType="numeric"
            value={form.quantity?.toString() || ""}
            onChangeText={(v) => {
              const parsed = parseInt(v, 10);
              if (!isNaN(parsed)) {
                setForm({ ...form, quantity: parsed });
              }
            }}
            placeholder={t("enter_quantity")}
            label={""}
            error={null}
          />
          {/* تاریخ انقضا */}
          <Typo size={18} color={colors.text} style={styles.productLabel}>
            {t("expire_date")}
            <Typo size={18} color={colors.rose}>
              *
            </Typo>
          </Typo>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={styles.dateDisplay}
          >
            <Typo>{displayDate}</Typo>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              mode="date"
              display="spinner"
              value={normalizeDate(form.expireDate) || new Date()}
              onChange={(_, date) => {
                setShowDatePicker(false);
                if (date) setForm({ ...form, expireDate: date.toISOString() });
              }}
            />
          )}

          {/* تصویر محصول */}
          <Typo size={18} color={colors.text} style={styles.productLabel}>
            {t("product_image")}
          </Typo>
          <ImageUpload
            file={form.image}
            onClear={() => setForm({ ...form, image: "" })}
            onSelect={(file) => setForm({ ...form, image: file })}
          />

          {/* دکمه حذف (در حالت ویرایش) */}
          {selectedProduct?.id && (
            <TouchableOpacity
              onPress={() => handleDelete(selectedProduct.id!)}
              style={styles.deleteButton}
            >
              <Typo style={styles.deleteText}>{t("delete")}</Typo>
            </TouchableOpacity>
          )}

          {/* دکمه ذخیره */}
          <Button
            loading={loading}
            style={styles.saveButton}
            onPress={handleSave}
            disabled={loading}
          >
            <Typo style={styles.saveText}>
              {selectedProduct ? t("save_changes") : t("add_product")}
            </Typo>
          </Button>

          {/* دکمه ریست فرم */}
          {form.name && (
            <Button
              style={styles.resetButton}
              onPress={resetForm}
              disabled={loading}
            >
              <Typo style={styles.resetText}>{t("reset_form")}</Typo>
            </Button>
          )}
        </ScrollView>
      </View>
    </ModalWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    direction: "rtl",
    flex: 1,
    paddingHorizontal: spacingY._15,
    paddingVertical: spacingY._7,
    backgroundColor: colors.neutral900,
  },
  form: {
    flex: 1,
  },
  formContent: {
    paddingBottom: spacingY._30,
  },
  flexRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._5,
  },
  productLabel: {
    direction: "rtl",
    marginTop: spacingY._12,
    marginBottom: spacingY._5,
  },
  inputContainer: {
    gap: spacingY._10,
    marginTop: spacingY._12,
  },
  multilineInputContainer: {
    flexDirection: "row",
    height: verticalScale(100),
    alignItems: "flex-start",
    paddingVertical: 15,
  },
  dateDisplay: {
    padding: 12,
    borderWidth: 1,
    borderColor: colors.neutral300,
    borderRadius: radius._17,
    marginTop: spacingY._5,
  },
  deleteButton: {
    backgroundColor: colors.rose,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: spacingY._20,
    marginBottom: spacingY._12,
  },
  deleteText: {
    color: colors.white,
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: spacingY._20,
  },
  saveText: {
    color: colors.white,
    fontWeight: "bold",
  },
  resetButton: {
    backgroundColor: colors.primaryDark,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: spacingY._12,
  },
  resetText: {
    color: colors.text,
    fontWeight: "bold",
  },
  dropdwnListContainer: {
    backgroundColor: colors.neutral800, // تضاد مناسب با متن سفید
    borderRadius: radius._15,
    width: "100%",
    textAlign: "center",
    paddingVertical: spacingY._7,
    marginTop: spacingY._5,
    borderColor: colors.neutral500,
    borderWidth: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  dropDownContainer: {
    height: verticalScale(54),
    borderWidth: 1,
    borderColor: colors.neutral300,
    paddingHorizontal: spacingX._15,
    borderRadius: radius._15,
    justifyContent: "center",
    marginTop: spacingY._5,
  },
  dropdownItemText: {
    color: colors.white,
    textAlign: "center",
  },
  dropdownSelectedText: {
    color: colors.white,
    fontSize: verticalScale(14),
    textAlign: "center",
  },
  dropdownPlaceholder: {
    color: colors.neutral400,
  },
  dropdownItemContainer: {
    borderRadius: radius._15,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacingY._5,
  },

  dropdownIcon: {
    height: verticalScale(30),
    tintColor: colors.neutral300,
  },
  sliderContainer: {
    marginTop: spacingY._12,
  },
  sliderTrack: {
    height: 8,
    backgroundColor: colors.neutral300,
    borderRadius: 4,
    overflow: "hidden",
  },
  sliderProgress: {
    height: "100%",
    backgroundColor: colors.primary,
  },
  sliderButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacingY._7,
  },
  sliderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryDark,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ProductAddModel;
