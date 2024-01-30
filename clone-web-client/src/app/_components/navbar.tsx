"use client";
import Image from "next/image";
import Link from "next/link";
import SignIn from "./SignIn";
import { onAuthStateChangedHelper } from "../_firebase/firebase";
import { useEffect, useState } from "react";
import { User } from "firebase/auth";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const unsubscribe = onAuthStateChangedHelper((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-row justify-between px-8 py-4 border-b-2">
      <Link href="/" className="flex flex-row items-center">
        <Image
          src="/playlogo.png"
          alt="Play Button Logo"
          width={100}
          height={80}
        />
        <h1 className="text-xl font-bold">YouTube (clone)</h1>
      </Link>
      <SignIn user={user} />
    </div>
  );
}
