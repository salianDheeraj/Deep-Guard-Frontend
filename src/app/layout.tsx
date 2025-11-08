import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Minimalist Insight",
  description: "Clarity in a Complex World.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="m-0 p-0 overflow-x-hidden">{children}</body>
    </html>
  );
}
