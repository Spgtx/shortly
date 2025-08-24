'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { UrlShortenerForm } from '@/components/url-shortener-form';
import { LinksTable } from '@/components/links-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link as LinkIcon, BarChart3, Eye, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import type { Link } from '@/lib/schema';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLinks: 0,
    totalClicks: 0,
    recentClicks: 0,
  });

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      // If no session, redirect to login (or home)
      router.replace('/');
      return;
    }

    // Fetch links only if session exists
    fetchLinks();
  }, [session, status]);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/links');
      if (!response.ok) throw new Error('Failed to fetch links');
      const data = await response.json();
      setLinks(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load links');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    try {
      const response = await fetch(`/api/links/${linkId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setLinks(links.filter(link => link.id !== linkId));
        toast.success('Link deleted successfully');
      } else {
        throw new Error('Failed to delete link');
      }
    } catch (error) {
      console.error('Delete link error:', error);
      toast.error('Failed to delete link');
    }
  };

  if (status === 'loading' || !session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your links and view analytics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Links</CardTitle>
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLinks}</div>
            <p className="text-xs text-muted-foreground">
              Links created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClicks}</div>
            <p className="text-xs text-muted-foreground">
              All time clicks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentClicks}</div>
            <p className="text-xs text-muted-foreground">
              Last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Create New Link */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <UrlShortenerForm showAdvanced={true} />
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Tips for getting the most out of Shortly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Custom Short Codes</h4>
              <p className="text-sm text-muted-foreground">
                Create memorable links by using custom short codes instead of random ones.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Public Links</h4>
              <p className="text-sm text-muted-foreground">
                Enable public visibility to show your links on your link-in-bio page.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Analytics</h4>
              <p className="text-sm text-muted-foreground">
                Click the analytics icon on any link to see detailed click statistics and charts.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Links Table */}
      {loading ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading your links...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <LinksTable links={links} onDeleteLink={handleDeleteLink} />
      )}
    </div>
  );
}