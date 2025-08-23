'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Copy, BarChart3, Trash2, ExternalLink, Eye } from 'lucide-react';
import { toast } from 'sonner';
import type { Link } from '@/lib/schema';
import { LinkAnalytics } from './link-analytics';

interface LinksTableProps {
  links: Link[];
  onDeleteLink: (id: string) => void;
}

export function LinksTable({ links, onDeleteLink }: LinksTableProps) {
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);

  const copyToClipboard = async (shortCode: string) => {
    try {
      const shortUrl = `${window.location.origin}/r/${shortCode}`;
      await navigator.clipboard.writeText(shortUrl);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const truncateUrl = (url: string, maxLength = 50) => {
    return url.length > maxLength ? `${url.substring(0, maxLength)}...` : url;
  };

  if (selectedLink) {
    return (
      <LinkAnalytics 
        link={selectedLink} 
        onBack={() => setSelectedLink(null)} 
      />
    );
  }

  if (links.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Links</CardTitle>
          <CardDescription>No links created yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Create your first short link using the form above
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Your Links
        </CardTitle>
        <CardDescription>
          Manage and track your shortened links
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Short Code</TableHead>
              <TableHead>Original URL</TableHead>
              <TableHead>Clicks</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {links.map((link) => (
              <TableRow key={link.id}>
                <TableCell className="font-medium">
                  {link.title || 'Untitled'}
                </TableCell>
                <TableCell>
                  <code className="bg-muted px-2 py-1 rounded text-sm">
                    {link.shortCode}
                  </code>
                </TableCell>
                <TableCell>
                  <a
                    href={link.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {truncateUrl(link.originalUrl)}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </TableCell>
                <TableCell>
                  <span className="font-mono">{link.clickCount}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={link.isPublic ? 'default' : 'secondary'}>
                    {link.isPublic ? 'Public' : 'Private'}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(link.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(link.shortCode)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedLink(link)}
                    >
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Link</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this link? This action
                            cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDeleteLink(link.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}