import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();
  return (
    <>
      <h1>Dashboard Page</h1>
      <pre>{JSON.stringify(session)}</pre>
    </>
  );
}
