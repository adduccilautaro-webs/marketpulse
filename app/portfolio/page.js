'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'

export default function PortfolioPage() {
  const [loading, setLoading] = useState(false)
  const [portfolio, setPortfolio] = useState(null)
  const [error, setError] = useState(null)
  const [lang, set
