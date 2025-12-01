// services/adminMessages.ts
import { db } from "@/config/firebase.client"; // مسیر به فایل firebase config خودت
import { collection, addDoc, Timestamp } from "firebase/firestore";

export const saveAdminMessage = async (msg: {
  title: string;
  message: string;
  created: Date;
  adminUserName: string;
}) => {
  const docRef = await addDoc(collection(db, "adminMessages"), {
    ...msg,
    created: Timestamp.fromDate(msg.created),
  });
  return docRef;
};
