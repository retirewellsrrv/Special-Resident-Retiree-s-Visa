import bgImage from "@/assets/images/bg-rice-terraces.png"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link rel="preload" as="image" href={bgImage.src} />
      <main
        className="relative flex min-h-screen w-full items-center justify-center px-4 py-8"
        style={{
          backgroundColor: "#1a2e1f",
          backgroundImage: `linear-gradient(rgba(11, 28, 48, 0.45), rgba(11, 28, 48, 0.45)), url('${bgImage.src}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {children}
      </main>
    </>
  )
}
