import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AI_Assistant",
  description: "AI_Assistant to help answer your Questions", 
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className} style={{
        backgroundImage: "url('/assets/background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        minHeight: "100vh"
      }}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
