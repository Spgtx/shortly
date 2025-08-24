import { db } from '../db';
import { clicks, links } from '../schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import type { Click } from '../schema';

export interface ClickData {
  linkId: string;
  userAgent?: string;
  referer?: string;
  ipAddress?: string;
  country?: string;
  city?: string;
}

export interface DailyStats {
  date: string;
  clicks: number;
}

export class AnalyticsService {
  constructor(private dbClient = db) {}

  async logClick(data: ClickData): Promise<void> {
    await this.dbClient.insert(clicks).values({
      linkId: data.linkId,
      userAgent: data.userAgent,
      referer: data.referer,
      ipAddress: data.ipAddress,
      country: data.country,
      city: data.city,
    });
  }

  async getLinkAnalytics(linkId: string, userId: string): Promise<{
    totalClicks: number;
    dailyStats: DailyStats[];
    recentClicks: Click[];
  }> {
    // Verify user owns the link
    const link = await this.dbClient.query.links.findFirst({
      where: and(eq(links.id, linkId), eq(links.userId, userId)),
    });

    if (!link) {
      throw new Error('Link not found or access denied');
    }

    // Get total clicks
    const [{ totalClicks }] = await this.dbClient.select({
      totalClicks: sql<number>`count(*)::int`,
    }).from(clicks).where(eq(clicks.linkId, linkId));

    // Get daily stats for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyStats = await this.dbClient.select({
      date: sql<string>`date(clicked_at)`,
      clicks: sql<number>`count(*)::int`,
    }).from(clicks)
      .where(and(
        eq(clicks.linkId, linkId),
        gte(clicks.clickedAt, thirtyDaysAgo)
      ))
      .groupBy(sql`date(clicked_at)`)
      .orderBy(sql`date(clicked_at)`);

    // Get recent clicks
    const recentClicks = await this.dbClient.query.clicks.findMany({
      where: eq(clicks.linkId, linkId),
      orderBy: sql`clicked_at desc`,
      limit: 10,
    });

    return {
      totalClicks: totalClicks || 0,
      dailyStats: dailyStats || [],
      recentClicks: recentClicks.map(c => ({
        id: c.id,
        linkId: c.linkId,
        userAgent: c.userAgent,
        referer: c.referer,
        ipAddress: c.ipAddress,
        country: c.country,
        city: c.city,
        clickedAt: c.clickedAt,
      })),
    };
  }

  async getUserAnalytics(userId: string): Promise<{
    totalLinks: number;
    totalClicks: number;
    recentClicks: Click[];
  }> {
    const [{ totalLinks }] = await this.dbClient.select({
      totalLinks: sql<number>`count(*)::int`,
    }).from(links).where(eq(links.userId, userId));

    const [{ totalClicks }] = await this.dbClient.select({
      totalClicks: sql<number>`coalesce(sum(click_count), 0)::int`,
    }).from(links).where(eq(links.userId, userId));

    const recentClicks = await this.dbClient.select()
      .from(clicks)
      .innerJoin(links, eq(clicks.linkId, links.id))
      .where(eq(links.userId, userId))
      .orderBy(sql`clicks.clicked_at desc`)
      .limit(20);

    return {
      totalLinks: totalLinks || 0,
      totalClicks: totalClicks || 0,
      recentClicks: recentClicks.map(r => r.clicks),
    };
  }
}

export const analyticsService = new AnalyticsService();