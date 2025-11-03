import type { Metadata } from "next";
import "./globals.css"; // optional if you have global styles

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
      <body>{children}</body>
    </html>
  );
}
