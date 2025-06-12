import localFont from "next/font/local"
import "@/app/globals.css"
import { metadata, viewport, themeColor } from './metadata'
import { Inter } from "next/font/google"
import { AuthProvider } from "@/context/AuthContext"
import AuthWrapper from "@/components/AuthWrapper"
import { Toaster } from "sonner"

export { metadata, viewport, themeColor }

// Cargando las fuentes locales
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
})

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
})

// Cargando la fuente de Google
const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({ children }) {
  return (
    <html lang="es">
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
