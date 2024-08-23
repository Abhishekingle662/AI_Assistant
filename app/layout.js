import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from '@vercel/analytics/react';
import ClientLayout from './ClientLayout';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Luna",
  description: "Your Cosmic Guide to Exploring the Universe!", 
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
        <Analytics />
      </body>
    </html>
  );
}
