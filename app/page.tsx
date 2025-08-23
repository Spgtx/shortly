import { UrlShortenerForm } from '@/components/url-shortener-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, Zap, BarChart3, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
            Shorten URLs with
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Analytics & Style
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Create short, memorable links with powerful analytics. Track clicks, 
            understand your audience, and optimize your content strategy.
          </p>
        </div>
        
        <UrlShortenerForm />
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="text-center border-2 hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Zap className="h-6 w-6 text-blue-500" />
            </div>
            <CardTitle className="text-lg">Lightning Fast</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Instant URL shortening with Redis caching for ultra-fast redirects
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="text-center border-2 hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-purple-500" />
            </div>
            <CardTitle className="text-lg">Detailed Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Track clicks, view time-series charts, and understand your audience
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="text-center border-2 hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Link className="h-6 w-6 text-green-500" />
            </div>
            <CardTitle className="text-lg">Custom Links</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Create branded short links with custom codes and descriptions
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="text-center border-2 hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-orange-500" />
            </div>
            <CardTitle className="text-lg">Secure & Private</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Enterprise-grade security with optional private links and user authentication
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
        <p className="text-muted-foreground mb-6 text-lg">
          Sign in to access advanced features like custom links, analytics dashboard, and link-in-bio pages.
        </p>
      </div>
    </div>
  );
}