import "./globals.css";
import { ThemeProvider } from "./theme-provider";
import ThemeToggleButton from "../components/ThemeToggleButton";


export const metadata = {
  title: "Deepfake Detector",
  description: "AI Deepfake detection web app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
        <ThemeProvider>
          {/* 🔥 Toggle Button Visible on Every Page */}
          <div className="fixed top-4 right-4 z-50">
            <ThemeToggleButton />
          </div>

          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
