// app/api/services/report/route.js
import { generateServiceReport } from '@/lib/services/serviceReportService';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { startDate, endDate } = req.nextUrl.searchParams;

    const report = await generateServiceReport({
      startDate,
      endDate,
    });

    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
