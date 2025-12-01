// import { useEffect, useState } from 'react';
// import { 
//   addDoc, 
//   collection, 
//   doc, 
//   getFirestore, 
//   onSnapshot, 
//   Timestamp, 
//   updateDoc 
// } from 'firebase/firestore';
// import { app } from '../config/firebase.client';
// import { ExpensesType } from '../types';

// const db = getFirestore(app);
// const EXPENSES_COLLECTION = 'expenses';

// export const useExpenses = () => {
//   const [expenses, setExpenses] = useState<ExpensesType[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsub = onSnapshot(collection(db, EXPENSES_COLLECTION), (snapshot) => {
//       const data = snapshot.docs.map((docSnap) => ({
//         ...(docSnap.data() as ExpensesType),
//         id: docSnap.id,
//       }));
//       setExpenses(data);
//       setLoading(false);
//     });

//     return () => unsub();
//   }, []);

//   return { expenses, loading };
// };

// export const addExpense = async (expense: Omit<ExpensesType, 'id' | 'created'>) => {
//   const payload: ExpensesType = {
//     ...expense,
//     created: new Date().toISOString(),
//   };
//   await addDoc(collection(db, EXPENSES_COLLECTION), payload);
// };

// export const updateExpense = async (id: string, expense: Omit<ExpensesType, 'id' | 'created'>) => {
//   const payload: ExpensesType = {
//     ...expense,
//     created: new Date().toISOString(), // treat updated as created date if no updated field is available
//   };
//   await updateDoc(doc(db, EXPENSES_COLLECTION, id), payload);
// };
