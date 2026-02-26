import { NextResponse } from 'next/server'
import { initParse } from '@/lib/parse'

export async function POST(request) {
  try {
    const body = await request.json()
    const { asset, direction, entry, stopLoss, takeProfit, confidence, rationale, headline, source } = body

    const Parse = initParse()
    const TradingIdea = Parse.Object.extend('TradingIdea')
    const idea = new TradingIdea()

    idea.set('asset', asset)
    idea.set('direction', direction)
    idea.set('entry', entry)
    idea.set('stopLoss', stopLoss)
    idea.set('takeProfit', takeProfit)
    idea.set('confidence', confidence)
    idea.set('rationale', rationale)
    idea.set('headline', headline)
    idea.set('source', source)
    idea.set('status', 'abierta')

    const acl = new Parse.ACL()
    acl.setPublicReadAccess(true)
    acl.setPublicWriteAccess(true)
    idea.setACL(acl)

    await idea.save(null, { useMasterKey: true })

    return NextResponse.json({ success: true, id: idea.id })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
