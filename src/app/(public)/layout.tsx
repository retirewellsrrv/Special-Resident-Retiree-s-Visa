import { Navbar } from "@/components/layout/navbar";
import { getSession } from "@/actions/auth";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getSession();
  return (
    <>
      <Navbar user={user} />
      {children}
    </>
  )
}
