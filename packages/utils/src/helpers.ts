import { InventoryItem, RarityLevel, WearLevel } from '@opnskin/types';

/**
 * Mapping des codes de rareté vers les clés de traduction
 */
export const rarityKeyMap: Record<string, RarityLevel> = {
  'Rarity_Common_Weapon': 'consumer',
  'Rarity_Uncommon_Weapon': 'industrial',
  'Rarity_Rare_Weapon': 'milspec',
  'Rarity_Mythical_Weapon': 'restricted',
  'Rarity_Legendary_Weapon': 'classified',
  'Rarity_Ancient_Weapon': 'covert',
  'Rarity_Immortal_Weapon': 'exceedingly_rare',
};

/**
 * Extrait l'état de l'arme du nom
 */
export const getWeaponWear = (name: string): WearLevel | '' => {
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

/**
 * Détermine si un skin est StatTrak
 */
export const isStatTrak = (name: string): boolean => {
  const statTrakKeywords = ['stattrak', 'stat trak', 'stat-trak', 'statrak', 'st'];
  const nameLower = name.toLowerCase();
  return statTrakKeywords.some(keyword => nameLower.includes(keyword));
};

/**
 * Génère une couleur basée sur la rareté
 */
export const getRarityColor = (rarity: RarityLevel): string => {
  const colors: Record<RarityLevel, string> = {
    consumer: 'text-gray-500',
    industrial: 'text-blue-500',
    milspec: 'text-green-500',
    restricted: 'text-purple-500',
    classified: 'text-pink-500',
    covert: 'text-red-500',
    exceedingly_rare: 'text-yellow-500',
  };
  return colors[rarity] || 'text-gray-500';
};

/**
 * Débounce une fonction
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle une fonction
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Génère un ID unique
 */
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Retourne la classe CSS pour un élément actif
 */
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
}; 