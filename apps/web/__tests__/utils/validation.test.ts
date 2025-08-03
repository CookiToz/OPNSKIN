import { 
  isValidEmail, 
  isValidSteamTradeUrl, 
  isValidSteamId,
  validateSellingPrice,
  isValidSkinName,
  isValidImageUrl,
  isValidFloatValue
} from '@opnskin/utils';

describe('Validation Utils', () => {
  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('test+tag@example.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidSteamTradeUrl', () => {
    it('should validate correct Steam trade URLs', () => {
      expect(isValidSteamTradeUrl('https://steamcommunity.com/tradeoffer/new/?partner=123456789')).toBe(true);
      expect(isValidSteamTradeUrl('https://steamcommunity.com/tradeoffer/new/')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidSteamTradeUrl('https://example.com')).toBe(false);
      expect(isValidSteamTradeUrl('http://steamcommunity.com/tradeoffer/new/')).toBe(false);
      expect(isValidSteamTradeUrl('')).toBe(false);
    });
  });

  describe('isValidSteamId', () => {
    it('should validate correct Steam IDs', () => {
      expect(isValidSteamId('76561198012345678')).toBe(true);
      expect(isValidSteamId('76561198123456789')).toBe(true);
    });

    it('should reject invalid Steam IDs', () => {
      expect(isValidSteamId('123456789')).toBe(false);
      expect(isValidSteamId('7656119801234567')).toBe(false); // Too short
      expect(isValidSteamId('765611980123456789')).toBe(false); // Too long
      expect(isValidSteamId('')).toBe(false);
    });
  });

  describe('validateSellingPrice', () => {
    it('should validate correct prices', () => {
      expect(validateSellingPrice(10.50).isValid).toBe(true);
      expect(validateSellingPrice(0.01).isValid).toBe(true);
      expect(validateSellingPrice(10000).isValid).toBe(true);
    });

    it('should reject invalid prices', () => {
      expect(validateSellingPrice(0).isValid).toBe(false);
      expect(validateSellingPrice(-5).isValid).toBe(false);
      expect(validateSellingPrice(10001).isValid).toBe(false);
    });

    it('should validate prices against market price', () => {
      const marketPrice = 100;
      const result = validateSellingPrice(50, marketPrice);
      expect(result.isValid).toBe(true);
    });

    it('should warn for high prices', () => {
      const marketPrice = 100;
      const result = validateSellingPrice(250, marketPrice);
      expect(result.isValid).toBe(true);
      expect(result.warning).toBeDefined();
    });
  });

  describe('isValidSkinName', () => {
    it('should validate correct skin names', () => {
      expect(isValidSkinName('AK-47 | Redline')).toBe(true);
      expect(isValidSkinName('AWP | Dragon Lore')).toBe(true);
    });

    it('should reject invalid skin names', () => {
      expect(isValidSkinName('AB')).toBe(false); // Too short
      expect(isValidSkinName('A'.repeat(101))).toBe(false); // Too long
      expect(isValidSkinName('')).toBe(false);
    });
  });

  describe('isValidImageUrl', () => {
    it('should validate correct image URLs', () => {
      expect(isValidImageUrl('https://example.com/image.jpg')).toBe(true);
      expect(isValidImageUrl('https://example.com/image.png')).toBe(true);
      expect(isValidImageUrl('https://example.com/image.webp')).toBe(true);
    });

    it('should reject invalid image URLs', () => {
      expect(isValidImageUrl('https://example.com/image.txt')).toBe(false);
      expect(isValidImageUrl('not-a-url')).toBe(false);
      expect(isValidImageUrl('')).toBe(false);
    });
  });

  describe('isValidFloatValue', () => {
    it('should validate correct float values', () => {
      expect(isValidFloatValue(0.0)).toBe(true);
      expect(isValidFloatValue(0.5)).toBe(true);
      expect(isValidFloatValue(1.0)).toBe(true);
    });

    it('should reject invalid float values', () => {
      expect(isValidFloatValue(-0.1)).toBe(false);
      expect(isValidFloatValue(1.1)).toBe(false);
      expect(isValidFloatValue(2)).toBe(false);
    });
  });
}); 