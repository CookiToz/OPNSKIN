'use client';

import { useAxeptio } from '@/hooks/use-axeptio';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Cookie, Settings } from 'lucide-react';

export const CookieBanner = () => {
  const { choices, isLoaded, openPreferences, isAccepted } = useAxeptio();

  if (!isLoaded) {
    return null; // Ne rien afficher tant qu'Axeptio n'est pas chargé
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-opnskin-bg-card border border-opnskin-bg-secondary rounded-lg p-4 shadow-lg max-w-sm">
        <div className="flex items-center gap-2 mb-3">
          <Cookie className="w-5 h-5 text-opnskin-accent" />
          <h3 className="font-semibold text-opnskin-text-primary">Préférences Cookies</h3>
        </div>
        
        {choices && (
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-opnskin-text-secondary">Analytics</span>
              <Badge variant={isAccepted('analytics') ? 'default' : 'secondary'}>
                {isAccepted('analytics') ? 'Activé' : 'Désactivé'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-opnskin-text-secondary">Publicités</span>
              <Badge variant={isAccepted('advertising') ? 'default' : 'secondary'}>
                {isAccepted('advertising') ? 'Activé' : 'Désactivé'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-opnskin-text-secondary">Cookies tiers</span>
              <Badge variant={isAccepted('third_party') ? 'default' : 'secondary'}>
                {isAccepted('third_party') ? 'Activé' : 'Désactivé'}
              </Badge>
            </div>
          </div>
        )}
        
        <Button 
          onClick={openPreferences}
          variant="outline" 
          size="sm"
          className="w-full"
        >
          <Settings className="w-4 h-4 mr-2" />
          Modifier les préférences
        </Button>
      </div>
    </div>
  );
};