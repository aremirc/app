// app/api/orders/report/route.js
import { generateOrderReport } from '@/lib/services/orderReportService';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { status, startDate, endDate } = req.nextUrl.searchParams;

    const report = await generateOrderReport({
      status,
      startDate,
      endDate,
    });

    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
