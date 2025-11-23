import "./globals.css";
import { ThemeProvider } from "@/lib/theme";

export const metadata = {
  title: "Deepfake Detector",
  description: "AI Deepfake detection web app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
