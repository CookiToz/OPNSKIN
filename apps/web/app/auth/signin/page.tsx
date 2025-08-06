'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { LogIn, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SignInPage() {
  const { t, ready } = useTranslation('common');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await signIn('google', { 
        callbackUrl: '/',
        redirect: false 
      });
      
      if (result?.error) {
        setError('Erreur lors de la connexion avec Google');
        console.error('Google sign in error:', result.error);
      } else if (result?.ok) {
        router.push('/');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError('Erreur lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSteamSignIn = () => {
    window.location.href = '/api/auth/steam';
  };

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-opnskin-bg-primary flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-opnskin-bg-card border-opnskin-bg-secondary">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-opnskin-text-primary">
            {t('auth.connect_account')}
          </CardTitle>
          <p className="text-opnskin-text-secondary">
            Choisissez votre méthode de connexion
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          <div className="space-y-3">
            {/* Connexion Steam */}
            <Button
              onClick={handleSteamSignIn}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 flex items-center gap-3"
            >
              <img
                src="/icons8-steam-128.png"
                alt="Steam"
                className="w-6 h-6 object-contain"
              />
              <span>Se connecter avec Steam</span>
            </Button>
            
            {/* Connexion Google */}
            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-white hover:bg-gray-50 text-gray-900 flex items-center gap-3"
            >
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <span>Se connecter avec Google</span>
            </Button>
          </div>
          
          <div className="text-center pt-4">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-opnskin-text-secondary hover:text-opnskin-text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à l'accueil
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 