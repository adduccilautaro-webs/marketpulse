import './globals.css'

export const metadata = {
  title: 'MarketPulse — Noticias que mueven mercados',
  description: 'Monitorea noticias, anuncios y rumores financieros con análisis de impacto en activos, índices, divisas, metales y energía.',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=Syne:wght@400;600;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
