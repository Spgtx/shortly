import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ExternalLink, User } from 'lucide-react';
import { db } from '@/lib/db';
import { users, links } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

interface LinkInBioPageProps {
  params: {
    username: string;
  };
}

export default async function LinkInBioPage({ params }: LinkInBioPageProps) {
  const { username } = params;

  try {
    // Find user by username
    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
    });

    if (!user) {
      notFound();
    }

    // Get public links for this user
    const publicLinks = await db.query.links.findMany({
      where: and(eq(links.userId, user.id), eq(links.isPublic, true)),
      orderBy: (links, { desc }) => [desc(links.createdAt)],
    });

    return (
      <div className="max-w-2xl mx-auto space-y-8">
        {/* User Profile */}
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.image || undefined} alt={user.name || ''} />
                <AvatarFallback>
                  <User className="h-10 w-10" />
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-2xl">{user.name || 'Anonymous User'}</CardTitle>
            <CardDescription>@{username}</CardDescription>
          </CardHeader>
        </Card>

        {/* Public Links */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-center">Links</h2>
          
          {publicLinks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No public links to display</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {publicLinks.map((link) => (
                <Card key={link.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">
                          {link.title || 'Untitled Link'}
                        </h3>
                        {link.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {link.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {link.clickCount} clicks
                        </p>
                      </div>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="ml-4 flex-shrink-0"
                      >
                        <a
                          href={`/r/${link.shortCode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Link-in-bio page error:', error);
    notFound();
  }
}

export function generateMetadata({ params }: LinkInBioPageProps) {
  return {
    title: `@${params.username} - Shortly Links`,
    description: `View public links shared by @${params.username}`,
  };
}