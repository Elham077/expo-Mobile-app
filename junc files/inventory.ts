import { db, storage } from '../config/firebase.client'; // Ensure you export firestore + storage here
import {
  collection,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  doc,
  serverTimestamp,
  deleteDoc,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { InventoryType } from '../types';

const COLLECTION = 'inventory';

export const addProduct = async (product: Omit<InventoryType, 'id' | 'created' | 'updated'>, imageUri?: string) => {
  const created = new Date().toISOString();

  const productToAdd = {
    ...product,
    created,
    updated: created,
    expireDate: product.expireDate ? toDateString(product.expireDate) : null,
    image: null,
  };

  const docRef = await addDoc(collection(db, COLLECTION), productToAdd);

  let imageUrl = null;
  if (imageUri) {
    imageUrl = await uploadProductImage(docRef.id, imageUri);
    await updateDoc(docRef, { image: imageUrl });
  }

  return { id: docRef.id, ...productToAdd, image: imageUrl };
};

export const updateProduct = async (id: string, product: Omit<InventoryType, 'created'>, imageUri?: string) => {
  const updated = new Date().toISOString();

  const productToUpdate = {
    ...product,
    updated,
    expireDate: product.expireDate ? toDateString(product.expireDate) : null,
  };

  const docRef = doc(db, COLLECTION, id);

  if (imageUri) {
    const imageUrl = await uploadProductImage(id, imageUri);
    productToUpdate.image = imageUrl;
  }

  await updateDoc(docRef, productToUpdate);

  return { id, ...productToUpdate };
};

export const getAllProducts = async (): Promise<InventoryType[]> => {
  const snapshot = await getDocs(collection(db, COLLECTION));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as InventoryType[];
};

export const getProductById = async (id: string): Promise<InventoryType | null> => {
  const docRef = doc(db, COLLECTION, id);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() } as InventoryType;
  }
  return null;
};

// Optional: delete
export const deleteProduct = async (id: string) => {
  await deleteDoc(doc(db, COLLECTION, id));
};

// Helper: upload image
const uploadProductImage = async (productId: string, uri: string): Promise<string> => {
  const response = await fetch(uri);
  const blob = await response.blob();
  const imageRef = ref(storage, `inventoryImages/${productId}.jpg`);
  await uploadBytes(imageRef, blob);
  return await getDownloadURL(imageRef);
};

// Helper: ensure date is string
const toDateString = (date: Date | string): string =>
  typeof date === 'string' ? date : date.toISOString();
