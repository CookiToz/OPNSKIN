export type User = {
  id?: string;
  loggedIn: boolean;
  steamId?: string;
  name?: string;
  avatar?: string;
  profileUrl?: string;
  tradeUrl?: string;
  walletBalance?: number;
  offersCount?: number;
  transactionsCount?: number;
  unreadNotificationsCount?: number;
  isAdmin?: boolean;
  createdAt?: string;
  lastSeen?: string;
};

export type UserContextType = {
  user: User | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}; 