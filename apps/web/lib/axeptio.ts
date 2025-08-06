// Types pour Axeptio
declare global {
  interface Window {
    axeptioSettings: {
      clientId: string;
      cookiesVersion: string;
      googleConsentMode: {
        default: {
          analytics_storage: string;
          ad_storage: string;
          ad_user_data: string;
          ad_personalization: string;
          wait_for_update: number;
        };
      };
    };
    openAxeptioCookies: () => void;
  }
}

// Configuration Axeptio
export const axeptioConfig = {
  clientId: "689390aba5e74449ee8b9c58",
  cookiesVersion: "opnskin-fr-EU",
  googleConsentMode: {
    default: {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      wait_for_update: 500
    }
  }
};

// Fonction pour ouvrir les préférences de cookies
export const openAxeptioCookies = () => {
  if (typeof window !== 'undefined' && window.openAxeptioCookies) {
    window.openAxeptioCookies();
  }
};

// Fonction pour initialiser Axeptio
export const initAxeptio = () => {
  if (typeof window !== 'undefined') {
    window.axeptioSettings = axeptioConfig;
    
    // Script Axeptio
    const script = document.createElement('script');
    script.async = true;
    script.src = '//static.axept.io/sdk.js';
    document.head.appendChild(script);
  }
}; 