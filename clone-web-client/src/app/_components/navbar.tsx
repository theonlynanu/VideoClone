"use client";
import Image from "next/image";
import Link from "next/link";
import SignIn from "./SignIn";
import { onAuthStateChangedHelper } from "../_firebase/firebase";
import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import Upload from "./Upload";

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
      {user && (
        <Link
          href="/upload"
          className="rounded-full border-2 border-gray-800 h-12 self-center w-fit px-2 font-semibold flex items-center hover:bg-gray-200"
        >
          <p className="">Upload</p>
        </Link>
      )}
      <SignIn user={user} />
    </div>
  );
}
