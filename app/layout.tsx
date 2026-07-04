import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Latihan Matematika",
  description: "Website latihan matematika interaktif",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}