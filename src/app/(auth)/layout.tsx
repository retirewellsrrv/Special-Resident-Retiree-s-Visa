import Image from "next/image";
import bgImage from "@/assets/images/bg-rice-terraces.png"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden px-4 py-8">
      <Image
        src={bgImage}
        alt=""
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 -z-10 object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-[#0b1c30]/45" />
      {children}
    </main>
  )
}
