const FINANCIAL_QUERIES_EN = [
  'Federal Reserve interest rates inflation',
  'OPEC oil production crude',
  'gold silver commodities metals',
  'EUR USD dollar index DXY',
  'SPX DAX Nikkei stock market',
  'bitcoin ethereum cryptocurrency',
  'earnings GDP economy recession',
  'China stimulus economy',
  'ECB European Central Bank rates',
  'natural gas energy prices',
]

const FINANCIAL_QUERIES_ES = [
  'Fed tasas interes inflacion',
  'OPEP petroleo produccion',
  'oro plata metales preciosos',
  'euro dolar bolsa mercados',
  'Bitcoin criptomonedas',
  'economia PIB recesion',
  'China estimulo economia',
  'BCE tipos interes europa',
  'gas natural energia precios',
  'acciones bolsa wall street',
]

export async function fetchFinancialNewsEN(query = null, pageSize = 3) {
