import type { Metadata } from "next"
import { Roboto } from "next/font/google"
import { Toaster } from "@/components/ui/toast"
import "./globals.css"

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Ceklis - Platform Komunitas Kota Tegal",
  description: "Platform kolaborasi dan ceklis komunitas terpadu (RT, POSYANDU, SEKOLAH)",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="id"
      className={`${roboto.variable} h-full antialiased`}
    >
      <body className={`${roboto.className} min-h-full flex flex-col bg-background text-foreground leading-relaxed font-sans`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
