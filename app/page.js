// app/page.js
// Página principal — Server Component que obtiene datos de Back4App

import { initParse } from '@/lib/parse'
import Header from '@/components/Header'
import Ticker from '@/components/Ticker'
import NewsGrid from '@/components/NewsGrid'

// Revalidar cada 5 minutos (ISR de Next.js)
export const revalidate = 300

async function getNews() {
  try {
    const Parse = initParse()
    const NewsItem = Parse.Object.extend('NewsItem')
    const query = new Parse.Query(NewsItem)
    query.descending('publishedAt')
    query.limit(30)

    const results = await query.find({ useMasterKey: true })

    return results.map(item => ({
      id: item.id,
      headline: item.get('headline'),
      summary: item.get('summary'),
      type: item.get('type') || 'noticia',
      impact: item.get('impact') || 'medio',
      category: item.get('category') || 'indices',
      bullish: item.get('bullish') || [],
      bearish: item.get('bearish') || [],
      neutral: item.get('neutral') || [],
      source: item.get('source') || '',
      url: item.get('url') || '',
      publishedAt: item.get('publishedAt')?.toISOString() || item.createdAt?.toISOString(),
    }))
  } catch (error) {
    console.error('Error loading news from Back4App:', error)
    // Devolver datos de ejemplo si Back4App no está configurado aún
    return getMockNews()
  }
}

function getMockNews() {
  return [
    {
      id: '1',
      headline: 'Fed mantiene tasas pero elimina proyección de tres recortes en 2025',
      summary: 'La Reserva Federal decidió mantener el rango objetivo entre 5,25% y 5,50%. El dot plot revisado muestra solo un recorte esperado para 2025, frente a los tres de diciembre, citando inflación persistente en servicios.',
      type: 'anuncio',
      impact: 'alto',
      category: 'indices',
      bullish: ['DXY', 'USD/JPY', 'Bancos US'],
      bearish: ['SPX', 'NDX', 'EUR/USD', 'XAU/USD'],
      neutral: [],
      source: 'Reuters · Fed.gov',
      url: '',
      publishedAt: new Date().toISOString(),
    },
    {
      id: '2',
      headline: 'Fuentes: OPEP+ consideraría extender recortes de producción hasta Q3',
      summary: 'Arabia Saudita y Rusia estarían evaluando prolongar los recortes voluntarios de producción más allá de junio, en respuesta a la debilidad de precios del crudo.',
      type: 'rumor',
      impact: 'medio',
      category: 'energia',
      bullish: ['WTI', 'Brent', 'XOM', 'CVX'],
      bearish: ['Aerolíneas'],
      neutral: ['USD/CAD'],
      source: 'Bloomberg (sin confirmar)',
      url: '',
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '3',
      headline: 'BCE recorta tasas 25pb pero advierte dependencia de datos futuros',
      summary: 'El Banco Central Europeo redujo su tasa de depósito al 3,75%, primer recorte desde 2019. Lagarde descartó un ciclo predefinido de bajadas.',
      type: 'anuncio',
      impact: 'alto',
      category: 'divisas',
      bullish: ['DAX', 'CAC 40', 'IBEX 35', 'Bonos DE'],
      bearish: ['EUR/USD', 'EUR/GBP'],
      neutral: [],
      source: 'ECB.europa.eu',
      url: '',
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: '4',
      headline: 'China anuncia estímulo fiscal de $140 mil millones para infraestructura',
      summary: 'El Ministerio de Finanzas chino detalló un paquete de infraestructura y consumo interno para sostener el crecimiento ante la debilidad del sector inmobiliario.',
      type: 'noticia',
      impact: 'bajo',
      category: 'indices',
      bullish: ['Hang Seng', 'MSCI EM', 'AUD/USD', 'Cobre'],
      bearish: [],
      neutral: [],
      source: 'Xinhua · FT',
      url: '',
      publishedAt: new Date(Date.now() - 10800000).toISOString(),
    },
    {
      id: '5',
      headline: 'India restringe exportaciones de litio y cobalto en tensión comercial',
      summary: 'Nueva Delhi anunció controles sobre minerales críticos afectando la cadena de suministro de baterías EV en medio de negociaciones con la UE y EE.UU.',
      type: 'noticia',
      impact: 'medio',
      category: 'metales',
      bullish: ['Litio', 'Cobalto', 'SQM', 'ALB'],
      bearish: ['Tesla', 'EV ETF'],
      neutral: [],
      source: 'Reuters · Economic Times',
      url: '',
      publishedAt: new Date(Date.now() - 14400000).toISOString(),
    },
    {
      id: '6',
      headline: 'Rumor: Apple negocia adquisición de startup de IA valorada en $3B',
      summary: 'Personas familiarizadas con el asunto indican conversaciones preliminares entre Apple y una compañía de modelos de lenguaje para dispositivos edge.',
      type: 'rumor',
      impact: 'medio',
      category: 'acciones',
      bullish: ['AAPL', 'NDX'],
      bearish: [],
      neutral: ['Semiconductores'],
      source: 'The Information (sin confirmar)',
      url: '',
      publishedAt: new Date(Date.now() - 18000000).toISOString(),
    },
  ]
}

export default async function HomePage() {
  const news = await getNews()

  return (
    <>
      <Header />
      <Ticker />
      <NewsGrid news={news} />
    </>
  )
}
