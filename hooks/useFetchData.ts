import { firestore } from "@/config/firebase.client";
import {
  collection,
  onSnapshot,
  query,
  QueryConstraint,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";

const useFetchData = <T>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  dependencies: any[] = [] // آرایه اضافی برای رفرش دستی
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!collectionName) return;

    setLoading(true);
    const collectionRef = collection(firestore, collectionName);
    const q = query(collectionRef, ...constraints);

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const fetchedData = snapshot.docs.map((doc) => {
          return {
            id: doc.id,
            ...doc.data(),
          };
        }) as T[];
        setData(fetchedData);
        setLoading(false);
      },
      (err) => {
        console.log("====================================");
        console.log("Error fetching Data: ", err);
        console.log("====================================");
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [collectionName, JSON.stringify(constraints), ...dependencies]);

  return {
    data,
    loading,
    error,
  };
};

export default useFetchData;

const styles = StyleSheet.create({});
