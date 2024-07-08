import {IBM_Plex_Mono} from "next/font/google";
import "./globals.css";
import {Web3ModalProvider} from "@/context/Web3Modal";
import { Analytics } from "@vercel/analytics/react"

export const metadata = {
  title: {
    default: 'ClarityMarket'
  },
  description: 'Invest with confidence, learn with clarity',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png'
  }
}

const plexmono = IBM_Plex_Mono(
  {weight: "400", subsets: ["latin"]},
);


export default function RootLayout(
  {
    children,
  }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en">
    <body className={plexmono.className}>
    <div className="h-screen">
      <Web3ModalProvider>
        {children}
        <Analytics/>
      </Web3ModalProvider>
    </div>
    </body>
    </html>
  );
}
