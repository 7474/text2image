const { findOptimalBreakPoints, MIN_CONTENT_RATIO, MAX_CONTENT_RATIO } = require('../src/breakpointCalculator');

describe('findOptimalBreakPoints', () => {
  // Helper function to create a mock container with children
  function createMockContainer(childrenData) {
    const container = {
      children: childrenData.map((data, index) => ({
        offsetTop: data.top,
        offsetHeight: data.height,
        id: `child-${index}`
      }))
    };
    return container;
  }

  describe('Basic functionality', () => {
    test('should always include 0 as first break point', () => {
      const container = createMockContainer([]);
      const breakPoints = findOptimalBreakPoints(container, 100, 50);
      expect(breakPoints[0]).toBe(0);
    });

    test('should return only [0] when content fits in target height', () => {
      const container = createMockContainer([
        { top: 0, height: 50 }
      ]);
      const breakPoints = findOptimalBreakPoints(container, 100, 50);
      expect(breakPoints).toEqual([0]);
    });

    test('should handle empty container with fallback to fixed intervals', () => {
      const container = createMockContainer([]);
      const breakPoints = findOptimalBreakPoints(container, 100, 250);
      // Should create breaks at 100, 200 for total height 250
      expect(breakPoints).toEqual([0, 100, 200]);
    });
  });

  describe('Single element scenarios', () => {
    test('should break before large element if it straddles ideal break point', () => {
      const container = createMockContainer([
        { top: 0, height: 50 },
        { top: 50, height: 80 } // This element straddles break at 100
      ]);
      const breakPoints = findOptimalBreakPoints(container, 100, 200);
      // Should break at 50 (before the large element) since 50 >= 100 * 0.5
      expect(breakPoints).toContain(50);
    });

    test('should include entire element if breaking before gives too little content', () => {
      const container = createMockContainer([
        { top: 0, height: 10 },
        { top: 10, height: 100 } // Straddles break at 100, but breaking before gives only 10px
      ]);
      const breakPoints = findOptimalBreakPoints(container, 100, 200);
      // Should include entire element (break at 110) since 10 < 100 * 0.5
      expect(breakPoints).toContain(110);
    });

    test('should break before element if including it makes image too large', () => {
      const container = createMockContainer([
        { top: 0, height: 40 },
        { top: 40, height: 120 } // Straddles at 100, including would make 160 (> 100 * 1.5)
      ]);
      const breakPoints = findOptimalBreakPoints(container, 100, 200);
      // Should break at 40 since 160 > 100 * 1.5
      expect(breakPoints).toContain(40);
    });
  });

  describe('Multiple break points', () => {
    test('should create multiple break points for long content', () => {
      const container = createMockContainer([
        { top: 0, height: 50 },
        { top: 50, height: 50 },
        { top: 100, height: 50 },
        { top: 150, height: 50 },
        { top: 200, height: 50 }
      ]);
      const breakPoints = findOptimalBreakPoints(container, 100, 250);
      expect(breakPoints.length).toBeGreaterThan(1);
      expect(breakPoints[0]).toBe(0);
    });

    test('should optimize break points to avoid splitting elements', () => {
      const container = createMockContainer([
        { top: 0, height: 80 },   // Element 1: 0-80
        { top: 80, height: 30 },  // Element 2: 80-110 (straddles ideal break at 100)
        { top: 110, height: 90 }  // Element 3: 110-200
      ]);
      const breakPoints = findOptimalBreakPoints(container, 100, 250);
      // Should break at 80 to avoid splitting Element 2 (since 80 >= 50)
      expect(breakPoints).toContain(80);
      // Should not split Element 2 between images
      expect(breakPoints.filter(bp => bp > 80 && bp < 110).length).toBe(0);
    });
  });

  describe('Edge cases', () => {
    test('should handle exact multiple of target height', () => {
      const container = createMockContainer([
        { top: 0, height: 100 },
        { top: 100, height: 100 }
      ]);
      const breakPoints = findOptimalBreakPoints(container, 100, 200);
      expect(breakPoints).toEqual([0, 100]);
    });

    test('should handle very small target height', () => {
      const container = createMockContainer([
        { top: 0, height: 50 }
      ]);
      const breakPoints = findOptimalBreakPoints(container, 20, 50);
      // Should create 2-3 break points for 50px total with 20px target
      expect(breakPoints.length).toBeGreaterThan(1);
      expect(breakPoints.length).toBeLessThan(5);
    });

    test('should handle elements with zero height', () => {
      const container = createMockContainer([
        { top: 0, height: 0 },
        { top: 0, height: 100 }
      ]);
      const breakPoints = findOptimalBreakPoints(container, 100, 150);
      expect(breakPoints).toBeDefined();
      expect(Array.isArray(breakPoints)).toBe(true);
    });
  });

  describe('Algorithm constants', () => {
    test('MIN_CONTENT_RATIO should be 0.5', () => {
      expect(MIN_CONTENT_RATIO).toBe(0.5);
    });

    test('MAX_CONTENT_RATIO should be 1.5', () => {
      expect(MAX_CONTENT_RATIO).toBe(1.5);
    });
  });

  describe('Break point progression', () => {
    test('break points should be in ascending order', () => {
      const container = createMockContainer([
        { top: 0, height: 50 },
        { top: 50, height: 50 },
        { top: 100, height: 50 },
        { top: 150, height: 50 }
      ]);
      const breakPoints = findOptimalBreakPoints(container, 75, 200);
      
      for (let i = 1; i < breakPoints.length; i++) {
        expect(breakPoints[i]).toBeGreaterThan(breakPoints[i - 1]);
      }
    });

    test('last break point should not exceed total height', () => {
      const container = createMockContainer([
        { top: 0, height: 50 },
        { top: 50, height: 50 }
      ]);
      const totalHeight = 100;
      const breakPoints = findOptimalBreakPoints(container, 40, totalHeight);
      
      const lastBreakPoint = breakPoints[breakPoints.length - 1];
      expect(lastBreakPoint).toBeLessThanOrEqual(totalHeight);
    });
  });
});
