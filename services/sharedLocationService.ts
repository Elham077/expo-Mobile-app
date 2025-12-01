// services/sharedLocationService.ts
import { firestore } from "@/config/firebase.client";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";

export const getRecentSharedLocations = async () => {
  const oneDayAgo = Timestamp.fromDate(
    new Date(Date.now() - 24 * 60 * 60 * 1000)
  );

  const q = query(
    collection(firestore, "sharedLocations"),
    where("createdAt", ">", oneDayAgo)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as any),
  }));
};
