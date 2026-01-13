/**
 * Break point algorithm thresholds for maximizing content per image
 */
const MIN_CONTENT_RATIO = 0.5;  // Minimum content ratio to break before an element (50% of target height)
const MAX_CONTENT_RATIO = 1.5;  // Maximum content ratio to include entire element (150% of target height)

/**
 * Find optimal break points to avoid splitting elements across images
 * Strategy: Maximize content per image while avoiding cutting elements mid-way
 * 
 * @param {HTMLElement} container - The container element with children to analyze
 * @param {number} targetHeight - The target height for each image
 * @param {number} totalHeight - The total height of all content
 * @returns {number[]} - Array of offsets where images should break
 */
function findOptimalBreakPoints(container, targetHeight, totalHeight) {
    const breakPoints = [0]; // Always start at 0
    
    // Get all block-level children that can serve as break points
    const children = Array.from(container.children);
    
    if (children.length === 0) {
        // Fallback to fixed intervals if no children
        const numImages = Math.ceil(totalHeight / targetHeight);
        for (let i = 1; i < numImages; i++) {
            breakPoints.push(i * targetHeight);
        }
        return breakPoints;
    }
    
    let currentOffset = 0;
    
    while (currentOffset + targetHeight < totalHeight) {
        const idealBreakPoint = currentOffset + targetHeight;
        
        // Check if any element would be cut at the ideal break point
        let elementWouldBeCut = false;
        let breakBeforeElement = null;
        
        for (const child of children) {
            const childTop = child.offsetTop;
            const childBottom = childTop + child.offsetHeight;
            
            // Check if this element straddles the ideal break point
            // (starts before and ends after the break point)
            if (childTop < idealBreakPoint && childBottom > idealBreakPoint) {
                elementWouldBeCut = true;
                
                // We need to break either before or after this element
                // Choose based on which gives us more content in the current image
                const contentBeforeElement = childTop - currentOffset;
                const contentIncludingElement = childBottom - currentOffset;
                
                // If breaking before gives us at least MIN_CONTENT_RATIO of target height, do that
                // Otherwise, include the entire element even if it goes over
                if (contentBeforeElement >= targetHeight * MIN_CONTENT_RATIO) {
                    breakBeforeElement = childTop;
                } else if (contentIncludingElement <= targetHeight * MAX_CONTENT_RATIO) {
                    // Include the entire element if it doesn't make image too large
                    breakBeforeElement = childBottom;
                } else {
                    // Element is too large, break before it
                    breakBeforeElement = childTop;
                }
                break; // Found the first element that would be cut
            }
        }
        
        // Set the next break point
        if (elementWouldBeCut && breakBeforeElement !== null) {
            // Safety check: ensure we make progress
            if (breakBeforeElement <= currentOffset) {
                breakBeforeElement = currentOffset + targetHeight;
            }
            breakPoints.push(breakBeforeElement);
            currentOffset = breakBeforeElement;
        } else {
            // No element would be cut, use the ideal break point
            breakPoints.push(idealBreakPoint);
            currentOffset = idealBreakPoint;
        }
    }
    
    return breakPoints;
}

// Export for Node.js (CommonJS)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { findOptimalBreakPoints, MIN_CONTENT_RATIO, MAX_CONTENT_RATIO };
}
