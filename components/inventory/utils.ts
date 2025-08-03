import { InventoryItem, PriceValidationResult } from './types';

// Mapping des codes de rareté vers les clés de traduction
export const rarityKeyMap: Record<string, string> = {
  'Rarity_Common_Weapon': 'rarity_consumer',
  'Rarity_Uncommon_Weapon': 'rarity_industrial',
  'Rarity_Rare_Weapon': 'rarity_milspec',
  'Rarity_Mythical_Weapon': 'rarity_restricted',
  'Rarity_Legendary_Weapon': 'rarity_classified',
  'Rarity_Ancient_Weapon': 'rarity_covert',
  'Rarity_Immortal_Weapon': 'rarity_exceedingly_rare',
};

/**
 * Extrait l'état de l'arme du nom
 */
export const getWeaponWear = (name: string): string => {
  if (name.includes('Factory New')) return 'wear_factory_new';
  if (name.includes('Minimal Wear')) return 'wear_minimal_wear';
  if (name.includes('Field-Tested')) return 'wear_field_tested';
  if (name.includes('Well-Worn')) return 'wear_well_worn';
  if (name.includes('Battle-Scarred')) return 'wear_battle_scarred';
  return '';
};

/**
 * Extrait la catégorie d'arme du nom
 */
export const getWeaponCategory = (name: string): string => {
  const weaponTypes = {
    'AK': 'AK-47',
    'M4A1': 'M4A1',
    'M4A4': 'M4A4',
    'AWP': 'AWP',
    'Glock': 'Glock',
    'USP': 'USP',
    'P250': 'P250',
    'Deagle': 'Desert Eagle',
    'MP7': 'MP7',
    'P90': 'P90',
    'Nova': 'Nova',
    'XM1014': 'XM1014',
    'MAG': 'MAG-7',
    'Negev': 'Negev',
  };
  
  for (const [key, value] of Object.entries(weaponTypes)) {
    if (name.includes(key)) return value;
  }
  return 'Arme';
};

/**
 * Valide le prix de vente d'un item
 */
export const validatePrice = (price: number, marketPrice?: number): PriceValidationResult => {
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
 * Détermine si un skin est rare
 */
export const isRareSkin = (item: InventoryItem | null): boolean => {
  if (!item || !item.name) return false;
  
  const rareKeywords = [
    'blue gem', 'dragon lore', 'howl', 'fire serpent', 'souvenir',
    'stattrak', 'stat trak', 'stat-trak', 'statrak', 'st', 'stat'
  ];
  
  const itemNameLower = item.name.toLowerCase();
  return rareKeywords.some(keyword => itemNameLower.includes(keyword));
}; 