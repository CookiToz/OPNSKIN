export type Transaction = {
  id: string;
  buyerId: string;
  sellerId: string;
  offerId: string;
  status: 'PENDING' | 'IN_ESCROW' | 'RELEASED' | 'REFUNDED' | 'CANCELLED';
  amount: number;
  currency: string;
  startedAt: string;
  completedAt?: string;
  buyer: {
    id: string;
    name?: string;
    steamId: string;
  };
  seller: {
    id: string;
    name?: string;
    steamId: string;
  };
  offer: {
    id: string;
    itemName: string;
    itemImage: string;
    price: number;
  };
};

export type CartItem = {
  id: string;
  userId: string;
  offerId: string;
  addedAt: string;
  offer: {
    id: string;
    itemName: string;
    itemImage: string;
    price: number;
    seller: {
      id: string;
      name?: string;
      steamId: string;
    };
  };
};

export type Currency = 'EUR' | 'USD' | 'GBP' | 'RUB' | 'CNY' | 'ETH' | 'BTC' | 'SOL' | 'XRP' | 'LTC' | 'TRX';

export type CryptoRate = {
  [key in Currency]?: number;
};

export type PriceValidationResult = {
  isValid: boolean;
  message?: string;
  warning?: string;
}; 