import { useRouter } from "expo-router";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { auth, db } from "@/config/firebase.client";
import { AuthContextType, UserType } from "@/types";

// ========================== Auth Context ==========================
export const AuthContext = createContext<AuthContextType | null>(null);

// بررسی اینکه کاربر هنوز کارمند است یا خیر
const checkIsEmployee = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (userDoc.exists()) {
    const data = userDoc.data();
    if (data?.isEmployee === false) {
      await deleteDoc(doc(db, "users", user.uid));
      await user.delete();
      await auth.signOut();
      alert("شما توسط مدیر حذف شده‌اید.");
    }
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserType>(null);
  const router = useRouter();
  const { t } = useTranslation();

  // ========================== onAuthStateChanged ==========================
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await checkIsEmployee(); // 🔁 اینجا هم چک شود
        await updateUserData(firebaseUser.uid);
        router.replace("/(tabs)");
      } else {
        setUser(null);
        router.replace("/(auth)/welcome");
      }
    });

    return () => unsub();
  }, []);

  // ========================== Login ==========================
  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      await checkIsEmployee();
      return { success: true };
    } catch (error: any) {
      let msg = error.message;
      if (msg.includes("(auth/invalid-credential)")) msg = t("wro_credent");
      if (msg.includes("(auth/invalid-email)")) msg = t("invalid_email");
      if (msg.includes("(auth/network-request-failed)")) msg = t("connec_problem");
      return { success: false, msg };
    }
  };

  // ========================== Register ==========================
  const register = async (
    email: string,
    password: string,
    name: string,
    number: string,
    address: string,
  ) => {
    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(response.user, { displayName: name });

      await setDoc(doc(db, "users", response.user.uid), {
        uid: response.user.uid,
        name,
        email,
        number,
        address,
        role: "user",
        isEmployee: true,
      });

      await sendEmailVerification(response.user);
      alert("Verification email sent! Please check your inbox.");
      return { success: true };
    } catch (error: any) {
      let msg = error.message;
      if (msg.includes("(auth/email-already-in-use)")) msg = t("already_in_use");
      if (msg.includes("(auth/invalid-email)")) msg = t("invalid_email");
      if (msg.includes("(auth/network-request-failed)")) msg = t("connec_problem");
      return { success: false, msg };
    }
  };

  // ========================== Update User Data ==========================
  const updateUserData = async (uid: string) => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const userData: UserType = {
          uid: data.uid,
          email: data.email || null,
          name: data.name || null,
          number: data.number || null,
          address: data.address || null,
          image: data.image || null,
          role: data.role || "user",
          isEmployee: data.isEmployee ?? true, // ✅ مهم
        };
        setUser(userData);
      }
    } catch (error: any) {
      console.log("Failed to fetch user data:", error.message);
    }
  };

  // ========================== Context Value ==========================
  const contextValue: AuthContextType = {
    user,
    setUser,
    login,
    register,
    updateUserData,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// ========================== useAuth Hook ==========================
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be wrapped inside an AuthProvider");
  }
  return context;
};
