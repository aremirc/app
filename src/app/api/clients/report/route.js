// app/api/clients/report/route.js
import { generateClientReport } from '@/lib/services/clientReportService';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { startDate, endDate } = req.nextUrl.searchParams;

    const report = await generateClientReport({
      startDate,
      endDate,
    });

    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
