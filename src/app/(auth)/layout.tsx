import Image from "next/image";
import bgImage from "@/assets/images/bg-rice-terraces.png"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Image
        src={bgImage}
        alt=""
        fill
        priority
        sizes="100vw"
        className="fixed inset-0 -z-10 object-cover"
      />
      <div className="fixed inset-0 -z-10 bg-[#0b1c30]/45" />
      <main
        className="relative flex min-h-screen w-full items-center justify-center px-4 py-8"
        style={{ backgroundColor: "#1a2e1f" }}
      >
        {children}
      </main>
    </>
  )
}
