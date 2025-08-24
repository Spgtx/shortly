import { db } from '../db';
import { links, clicks } from '../schema';
import { eq, desc, and, sql, gte, lte } from 'drizzle-orm';
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
    
    // Ensure unique short code
    let attempts = 0;
    while (attempts < 5) {
      const existing = await this.dbClient.query.links.findFirst({
        where: eq(links.shortCode, shortCode),
      });
      
      if (!existing) break;
      
      if (data.customCode) {
        throw new Error('Custom code already exists');
      }
      
      shortCode = generateShortCode();
      attempts++;
    }

    const [link] = await this.dbClient
    .insert(links)
    .values({
      userId: data.userId,
      originalUrl: normalizedUrl,
      shortCode,
      title: data.title,
      description: data.description,
      isPublic: data.isPublic || false,
    })
    .returning();

    await setCachedUrl(shortCode, normalizedUrl);
    
    return link ?? null;
  }

  async getLink(shortCode: string): Promise<Link | null> {
    const link = await this.dbClient.query.links.findFirst({
      where: eq(links.shortCode, shortCode),
    });
    return link ?? null;
  }

  async getLinkWithCache(shortCode: string): Promise<string | null> {
    const cachedUrl = await getCachedUrl(shortCode);
    if (cachedUrl) {
      return cachedUrl;
    }

    const link = await this.getLink(shortCode);
    if (!link) {
      return null;
    }

    await setCachedUrl(shortCode, link.originalUrl);
    return link.originalUrl;
  }

  async getUserLinks(userId: string): Promise<Link[]> {
    return await this.dbClient.query.links.findMany({
      where: eq(links.userId, userId),
      orderBy: [desc(links.createdAt)],
    });
  }

  async getPublicLinks(userId: string): Promise<Link[]> {
    return await this.dbClient.query.links.findMany({
      where: and(eq(links.userId, userId), eq(links.isPublic, true)),
      orderBy: [desc(links.createdAt)],
    });
  }

  async updateClickCount(linkId: string): Promise<void> {
    await this.dbClient.update(links)
      .set({ 
        clickCount: sql`${links.clickCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(links.id, linkId));
  }

  async deleteLink(linkId: string, userId: string): Promise<boolean> {
    const result = await this.dbClient.delete(links)
      .where(and(eq(links.id, linkId), eq(links.userId, userId)))
      .returning();
    
    return result.length > 0;
  }
}

export const linkService = new LinkService();