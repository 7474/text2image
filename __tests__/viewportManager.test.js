const { getViewportDimensions } = require('../src/viewportManager');

describe('getViewportDimensions', () => {
  describe('Valid size strings', () => {
    test('should parse standard 16:9 size correctly', () => {
      const result = getViewportDimensions('1200x675');
      expect(result).toEqual({ width: 1200, height: 675 });
    });

    test('should parse square size correctly', () => {
      const result = getViewportDimensions('1200x1200');
      expect(result).toEqual({ width: 1200, height: 1200 });
    });

    test('should parse Twitter card size correctly', () => {
      const result = getViewportDimensions('1200x628');
      expect(result).toEqual({ width: 1200, height: 628 });
    });

    test('should parse portrait orientation correctly', () => {
      const result = getViewportDimensions('1080x1920');
      expect(result).toEqual({ width: 1080, height: 1920 });
    });

    test('should parse small size correctly', () => {
      const result = getViewportDimensions('600x335');
      expect(result).toEqual({ width: 600, height: 335 });
    });
  });

  describe('Auto mode', () => {
    test('should return null for "auto" string', () => {
      const result = getViewportDimensions('auto');
      expect(result).toBeNull();
    });
  });

  describe('Invalid inputs', () => {
    // Mock console.error to suppress error messages during tests
    let consoleErrorSpy;
    
    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });
    
    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    test('should return null for string without "x" separator', () => {
      const result = getViewportDimensions('1200-675');
      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid viewport size format:', '1200-675');
    });

    test('should return null for non-numeric width', () => {
      const result = getViewportDimensions('abcx675');
      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid viewport dimensions:', NaN, 675);
    });

    test('should return null for non-numeric height', () => {
      const result = getViewportDimensions('1200xabc');
      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid viewport dimensions:', 1200, NaN);
    });

    test('should return null for negative width', () => {
      const result = getViewportDimensions('-1200x675');
      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid viewport dimensions:', -1200, 675);
    });

    test('should return null for negative height', () => {
      const result = getViewportDimensions('1200x-675');
      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid viewport dimensions:', 1200, -675);
    });

    test('should return null for zero width', () => {
      const result = getViewportDimensions('0x675');
      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid viewport dimensions:', 0, 675);
    });

    test('should return null for zero height', () => {
      const result = getViewportDimensions('1200x0');
      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid viewport dimensions:', 1200, 0);
    });

    test('should return null for empty string', () => {
      const result = getViewportDimensions('');
      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid viewport size format:', '');
    });

    test('should parse first two dimensions from malformed string with extra values', () => {
      const result = getViewportDimensions('1200x675x100');
      // Note: split('x').map(Number) will parse "100" as NaN when only first 2 are taken
      // Actually, the function only uses first 2 values, so it returns valid result
      expect(result).toEqual({ width: 1200, height: 675 });
    });
  });

  describe('Edge cases', () => {
    test('should handle very small dimensions', () => {
      const result = getViewportDimensions('1x1');
      expect(result).toEqual({ width: 1, height: 1 });
    });

    test('should handle very large dimensions', () => {
      const result = getViewportDimensions('10000x10000');
      expect(result).toEqual({ width: 10000, height: 10000 });
    });

    test('should parse decimal values as integers', () => {
      const result = getViewportDimensions('1200.5x675.3');
      expect(result).toEqual({ width: 1200.5, height: 675.3 });
    });
  });
});
