import { db, firestore } from "@/config/firebase.client";
import { ResponseType, UserDataType } from "@/types";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { uploadFileToCloudinary } from "./imageServices";
export const fetchAllUsers = async () => {
  const querySnapshot = await getDocs(collection(db, "users"));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const updateUserRole = async (uid: string, newRole: string) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { role: newRole });
};

export const deleteUser = async (uid: string) => {
  const userRef = doc(db, "users", uid);

  await updateDoc(userRef, {
    isEmployee: false,
  });
};
export const updateUser = async (
  uid: string,
  updatedData: UserDataType
): Promise<ResponseType> => {
  try {
    // image Upload
    if (updatedData.image && updatedData?.image?.uri) {
      const imageUploadRes = await uploadFileToCloudinary(
        updatedData.image,
        "users"
      );
      if (!imageUploadRes.success) {
        return {
          success: false,
          msg: imageUploadRes.msg || "Failed to upload image",
        };
      }
      updatedData.image = imageUploadRes.data;
    }

    const userRef = doc(firestore, "users", uid);
    await updateDoc(userRef, updatedData);

    // fetch the user & update the user state

    return { success: true, msg: "updated seuccessfully" };
  } catch (error: any) {
    console.log("error updating user: ", error);
    return { success: false, msg: error?.message };
  }
};
