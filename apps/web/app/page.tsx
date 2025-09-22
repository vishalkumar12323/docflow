import Link from "next/link";

export default function Home() {
  return (
    <div className="h-screen bg-slate-950 text-white">
      <h1>Dockflow</h1>

      <Link
        href={"/login"}
        className="cursor-pointer px-6 py-2 shadow bg-amber-500"
      >
        Login
      </Link>
      <Link
        href={"/signup"}
        className="cursor-pointer px-6 py-2 shadow bg-amber-500"
      >
        Signup
      </Link>
    </div>
  );
}
