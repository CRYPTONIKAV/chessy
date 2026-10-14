import type { Metadata } from "next";
import "../styles/globals.css";
import StoreHydration from "@/components/StoreHydration";

export const metadata: Metadata = {
  title: "Chessy",
  description: "Fast, minimalist chess training focused on correct thinking through immediate correction and principled feedback.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <StoreHydration />
        {children}
      </body>
    </html>
  );
}
