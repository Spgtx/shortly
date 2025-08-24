import { NextRequest, NextResponse } from 'next/server';
import { linkService } from '@/lib/services/link-service';

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  const { code } = params;

  try {
    const originalUrl = await linkService.getLinkWithCache(code);
    if (!originalUrl) {
      return new NextResponse('Link not found', { status: 404 });
    }

    const link = await linkService.getLink(code);

    if (link) {
      const userAgent = req.headers.get('user-agent') || '';
      const referer = req.headers.get('referer') || '';
      const ipAddress = req.ip || req.headers.get('x-forwarded-for') || '';

      fetch(`${process.env.NEXTAUTH_URL}/api/track-click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkId: link.id,
          userAgent,
          referer,
          ipAddress,
        }),
      }).catch(console.error);

      linkService.updateClickCount(link.id).catch(console.error);
    }

    return NextResponse.redirect(originalUrl);
  } catch (err) {
    console.error('Redirect error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
