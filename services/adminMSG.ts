import { firestore } from "@/config/firebase.client";
import { AdminMSG } from "@/types";
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

export const sendAdminMessage = async (msg: AdminMSG): Promise<boolean> => {
  try {
    await addDoc(collection(firestore, "adminMessages"), {
      ...msg,
      date: Timestamp.fromDate(new Date()),
    });
    return true;
  } catch (err) {
    console.log("خطا در ارسال پیام:", err);
    return false;
  }
};

export const getAllAdminMessages = async (): Promise<AdminMSG[]> => {
  const q = query(
    collection(firestore, "adminMessages"),
    orderBy("date", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as AdminMSG[];
};

export const deleteAdminMessage = async (id: string) => {
  try {
    await deleteDoc(doc(firestore, "adminMessages", id));
    return true;
  } catch (err) {
    return false;
  }
};
