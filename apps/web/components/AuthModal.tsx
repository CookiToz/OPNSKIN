'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { signIn, signOut, useSession } from 'next-auth/react';
import { LogIn, X, Shield, AlertCircle } from 'lucide-react';
import { useUser } from '@/components/UserProvider';

interface AuthModalProps {
  children: React.ReactNode;
}

export default function AuthModal({ children }: AuthModalProps) {
  const { t, ready } = useTranslation('common');
  const { data: session, status } = useSession();
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSteamLogin = async () => {
    setIsLoading(true);
    try {
      window.location.href = '/api/auth/steam';
    } catch (error) {
      console.error('Steam login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signIn('google', { callbackUrl: '/' });
    } catch (error) {
      console.error('Google login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut({ callbackUrl: '/' });
      // Supprimer le cookie Steam si présent
      document.cookie = 'steamid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isAuthenticated = session || user?.loggedIn;

  if (!ready) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-opnskin-bg-card border-opnskin-bg-secondary">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-opnskin-text-primary">
            {isAuthenticated ? t('auth.account_management') : t('auth.connect_account')}
          </DialogTitle>
        </DialogHeader>

        {isAuthenticated ? (
          <div className="space-y-4">
            {/* Informations du compte */}
            <Card className="bg-opnskin-bg-secondary border-opnskin-bg-secondary">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={session?.user?.image || user?.avatar || '/placeholder.svg'}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h3 className="font-bold text-opnskin-text-primary">
                      {session?.user?.name || user?.name || t('auth.unknown_user')}
                    </h3>
                    <p className="text-sm text-opnskin-text-secondary">
                      {session?.user?.email || user?.steamId || t('auth.no_email')}
                    </p>
                  </div>
                </div>
                
                {/* Badges de connexion */}
                <div className="flex gap-2">
                  {session && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Google
                    </Badge>
                  )}
                  {user?.loggedIn && (
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      Steam
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Avertissement pour les utilisateurs Google uniquement */}
            {session && !user?.loggedIn && (
              <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-400 mb-1">
                    {t('auth.google_only_warning_title')}
                  </p>
                  <p className="text-yellow-300">
                    {t('auth.google_only_warning_desc')}
                  </p>
                </div>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex gap-2">
              {!user?.loggedIn && (
                <Button 
                  onClick={handleSteamLogin}
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? t('auth.connecting') : t('auth.link_steam')}
                </Button>
              )}
              <Button 
                onClick={handleLogout}
                disabled={isLoading}
                variant="outline"
                className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                {isLoading ? t('auth.disconnecting') : t('auth.disconnect')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Options de connexion */}
            <div className="grid gap-3">
              <Card 
                className="bg-opnskin-bg-secondary border-opnskin-bg-secondary hover:border-opnskin-primary/30 cursor-pointer transition-colors"
                onClick={handleSteamLogin}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src="/icons8-steam-128.png"
                      alt="Steam"
                      className="w-8 h-8"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-opnskin-text-primary">
                        {t('auth.connect_with_steam')}
                      </h3>
                      <p className="text-sm text-opnskin-text-secondary">
                        {t('auth.steam_desc')}
                      </p>
                    </div>
                    <Shield className="w-5 h-5 text-opnskin-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="bg-opnskin-bg-secondary border-opnskin-bg-secondary hover:border-opnskin-primary/30 cursor-pointer transition-colors"
                onClick={handleGoogleLogin}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-opnskin-text-primary">
                        {t('auth.connect_with_google')}
                      </h3>
                      <p className="text-sm text-opnskin-text-secondary">
                        {t('auth.google_desc')}
                      </p>
                    </div>
                    <LogIn className="w-5 h-5 text-opnskin-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Informations de sécurité */}
            <div className="text-xs text-opnskin-text-secondary text-center">
              {t('auth.security_info')}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 