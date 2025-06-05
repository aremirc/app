import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url')

  try {
    const html = await fetch(url).then(res => res.text())
    const $ = cheerio.load(html)

    const title = $('meta[property="og:title"]').attr('content') || $('title').text()
    const description = $('meta[property="og:description"]').attr('content') || ''
    const image = $('meta[property="og:image"]').attr('content') || ''

    return NextResponse.json({ title, description, image })
  } catch (error) {
    return NextResponse.json({ error: 'No se pudo obtener la vista previa' }, { status: 400 })
  }
}
