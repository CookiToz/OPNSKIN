'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'OAuthSignin':
        return 'Erreur lors de la connexion OAuth. Veuillez réessayer.';
      case 'OAuthCallback':
        return 'Erreur lors du callback OAuth. Veuillez réessayer.';
      case 'OAuthCreateAccount':
        return 'Erreur lors de la création du compte. Veuillez réessayer.';
      case 'EmailCreateAccount':
        return 'Erreur lors de la création du compte email. Veuillez réessayer.';
      case 'Callback':
        return 'Erreur lors du callback. Veuillez réessayer.';
      case 'OAuthAccountNotLinked':
        return 'Ce compte est déjà lié à un autre utilisateur.';
      case 'EmailSignin':
        return 'Erreur lors de la connexion par email. Veuillez réessayer.';
      case 'CredentialsSignin':
        return 'Identifiants incorrects. Veuillez réessayer.';
      case 'SessionRequired':
        return 'Session requise. Veuillez vous connecter.';
      case 'Default':
      default:
        return 'Une erreur inattendue s\'est produite. Veuillez réessayer.';
    }
  };

  return (
    <div className="min-h-screen bg-opnskin-bg-primary flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-opnskin-bg-card border-opnskin-bg-secondary">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-opnskin-text-primary">
            Erreur de Connexion
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">
              {getErrorMessage(error)}
            </p>
          </div>
          
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/auth/signin">
                Réessayer la connexion
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à l'accueil
              </Link>
            </Button>
          </div>
          
          {error && (
            <div className="text-center pt-4">
              <p className="text-xs text-opnskin-text-secondary">
                Code d'erreur: {error}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 