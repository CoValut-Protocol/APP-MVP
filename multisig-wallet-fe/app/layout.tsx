import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Providers from "./providers";
import { ConnectContext } from "./contexts";

const inter = Inter({ subsets: ["latin"] });

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Covault",
  description: "Covault is the answer for Non-Custodial DeFi on Bitcoin layer 1; built to satisfy increasing demand for secure, transparent and decentralized asset management.  ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <div className="bg-[#131416] h-screen overflow-auto">
            <ConnectContext>
              <Header />
              {children}
            </ConnectContext>
          </div>
        </Providers>
      </body>
    </html>
  );
}
