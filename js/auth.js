import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut } from "firebase/auth";
import { auth } from "./firebase-init.js";

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

export function watchAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function signInWithGoogle() {
  if (matchMedia("(max-width: 700px)").matches) return signInWithRedirect(auth, provider);
  return signInWithPopup(auth, provider);
}

export function signOutUser() {
  return signOut(auth);
}
