import { getAuth, reload } from "firebase/auth";

export const checkEmailVerification = async (): Promise<boolean> => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.warn("No user is logged in.");
    return false;
  }

  try {
    await reload(user); // refresh user data from server
    return user.emailVerified;
  } catch (error) {
    console.error("Failed to check email verification:", error);
    return false;
  }
};
