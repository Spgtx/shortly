import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { linkService } from '@/lib/services/link-service';
import { isValidUrl } from '@/lib/utils/url';
import { z } from 'zod';

const createLinkSchema = z.object({
  originalUrl: z.string().url(),
  customCode: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  isPublic: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const data = createLinkSchema.parse(body);

    if (!isValidUrl(data.originalUrl)) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    const link = await linkService.createLink({
      userId: session?.user?.id,
      originalUrl: data.originalUrl,
      customCode: data.customCode,
      title: data.title,
      description: data.description,
      isPublic: data.isPublic,
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error: any) {
    console.error('Create link error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create link' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const links = await linkService.getUserLinks(session.user.id);
    return NextResponse.json(links);
  } catch (error: any) {
    console.error('Get links error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch links' },
      { status: 500 }
    );
  }
}