import { Geist, Geist_Mono, Inter } from "next/font/google"
import "./globals.css"
import { metadata, viewport, themeColor } from './metadata'
import { AuthProvider } from "@/context/AuthContext"
import AuthWrapper from "@/components/AuthWrapper"
import { Toaster } from "sonner"

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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.className} antialiased`}
      >
        <AuthProvider>
          <AuthWrapper>
            <Toaster />
            {children}
          </AuthWrapper>
        </AuthProvider>
      </body>
    </html>
  )
}
