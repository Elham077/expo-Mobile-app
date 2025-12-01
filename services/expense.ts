import { firestore } from "@/config/firebase.client";
import { ExpensesType } from "@/types";
import { router } from "expo-router";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { Alert } from "react-native";

export const addExpense = async (data: ExpensesType) => {
  try {
    await addDoc(collection(firestore, "expenses"), {
      ...data,
      date: Timestamp.fromDate(
        data.created instanceof Date
          ? data.created
          : data.created &&
            typeof data.created === "object" &&
            "toDate" in data.created
          ? (data.created as any).toDate()
          : new Date(data.created ?? Date.now())
      ),
    });
    return true;
  } catch (err) {
    console.error("خطا در ثبت هزینه:", err);
    return false;
  }
};

export const getAllExpenses = async (): Promise<ExpensesType[]> => {
  try {
    const q = query(
      collection(firestore, "expenses"),
      orderBy("created", "desc")
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.warn("No expenses found in collection!");
      return [];
    }
    // snapshot.docs.forEach((doc) => {
    //   console.log(`Document ID: ${doc.id}`, doc.data());
    // });

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        category: data.category || "دسته‌بندی نشده",
        expenseCost: data.expenseCost || data.amount || 0,
        description: data.description || "",
        image: data.image || null,
        ownerName: data.ownerName || "ناشناس",
        created:
          data.date instanceof Timestamp
            ? data.date.toDate().toISOString()
            : typeof data.date === "string"
            ? data.date
            : new Date().toISOString(),
      };
    });
  } catch (err) {
    console.error("خطا در دریافت هزینه‌ها:", err);
    return [];
  }
};

export const deleteExpense = async (id: string) => {
  try {
    await deleteDoc(doc(firestore, "expenses", id));
    return (Alert.alert("حذف محصول", "محصول حذف گردید"), router.back());
  } catch (err) {
    return false;
  }
};
