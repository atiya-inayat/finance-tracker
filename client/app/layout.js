import { Geist, Geist_Mono } from "next/font/google";
import "./styles/globals.css";
import Navbar from "./components/Navbar";
import ThemeProvider from "./components/ThemeProvider";
import FloatingAIChat from "./(pages)/aiChat/page";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "FinTrack",
  description:
    "A finance tracker for your daily income, expense and total balance",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 transition-colors duration-300`}
      >
        <ThemeProvider>
          <Navbar />
          {children}
          <FloatingAIChat />
        </ThemeProvider>
      </body>
    </html>
  );
}
