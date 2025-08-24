'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Link, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface UrlShortenerFormProps {
  showAdvanced?: boolean;
}

export function UrlShortenerForm({ showAdvanced = false }: UrlShortenerFormProps) {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shortUrl, setShortUrl] = useState('');
  const { data: session } = useSession();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          originalUrl,
          customCode: customCode || undefined,
          title: title || undefined,
          description: description || undefined,
          isPublic,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to shorten URL');
      }

      const link = await response.json();
      const generatedShortUrl = `${window.location.origin}/r/${link.shortCode}`;
      setShortUrl(generatedShortUrl);
      
      toast.success('URL shortened successfully!');
      
      // Reset form
      setOriginalUrl('');
      setCustomCode('');
      setTitle('');
      setDescription('');
      setIsPublic(false);

      if (showAdvanced && session) {
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to shorten URL');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const resetForm = () => {
    setShortUrl('');
    setOriginalUrl('');
    setCustomCode('');
    setTitle('');
    setDescription('');
    setIsPublic(false);
  };

  if (shortUrl && !showAdvanced) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Your Short URL
          </CardTitle>
          <CardDescription>Your URL has been shortened successfully!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input value={shortUrl} readOnly className="flex-1" />
            <Button onClick={copyToClipboard} size="sm">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={resetForm} variant="outline" className="w-full">
            Shorten Another URL
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5" />
          Shorten URL
        </CardTitle>
        <CardDescription>
          Create a short link that redirects to your original URL
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="originalUrl">Original URL</Label>
            <Input
              id="originalUrl"
              type="url"
              placeholder="https://example.com/very-long-url"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              required
            />
          </div>

          {showAdvanced && session && (
            <>
              <div className="space-y-2">
                <Label htmlFor="customCode">Custom Short Code (Optional)</Label>
                <Input
                  id="customCode"
                  placeholder="my-custom-link"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title (Optional)</Label>
                <Input
                  id="title"
                  placeholder="My Awesome Link"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="A brief description of this link"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isPublic">Make Public</Label>
                <Switch
                  id="isPublic"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
              </div>
            </>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Shorten URL
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}