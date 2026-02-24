import { NextResponse } from 'next/server'
import { fetchFinancialNewsEN } from '@/lib/newsFetcher'

export async function GET() {
  try {
    const articles = await fetchFinancialNewsEN('gold markets', 3)
    return NextResponse.json({ success: true, count: articles.length, articles })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message })
  }
}
```

4. **"Commit changes"**

Luego corré:
```
curl --ssl-no-revoke https://marketpulse-chi.vercel.app/api/debug
