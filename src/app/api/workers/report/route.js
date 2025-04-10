// app/api/workers/report/route.js
import { generateWorkerReport } from '@/lib/services/workerReportService';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { startDate, endDate } = req.nextUrl.searchParams;

    const report = await generateWorkerReport({
      startDate,
      endDate,
    });

    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
