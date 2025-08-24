import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { linkService } from '@/lib/services/link-service';
import { z } from 'zod';

const createLinkSchema = z.object({
  originalUrl: z.string().url(),
  customCode: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  isPublic: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const data = createLinkSchema.parse(body);

    const link = await linkService.createLink({
      userId: session.user.id,
      originalUrl: data.originalUrl,
      customCode: data.customCode,
      title: data.title,
      description: data.description,
      isPublic: data.isPublic,
    });

    return NextResponse.json(link, { status: 201 });
  } catch (err: any) {
    console.error('Create link error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create link' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const links = await linkService.getUserLinks(session.user.id);
    return NextResponse.json(links);
  } catch (err: any) {
    console.error('Get links error:', err);
    return NextResponse.json({ error: 'Failed to fetch links' }, { status: 500 });
  }
}
