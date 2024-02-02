import { User } from "firebase/auth";
import { signInWithGoogle, signOutWithGoogle } from "../_firebase/firebase";
import { HTMLAttributes, HTMLProps } from "react";

interface SignInProps {
  user: User | null;
}

export default function SignIn({ user }: SignInProps) {
  return (
    <>
      {user ? (
        <button
          className="border-2 border-gray-800 rounded-full px-2 py-1 text-lg font-semibold hover:bg-gray-200 h-12 self-center"
          onClick={signOutWithGoogle}
        >
          Sign Out
        </button>
      ) : (
        <button
          className="border-2 border-gray-800 rounded-full px-2 py-1 text-lg font-semibold hover:bg-gray-200 h-12 self-center"
          onClick={signInWithGoogle}
        >
          Sign In
        </button>
      )}
    </>
  );
}
