import { notFound, redirect } from 'next/navigation';
import { linkService } from '@/lib/services/link-service';

interface RedirectPageProps {
  params: {
    code: string;
  };
}

export default async function RedirectPage({ params }: RedirectPageProps) {
  const { code } = params;

  try {
    // Get the original URL using cache-first strategy
    const originalUrl = await linkService.getLinkWithCache(code);

    if (!originalUrl) {
      notFound();
    }

    // Get link details for tracking
    const link = await linkService.getLink(code);

    if (link) {
      // Fire async tracking (don't await to avoid slowing redirect)
      fetch(`${process.env.NEXTAUTH_URL}/api/track-click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkId: link.id,
          userAgent: '', // Will be captured client-side if needed
          referer: '', // Will be captured client-side if needed
          ipAddress: '', // Will be captured server-side if needed
        }),
      }).catch(console.error);
    }

    // Redirect to original URL
    redirect(originalUrl);
  } catch (error) {
    console.error('Redirect error:', error);
    notFound();
  }
}

export function generateMetadata({ params }: RedirectPageProps) {
  return {
    title: 'Redirecting...',
    description: 'Shortly URL Shortener - Redirecting you to your destination',
  };
}