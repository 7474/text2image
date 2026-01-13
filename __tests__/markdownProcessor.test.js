const { normalizeMultibyteEmphasis } = require('../src/markdownProcessor');

describe('normalizeMultibyteEmphasis', () => {
  describe('Double underscore to double asterisk conversion', () => {
    test('should convert __ to ** when content contains multibyte characters', () => {
      expect(normalizeMultibyteEmphasis('__あいう__')).toBe('**あいう**');
      expect(normalizeMultibyteEmphasis('__mix世界ed__')).toBe('**mix世界ed**');
      expect(normalizeMultibyteEmphasis('__中文测试__')).toBe('**中文测试**');
      expect(normalizeMultibyteEmphasis('__한글테스트__')).toBe('**한글테스트**');
    });

    test('should convert __ to ** when adjacent to multibyte characters', () => {
      expect(normalizeMultibyteEmphasis('あ__text__')).toBe('あ**text**');
      expect(normalizeMultibyteEmphasis('__text__あ')).toBe('**text**あ');
      expect(normalizeMultibyteEmphasis('世界__hello__')).toBe('世界**hello**');
      expect(normalizeMultibyteEmphasis('__world__中文')).toBe('**world**中文');
    });

    test('should not convert __ to ** when only ASCII characters', () => {
      expect(normalizeMultibyteEmphasis('__hello__')).toBe('__hello__');
      expect(normalizeMultibyteEmphasis('__test 123__')).toBe('__test 123__');
    });
  });

  describe('Single underscore to single asterisk conversion', () => {
    test('should convert _ to * when content contains multibyte characters', () => {
      expect(normalizeMultibyteEmphasis('_あいう_')).toBe('*あいう*');
      expect(normalizeMultibyteEmphasis('_mix世界ed_')).toBe('*mix世界ed*');
      expect(normalizeMultibyteEmphasis('_中文_')).toBe('*中文*');
    });

    test('should convert _ to * when adjacent to multibyte characters', () => {
      expect(normalizeMultibyteEmphasis('あ_text_')).toBe('あ*text*');
      expect(normalizeMultibyteEmphasis('_text_あ')).toBe('*text*あ');
    });

    test('should not convert _ to * when only ASCII characters', () => {
      expect(normalizeMultibyteEmphasis('_hello_')).toBe('_hello_');
      expect(normalizeMultibyteEmphasis('_test_')).toBe('_test_');
    });
  });

  describe('CJK punctuation handling', () => {
    test('should convert ** with CJK punctuation to <strong> tags', () => {
      expect(normalizeMultibyteEmphasis('**「テスト」**')).toBe('<strong>「テスト」</strong>');
      expect(normalizeMultibyteEmphasis('**『内容』**')).toBe('<strong>『内容』</strong>');
      expect(normalizeMultibyteEmphasis('**、内容、**')).toBe('<strong>、内容、</strong>');
      expect(normalizeMultibyteEmphasis('**。内容。**')).toBe('<strong>。内容。</strong>');
    });

    test('should not affect ** without CJK punctuation', () => {
      expect(normalizeMultibyteEmphasis('**test**')).toBe('**test**');
      expect(normalizeMultibyteEmphasis('**hello world**')).toBe('**hello world**');
    });
  });

  describe('Combined patterns', () => {
    test('should handle multiple patterns in one text', () => {
      const input = 'これは__テスト__で、_あいう_です。';
      const expected = 'これは**テスト**で、*あいう*です。';
      expect(normalizeMultibyteEmphasis(input)).toBe(expected);
    });

    test('should handle mixed multibyte and ASCII', () => {
      const input = '日本語__text__中文_word_한글';
      const expected = '日本語**text**中文*word*한글';
      expect(normalizeMultibyteEmphasis(input)).toBe(expected);
    });
  });

  describe('Edge cases', () => {
    test('should handle empty string', () => {
      expect(normalizeMultibyteEmphasis('')).toBe('');
    });

    test('should handle text without emphasis markers', () => {
      expect(normalizeMultibyteEmphasis('これはテストです')).toBe('これはテストです');
      expect(normalizeMultibyteEmphasis('Hello world')).toBe('Hello world');
    });

    test('should not affect emphasis markers across newlines', () => {
      expect(normalizeMultibyteEmphasis('__test\nあいう__')).toBe('__test\nあいう__');
      expect(normalizeMultibyteEmphasis('_test\n中文_')).toBe('_test\n中文_');
    });
  });
});
