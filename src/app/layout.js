import localFont from "next/font/local"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/context/AuthContext"
import { SocketProvider } from "@/context/SocketContext"
import AuthWrapper from "@/components/AuthWrapper"
import { Toaster } from "sonner"

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

export const metadata = {
  title: "Next App",
  description: "App protegida con rutas públicas y privadas",
}

export default function RootLayout({ children }) {
  return (
    <SocketProvider>
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
    </SocketProvider>
  )
}
