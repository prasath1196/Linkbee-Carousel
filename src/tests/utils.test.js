import { describe, it, expect } from 'vitest';
import { aiToCanvasElements } from '../utils/elementConverter';
import { THEMES } from '../constants/themes';

describe('Element Converter Utility', () => {
    const mockSlide = {
        title: "Test Title",
        content: ["Bullet 1", "Bullet 2"],
        visual: "Image"
    };

    it('correctly applies the Modern Dark theme', () => {
        const theme = THEMES.find(t => t.id === 'modern-dark');
        const result = aiToCanvasElements(mockSlide, 0, theme);

        // 1. Check Background
        expect(result.backgroundColor).toBe('#0f172a');

        // 2. Check Elements Created
        expect(result.elements.length).toBeGreaterThan(0);

        // 3. Check Title Style
        const titleEl = result.elements.find(el => el.content === "Test Title");
        expect(titleEl).toBeDefined();
        expect(titleEl.color).toBe('#f8fafc'); // Match theme title color
        expect(titleEl.fontFamily).toBe('Outfit, sans-serif');
    });

    it('handles long content by adjusting positions', () => {
        const theme = THEMES[0];
        const longSlide = {
            ...mockSlide,
            content: ["A very long point that takes up space", "Another point", "Third point"]
        };

        const result = aiToCanvasElements(longSlide, 0, theme);

        // Verify stacking logic (Y positions should increase)
        const textElements = result.elements.filter(el => el.id.includes('text-'));
        const yPositions = textElements.map(el => el.y);

        // Ensure strictly increasing Y values
        const isSorted = yPositions.every((val, i, arr) => !i || (val > arr[i - 1]));
        expect(isSorted).toBe(true);
    });
});
