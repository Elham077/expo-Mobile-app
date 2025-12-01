// import { useEffect, useState } from 'react';
// import { addDoc, collection, deleteDoc, doc, getFirestore, onSnapshot, updateDoc } from 'firebase/firestore';
// import { app } from '../config/firebase.client';
// import { SellType } from '../types';

// const db = getFirestore(app);
// const SOLD_COLLECTION = 'soldProducts';

// export const useSoldProducts = () => {
//   const [soldProducts, setSoldProducts] = useState<SellType[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsubscribe = onSnapshot(collection(db, SOLD_COLLECTION), (snapshot) => {
//       const data = snapshot.docs.map((doc) => ({
//         ...(doc.data() as SellType),
//         id: doc.id,
//       }));
//       setSoldProducts(data);
//       setLoading(false);
//     });

//     return () => unsubscribe();
//   }, []);

//   const addSale = async (sale: Omit<SellType, 'id' | 'date'>, uid: string) => {
//     const saleToAdd: SellType = {
//       ...sale,
//       uid,
//       date: new Date().toISOString(), // store as string
//     };

//     await addDoc(collection(db, SOLD_COLLECTION), saleToAdd);
//   };

//   const updateSale = async (id: string, updated: Partial<SellType>) => {
//     await updateDoc(doc(db, SOLD_COLLECTION, id), {
//       ...updated,
//       date: new Date().toISOString(), // overwrite with new string date
//     });
//   };

//   const deleteSale = async (id: string) => {
//     await deleteDoc(doc(db, SOLD_COLLECTION, id));
//   };

//   return {
//     soldProducts,
//     loading,
//     addSale,
//     updateSale,
//     deleteSale,
//   };
// };
