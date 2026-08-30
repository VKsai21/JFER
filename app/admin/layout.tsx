import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/serverauth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/login");
  }

  return <>{children}</>;
}