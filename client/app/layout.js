import { Geist, Geist_Mono } from "next/font/google";
import "./styles/globals.css";
import Head from "next/head";
import Navbar from "./components/Navbar";

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
    "A finance  tracker for your daily income, expense and total balance",
  icons: {
    icon: "/favicon.png", // will load from /public or /app
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* <Head>
        <title>FinTrack</title>
        <meta
          name="description"
          content="A finance tracker for your daily income, expense and total balance"
        />
        <link rel="icon" type="image/png" href="/favicon.png" />
      </Head> */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
