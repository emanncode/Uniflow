import type { Metadata } from 'next'
import './globals.css'
import { Sora } from "next/font/google";

export const sora = Sora({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Uniflow',
  description: 'Universal University Management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={sora.className}>
      <body>{children}</body>
    </html>
  )
}