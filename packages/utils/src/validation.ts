import { PriceValidationResult } from '@opnskin/types';

/**
 * Valide un email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valide une URL Steam Trade
 */
export const isValidSteamTradeUrl = (url: string): boolean => {
  return url.startsWith('https://steamcommunity.com/tradeoffer/new/');
};

/**
 * Valide un Steam ID
 */
export const isValidSteamId = (steamId: string): boolean => {
  const steamIdRegex = /^[0-9]{17}$/;
  return steamIdRegex.test(steamId);
};

/**
 * Valide un prix de vente
 */
export const validateSellingPrice = (
  price: number, 
  marketPrice?: number
): PriceValidationResult => {
  // Validation de base
  if (price <= 0) {
    return { isValid: false, message: 'Le prix doit être supérieur à 0' };
  }
  
  if (price > 10000) {
    return { isValid: false, message: 'Le prix ne peut pas dépasser 10 000€' };
  }
  
  // Si pas de prix de marché, validation basique
  if (!marketPrice) {
    if (price < 0.01) {
      return { isValid: false, message: 'Le prix minimum est de 0.01€' };
    }
    return { isValid: true };
  }
  
  // Validation basée sur le prix de marché
  const minPrice = marketPrice * 0.1; // 10% du prix de marché
  const maxPrice = marketPrice * 5; // 500% du prix de marché
  const warningThreshold = marketPrice * 2; // 200% du prix de marché
  
  if (price < minPrice) {
    return { 
      isValid: false, 
      message: `Le prix minimum est de ${minPrice.toFixed(2)}€ (10% du prix de marché)` 
    };
  }
  
  if (price > maxPrice) {
    return { 
      isValid: false, 
      message: `Le prix maximum est de ${maxPrice.toFixed(2)}€ (500% du prix de marché)` 
    };
  }
  
  if (price > warningThreshold) {
    return { 
      isValid: true, 
      warning: `Attention : votre prix est ${(price / marketPrice * 100).toFixed(0)}% du prix de marché` 
    };
  }
  
  return { isValid: true };
};

/**
 * Valide un nom de skin
 */
export const isValidSkinName = (name: string): boolean => {
  return name.length >= 3 && name.length <= 100;
};

/**
 * Valide une URL d'image
 */
export const isValidImageUrl = (url: string): boolean => {
  try {
    new URL(url);
    return url.match(/\.(jpg|jpeg|png|gif|webp)$/i) !== null;
  } catch {
    return false;
  }
};

/**
 * Valide un float value (0.0 - 1.0)
 */
export const isValidFloatValue = (float: number): boolean => {
  return float >= 0 && float <= 1;
}; 