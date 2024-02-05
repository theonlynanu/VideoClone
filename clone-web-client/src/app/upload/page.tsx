"use client";
import { useEffect, useState } from "react";
import { onAuthStateChangedHelper } from "../_firebase/firebase";
import { User } from "firebase/auth";
import Upload from "../_components/Upload";

export default function UploadPage() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const unsubscribe = onAuthStateChangedHelper((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);
  return user ? (
    <div>
      <Upload />
    </div>
  ) : (
    "Not signed in"
  );
}
