export type GameType = {
  key: string;
  name: string;
  cover: string;
  appid: number;
};

export type InventoryItem = {
  id: string;
  name: string;
  icon: string;
  marketPrice?: number;
  rarityCode?: string;
};

export type InventoryByGameProps = {
  game: GameType;
  onBack?: () => void;
};

export type FilterState = {
  search: string;
  rarity: string[];
  wear: string[];
  type: string[];
  priceRange: [number, number];
  showStatTrak: boolean;
  showNonStatTrak: boolean;
};

export type PriceValidationResult = {
  isValid: boolean;
  message?: string;
  warning?: string;
}; 