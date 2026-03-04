'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import HeatMap from '@/components/HeatMap'

export const metadata = {
  title: 'Mapa de Calor — MarketPulse',
  description: 'Visualizá el rendimiento de los mercados globales en tiempo real por sector: índices, forex, commodities, crypto, acciones y bonos.',
}

export default function HeatMapPage() {
  return (
    <>
      <Header />
      <HeatMap />
    </>
  )
}
