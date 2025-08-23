import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/lib/services/analytics-service';
import { linkService } from '@/lib/services/link-service';

export async function POST(request: NextRequest) {
  try {
    const { linkId, userAgent, referer, ipAddress } = await request.json();

    if (!linkId) {
      return NextResponse.json({ error: 'Missing linkId' }, { status: 400 });
    }

    // Log the click asynchronously
    await Promise.all([
      analyticsService.logClick({
        linkId,
        userAgent,
        referer,
        ipAddress,
      }),
      linkService.updateClickCount(linkId),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Track click error:', error);
    // Don't return error to avoid affecting user experience
    return NextResponse.json({ success: true });
  }
}