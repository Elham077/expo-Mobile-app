import { firestore } from "@/config/firebase.client";
import { SellType } from "@/types";
import { collection, doc, setDoc, updateDoc, Timestamp, getDoc,  getDocs, query, orderBy, where, deleteDoc } from "firebase/firestore";
export const updateSale = async (
  saleId: string,
  updatedData: SellType
): Promise<{ success: boolean; msg?: string }> => {
  try {
    const saleRef = doc(firestore, "sales", saleId);
    const oldSaleSnap = await getDoc(saleRef);
    if (!oldSaleSnap.exists()) return { success: false, msg: "فروش قبلی یافت نشد" };
    const oldSale = oldSaleSnap.data() as SellType;

    // مرحله ۱: برگرداندن موجودی قبلی
    const productRef = doc(firestore, "inventory", oldSale.inventoryProduct);
    const productSnap = await getDoc(productRef);
    if (!productSnap.exists()) return { success: false, msg: "محصول یافت نشد" };

    const productData = productSnap.data();
    let newQuantity = (productData.quantity || 0) + oldSale.quantity;

    // بررسی موجودی جدید
    if (updatedData.quantity > newQuantity) {
      return { success: false, msg: "مقدار جدید بیشتر از موجودی است" };
    }

    // مرحله ۲: آپدیت فروش
    await updateDoc(saleRef, {
      ...updatedData,
      date: Timestamp.fromDate(new Date()),
    });

    // مرحله ۳: کم‌کردن مجدد موجودی
    await updateDoc(productRef, {
      quantity: newQuantity - updatedData.quantity,
    });

    return { success: true };
  } catch (err: any) {
    console.log("❌ خطا در بروزرسانی فروش:", err.message);
    return { success: false, msg: err.message };
  }
};
export const getLoanSales = async (): Promise<SellType[]> => {
  const q = query(
    collection(firestore, "sales"),
    where("loan", "==", true)
  );
  const snapshot = await getDocs(q);
  const sales: SellType[] = [];

  snapshot.forEach((docSnap) => {
    sales.push({
      id: docSnap.id,
      ...docSnap.data(),
    } as SellType);
  });

  return sales;
};
export const deleteSaleAndUpdateInventory = async (saleId: string) => {
  try {
    const saleRef = doc(firestore, "sales", saleId);
    const saleSnap = await getDoc(saleRef);
    if (!saleSnap.exists()) throw new Error("فروش یافت نشد");

    const saleData = saleSnap.data();
    const { inventoryProduct, quantity } = saleData;

    const productRef = doc(firestore, "inventory", inventoryProduct);
    const productSnap = await getDoc(productRef);
    if (!productSnap.exists()) throw new Error("محصول یافت نشد");

    const currentQty = productSnap.data().quantity || 0;
    await updateDoc(productRef, {
      quantity: currentQty + quantity,
    });

    await deleteDoc(saleRef);

    return { success: true };
  } catch (err: any) {
    console.log("❌ خطا در حذف فروش:", err);
    return { success: false, msg: err.message };
  }
};
export const settleLoan = async (saleId: string, price: number): Promise<boolean> => {
  try {
    const saleRef = doc(firestore, "sales", saleId);
    await updateDoc(saleRef, {
      loan: false,
      loanAmount: 0,
      PriceAfterLoan: price,
    });
    return true;
  } catch (error) {
    console.error("خطا در تسویه حساب:", error);
    return false;
  }
};
export const getAllSales = async (): Promise<SellType[]> => {
  const q = query(collection(firestore, "sales"), orderBy("date", "desc"));
  const snapshot = await getDocs(q);
  const sales: SellType[] = [];

  snapshot.forEach((docSnap) => {
    sales.push({
      id: docSnap.id,
      ...docSnap.data(),
    } as unknown as SellType);
  });

  return sales;
};

export const createSell = async (sellData: SellType): Promise<{ success: boolean; msg?: string }> => {
  try {
    // 1. پیدا کردن محصول در inventory
    const productSnapshot = await getDoc(doc(firestore, "inventory", sellData.inventoryProduct));
    if (!productSnapshot.exists()) {
      return { success: false, msg: "محصول یافت نشد" };
    }

    const productData = productSnapshot.data();
    const currentQuantity = productData.quantity;

    // 2. بررسی موجودی کافی
    if (sellData.quantity > currentQuantity) {
      return { success: false, msg: "مقدار فروش بیشتر از موجودی است" };
    }

    // 3. ساخت سند جدید برای sales
    const salesRef = doc(collection(firestore, "sales"));
    const createdAt = new Date();

    await setDoc(salesRef, {
      ...sellData,
      inventoryProduct: productSnapshot.id,
      date: Timestamp.fromDate(
        sellData.date instanceof Date
          ? sellData.date
          : (sellData.date && typeof sellData.date === "string"
              ? new Date(sellData.date)
              : createdAt)
      ),
      ownerName: sellData.ownerName,
    });

    // 4. کم‌کردن مقدار موجودی در inventory
    await updateDoc(doc(firestore, "inventory", sellData.inventoryProduct), {
      quantity: currentQuantity - sellData.quantity,
    });

    return { success: true };
  } catch (err: any) {
    console.log("Error creating sell:", err.message);
    return { success: false, msg: err.message };
  }
};
