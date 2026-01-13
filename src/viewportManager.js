/**
 * Parse viewport dimensions from a size string
 * 
 * @param {string} selectedSize - The size string in format "WIDTHxHEIGHT" or "auto"
 * @returns {Object|null} - Object with width and height properties, or null for auto/invalid
 */
function getViewportDimensions(selectedSize) {
    if (selectedSize === 'auto') {
        return null; // Use actual content size
    }
    
    // Validate format before parsing
    if (!selectedSize.includes('x')) {
        console.error('Invalid viewport size format:', selectedSize);
        return null;
    }
    
    const [width, height] = selectedSize.split('x').map(Number);
    
    // Validate parsed numbers
    if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
        console.error('Invalid viewport dimensions:', width, height);
        return null;
    }
    
    return { width, height };
}

// Export for Node.js (CommonJS)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getViewportDimensions };
}
