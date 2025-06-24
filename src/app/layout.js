import { Geist, Geist_Mono, Inter } from "next/font/google"
import { metadata, viewport, themeColor } from './metadata'
import { Providers } from "./providers"
import "leaflet/dist/leaflet.css"
import "./globals.css"

export { metadata, viewport, themeColor }

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.className} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
