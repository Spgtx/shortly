import { db } from '../db';
import { links } from '../schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { getCachedUrl, setCachedUrl } from '../redis';
import { generateShortCode, normalizeUrl } from '../utils/url';
import type { Link } from '../schema';

export class LinkService {
  constructor(private dbClient = db) {}

  async createLink(data: {
    userId?: string;
    originalUrl: string;
    customCode?: string;
    title?: string;
    description?: string;
    isPublic?: boolean;
  }): Promise<Link> {
    const normalizedUrl = normalizeUrl(data.originalUrl);
    let shortCode = data.customCode || generateShortCode();

    let attempts = 0;
    while (attempts < 5) {
      const existing = await this.dbClient.query.links.findFirst({
        where: eq(links.shortCode, shortCode),
      });
      if (!existing) break;

      if (data.customCode) throw new Error('Custom code already exists');
      shortCode = generateShortCode();
      attempts++;
    }

    const [link] = await this.dbClient
      .insert(links)
      .values({
        userId: data.userId || null,
        originalUrl: normalizedUrl,
        shortCode,
        title: data.title,
        description: data.description,
        isPublic: data.isPublic ?? false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    await setCachedUrl(shortCode, normalizedUrl);

    return link!;
  }

  async getLink(shortCode: string): Promise<Link | null> {
    return (
      await this.dbClient.query.links.findFirst({
        where: eq(links.shortCode, shortCode),
      })
    ) ?? null;
  }

  async getLinkWithCache(shortCode: string): Promise<string | null> {
    const cached = await getCachedUrl(shortCode);
    if (cached) return cached;

    const link = await this.getLink(shortCode);
    if (!link) return null;

    await setCachedUrl(shortCode, link.originalUrl);
    return link.originalUrl;
  }

  async getUserLinks(userId: string): Promise<Link[]> {
    return this.dbClient.query.links.findMany({
      where: eq(links.userId, userId),
      orderBy: [desc(links.createdAt)],
    });
  }

  async updateClickCount(linkId: string): Promise<void> {
    await this.dbClient
      .update(links)
      .set({ clickCount: sql`${links.clickCount} + 1`, updatedAt: new Date() })
      .where(eq(links.id, linkId));
  }

  async deleteLink(linkId: string, userId: string): Promise<boolean> {
    const result = await this.dbClient
      .delete(links)
      .where(and(eq(links.id, linkId), eq(links.userId, userId)))
      .returning();

    return result.length > 0;
  }
}

export const linkService = new LinkService();
