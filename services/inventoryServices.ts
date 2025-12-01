import { firestore } from "@/config/firebase.client";
import { ResponseType, InventoryType} from "@/types";
import { collection, deleteDoc, doc, setDoc } from "firebase/firestore";
import { uploadFileToCloudinary } from "./imageServices";

export const createOrUpdateProduct = async (
  productData: Partial<InventoryType>
): Promise<ResponseType> => {
  try {
    let productToSave = { ...productData };
    
    // Handle image upload if exists
    if (productData?.image) {
      const imageUploadRes = await uploadFileToCloudinary(productData.image, "products");
      if (!imageUploadRes.success) {
        return { success: false, msg: imageUploadRes.msg || "Failed to upload product image" };
      }
      productToSave.image = imageUploadRes.data;
    }

    // Set defaults for new products
    if (!productData?.id) {
      productToSave = {
        ...productToSave,
        quantity: productToSave.quantity || 0,
        created: new Date()
      };
    }

    // Convert Date objects to Firestore Timestamps
    const firestoreData = {
  ...productToSave,
  ...(productToSave.expireDate && { 
    expireDate: productToSave.expireDate instanceof Date ? 
      productToSave.expireDate.toISOString() : 
      new Date(productToSave.expireDate).toISOString()
  }),
  ...(productToSave.created && { 
    created: productToSave.created instanceof Date ? 
      productToSave.created.toISOString() : 
      new Date(productToSave.created).toISOString()
  })
};

    // Create or update document reference
    const productRef = productData?.id
      ? doc(firestore, "inventory", productData.id)
      : doc(collection(firestore, "inventory"));
    
    await setDoc(productRef, firestoreData, { merge: true });
    
    return { 
      success: true, 
      data: { ...firestoreData, id: productRef.id } 
    };
  } catch (error: any) {
    console.error("Error creating/updating product:", error);
    return { success: false, msg: error.message };
  }
};

export const deleteProduct = async (productId: string): Promise<ResponseType> => {
  try {
    const productRef = doc(firestore, "inventory", productId);
    await deleteDoc(productRef);
    
    return { success: true, msg: "Product deleted successfully" };
  } catch (err: any) {
    console.error("Error deleting product:", err);
    return { success: false, msg: err.message };
  }
};