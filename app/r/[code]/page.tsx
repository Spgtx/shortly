import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface RedirectPageProps {
  params: {
    code: string;
  };
}

export default function RedirectPage({ params }: RedirectPageProps) {
  const router = useRouter();

  useEffect(() => {
    router.push(`/api/r/${params.code}`);
  }, [params.code, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-2">Redirecting...</h1>
      <p className="text-gray-600">Hang tight! You’re being sent to your destination.</p>
    </div>
  );
}
