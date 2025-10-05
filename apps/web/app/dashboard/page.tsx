import { auth } from "@/auth";
import LogoutButton from "@/components/logout-button";

export default async function DashboardPage() {
  const session = await auth();
  // console.log(session);
  return (
    <div className="h-screen bg-slate-950 text-white">
      <h1>Dashboard Page</h1>
      <div>
        <code>{JSON.stringify(session)}</code>
      </div>
      <LogoutButton />
    </div>
  );
}
