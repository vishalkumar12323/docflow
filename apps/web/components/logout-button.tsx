"use client";
import { signOut } from "next-auth/react";
// import { useRouter } from "next/navigation";

export default function LogoutButton() {
  // const router = useRouter();
  return (
    <button
      className="cursor-pointer px-6 py-2 shadow bg-amber-500"
      onClick={() => {
        signOut({ redirect: true, redirectTo: "/" });
      }}
    >
      Logout
    </button>
  );
}
