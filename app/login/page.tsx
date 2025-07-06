'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, RefreshCw, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const errorMessages = {
  config: {
    title: 'Erreur de configuration',
    message: 'La configuration de l\'application est incorrecte. Veuillez contacter l\'administrateur.',
    icon: XCircle,
    color: 'text-red-500'
  },
  ratelimit: {
    title: 'Trop de tentatives',
    message: 'Vous avez fait trop de tentatives de connexion. Veuillez attendre quelques minutes avant de réessayer.',
    icon: RefreshCw,
    color: 'text-yellow-500'
  },
  missing_params: {
    title: 'Paramètres manquants',
    message: 'Les paramètres d\'authentification Steam sont incomplets. Veuillez réessayer.',
    icon: AlertCircle,
    color: 'text-orange-500'
  },
  steam_unavailable: {
    title: 'Steam temporairement indisponible',
    message: 'Le service Steam est temporairement indisponible. Veuillez réessayer plus tard.',
    icon: AlertCircle,
    color: 'text-yellow-500'
  },
  invalid_verification: {
    title: 'Échec de la vérification',
    message: 'La vérification de votre compte Steam a échoué. Veuillez réessayer.',
    icon: XCircle,
    color: 'text-red-500'
  },
  nosteamid: {
    title: 'ID Steam introuvable',
    message: 'Impossible de récupérer votre ID Steam. Veuillez réessayer.',
    icon: XCircle,
    color: 'text-red-500'
  },
  internal: {
    title: 'Erreur interne',
    message: 'Une erreur interne s\'est produite. Veuillez réessayer.',
    icon: XCircle,
    color: 'text-red-500'
  }
};

export default function LoginPage() {
  const { t } = useTranslation('common');
  const searchParams = useSearchParams();
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  const error = searchParams.get('error');
  const errorInfo = error ? errorMessages[error as keyof typeof errorMessages] : null;

  const handleSteamLogin = () => {
    setIsRedirecting(true);
    window.location.href = '/api/auth/steam';
  };

  const handleRetry = () => {
    setIsRedirecting(false);
    handleSteamLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-opnskin-bg-primary via-opnskin-bg-secondary to-opnskin-bg-primary p-4">
      <Card className="w-full max-w-md bg-opnskin-bg-card/95 border-opnskin-bg-secondary backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <img
              src="/logo-OPNSKIN.png"
              alt="OPNSKIN"
              className="h-12 w-auto"
            />
          </div>
          <CardTitle className="text-2xl font-bold font-rajdhani text-opnskin-text-primary">
            {error ? 'Erreur de connexion' : 'Connexion Steam'}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {errorInfo ? (
            <Alert className="border-red-500/20 bg-red-500/10">
              <errorInfo.icon className={`h-4 w-4 ${errorInfo.color}`} />
              <AlertDescription className="text-opnskin-text-primary">
                <div className="font-semibold mb-1">{errorInfo.title}</div>
                <div className="text-sm text-opnskin-text-secondary">{errorInfo.message}</div>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-opnskin-text-secondary">
                Connectez-vous avec votre compte Steam pour accéder à votre profil et votre inventaire.
              </p>
              
              <div className="flex items-center justify-center gap-2 text-sm text-opnskin-text-secondary">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Connexion sécurisée</span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={error ? handleRetry : handleSteamLogin}
              disabled={isRedirecting}
              className="w-full btn-opnskin flex items-center justify-center gap-2"
            >
              {isRedirecting ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  Redirection...
                </>
              ) : (
                <>
                  <img
                    src="/icons8-steam-128.png"
                    alt="Steam"
                    className="w-6 h-6 object-contain"
                  />
                  {error ? 'Réessayer' : 'Se connecter avec Steam'}
                </>
              )}
            </Button>

            {error && (
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="w-full border-opnskin-bg-secondary text-opnskin-text-secondary hover:bg-opnskin-bg-secondary/20"
              >
                Retour à l'accueil
              </Button>
            )}
          </div>

          {!error && (
            <div className="text-xs text-opnskin-text-secondary text-center space-y-1">
              <p>En vous connectant, vous acceptez nos conditions d'utilisation</p>
              <p>Vos données Steam ne sont utilisées que pour l'authentification</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 