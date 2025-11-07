import { fetchAuthSession } from "aws-amplify/auth";

export const getIdToken = async () => {
  try {
    const { tokens } = await fetchAuthSession();
    return tokens?.idToken?.toString() || null;
  } catch (err) {
    console.error("Error getting ID token:", err);
    return null;
  }
};