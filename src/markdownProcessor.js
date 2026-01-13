/**
 * Normalize emphasis markers for multibyte characters
 * Converts underscore-based emphasis to asterisk-based emphasis when content
 * contains or is adjacent to multibyte characters. This ensures consistent
 * rendering since asterisks work more reliably with multibyte text in GFM.
 * 
 * @param {string} text - The markdown text to normalize
 * @returns {string} - The normalized markdown text
 */
function normalizeMultibyteEmphasis(text) {
    // Convert __ to ** when:
    // 1. Content contains multibyte characters: __あいう__ or __mix世界ed__
    text = text.replace(/__([^_\n]*[\u0080-\uFFFF][^_\n]*)__/g, '**$1**');
    // 2. Adjacent to multibyte characters: あ__text__ or __text__あ
    text = text.replace(/([\u0080-\uFFFF])__([^_\n]+)__/g, '$1**$2**');
    text = text.replace(/__([^_\n]+)__([\u0080-\uFFFF])/g, '**$1**$2');
    
    // Convert _ to * when:
    // 1. Content contains multibyte characters: _あいう_ or _mix世界ed_
    text = text.replace(/_([^_\n]*[\u0080-\uFFFF][^_\n]*)_/g, '*$1*');
    // 2. Adjacent to multibyte characters: あ_text_ or _text_あ
    text = text.replace(/([\u0080-\uFFFF])_([^_\n]+)_/g, '$1*$2*');
    text = text.replace(/_([^_\n]+)_([\u0080-\uFFFF])/g, '*$1*$2');
    
    // Fix ** patterns adjacent to CJK punctuation marks like 「」『』、。！？
    // These punctuation marks cause marked.js to not recognize ** as valid emphasis delimiters
    // due to flanking delimiter rules. Convert directly to <strong> HTML tags to bypass parsing.
    // Pattern: **<CJK-punct>content<CJK-punct>** where content doesn't contain * or newlines
    // Unicode ranges: \u3000-\u303F (CJK Symbols and Punctuation), \uFF00-\uFFEF (Halfwidth and Fullwidth Forms)
    text = text.replace(/\*\*([\u3000-\u303F\uFF00-\uFFEF][^\*\n]*[\u3000-\u303F\uFF00-\uFFEF])\*\*/g, '<strong>$1</strong>');
    
    return text;
}

// Export for Node.js (CommonJS)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { normalizeMultibyteEmphasis };
}
