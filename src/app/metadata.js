export const metadata = {
  title: {
    default: 'FieldSync - RENVTEX',
    template: '%s | FieldSync',
  },
  description: 'Plataforma de RENVTEX para gestionar órdenes de trabajo, visitas técnicas y clientes.',
  applicationName: 'FieldSync',
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  keywords: [
    'RENVTEX',
    'FieldSync',
    'servicios técnicos',
    'gestión de órdenes',
    'clientes',
    'soporte',
    'visitas técnicas',
    'Perú',
  ],
  authors: [
    { name: 'RENVTEX', url: 'https://renvtex.com' },
  ],
  creator: 'RENVTEX',
  publisher: 'RENVTEX',
  metadataBase: new URL('https://fieldsync.app'),

  openGraph: {
    title: 'FieldSync - RENVTEX',
    description: 'Control y eficiencia total en tus servicios técnicos con FieldSync.',
    url: 'https://fieldsync.app',
    siteName: 'FieldSync',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FieldSync Open Graph Image',
      },
    ],
    locale: 'es_PE',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'FieldSync - RENVTEX',
    description: 'Gestiona tus órdenes de trabajo y visitas técnicas con FieldSync.',
    images: ['/og-image.png'],
  },

  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#5bbad5',
      },
    ],
  },

  manifest: '/site.webmanifest',
  alternates: {
    canonical: '/',
    languages: {
      'es-PE': '/es-PE',
      'en-US': '/en-US',
    },
  },
  category: 'productivity',
  appleWebApp: {
    title: 'FieldSync',
    capable: true,
    statusBarStyle: 'default',
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const themeColor = [
  { media: '(prefers-color-scheme: light)', color: '#111c27' },
  { media: '(prefers-color-scheme: dark)', color: '#111c27' },
]
