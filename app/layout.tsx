import "./globals.css";
import Image from "next/image";

export const metadata = {
  title: "Salik Insurance",
  description: "Salik Insurance Partner Selection",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-100 text-slate-900 min-h-screen">
        {/* HEADER */}
       <header className="bg-white px-6 py-1 shadow-sm mb-1">
  <div className="flex justify-center">
    <Image
      src="/salik.svg"
      alt="Salik Logo"
      width={150}
      height={70}
      priority
      className="w-36 sm:w-44 md:w-52 h-auto"
    />
  </div>
</header>


        {/* MAIN CONTENT */}
        <main className="min-h-[calc(100vh-80px)]">{children}</main>
      </body>
    </html>
  );
}
