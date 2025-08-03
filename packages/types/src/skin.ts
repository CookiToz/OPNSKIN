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
  floatValue?: number;
  wear?: string;
  category?: string;
};

export type SkinCardProps = {
  item: InventoryItem;
  onSell?: () => void;
  onDetails?: () => void;
  floatValue?: number;
  showPrice?: boolean;
  showActions?: boolean;
};

export type Offer = {
  id: string;
  sellerId: string;
  itemId: string;
  itemName: string;
  itemImage: string;
  rarityCode?: string;
  game: string;
  price: number;
  status: 'AVAILABLE' | 'PENDING_TRADE_OFFER' | 'COMPLETED' | 'EXPIRED';
  createdAt: string;
  updatedAt: string;
  seller: {
    id: string;
    name?: string;
    steamId: string;
  };
};

export type RarityLevel = 
  | 'consumer'
  | 'industrial' 
  | 'milspec'
  | 'restricted'
  | 'classified'
  | 'covert'
  | 'exceedingly_rare';

export type WearLevel = 
  | 'wear_factory_new'
  | 'wear_minimal_wear'
  | 'wear_field_tested'
  | 'wear_well_worn'
  | 'wear_battle_scarred'; 