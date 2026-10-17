export type CaseMode = "lower" | "upper" | "title" | "sentence";

// A fixed locale keeps the result independent of the visitor's browser locale.
// Segmentation follows the browser's Unicode/ICU implementation.
const locale = "en";
const wordSegmenter = new Intl.Segmenter(locale, { granularity: "word" });
const characterSegmenter = new Intl.Segmenter(locale, {
  granularity: "grapheme",
});

/**
 * Characters are Unicode grapheme clusters (user-perceived characters),
 * including whitespace and line breaks. CRLF is one cluster. Combining marks
 * and joined emoji stay together; the original input is never normalized.
 *
 * Words are Intl.Segmenter word-like segments: letters and numbers count,
 * punctuation and emoji do not. English contractions stay together, while
 * hyphenated words split. Scripts without spaces use Unicode word segmentation.
 */
export function countText(text: string): {
  words: number;
  characters: number;
} {
  let words = 0;
  let characters = 0;

  for (const segment of wordSegmenter.segment(text)) {
    if (segment.isWordLike) words += 1;
  }

  const graphemes = characterSegmenter.segment(text)[Symbol.iterator]();
  while (!graphemes.next().done) {
    characters += 1;
  }

  return { words, characters };
}

/**
 * Unicode casing with an explicit English locale, preserving all whitespace
 * and punctuation. Some case mappings expand characters (for example ß → SS).
 * Title case uppercases the first letter of every word-like segment and
 * lowercases the rest; it does not apply editorial small-word exceptions.
 * Sentence case lowercases first, then capitalizes the first letter and the
 * first letter after . ! ? or a line break. This is a deterministic punctuation
 * rule, not language detection: abbreviations and proper nouns are not inferred.
 */
export function convertCase(text: string, mode: CaseMode): string {
  switch (mode) {
    case "lower":
      return text.toLocaleLowerCase(locale);
    case "upper":
      return text.toLocaleUpperCase(locale);
    case "title": {
      let output = "";

      for (const segment of wordSegmenter.segment(
        text.toLocaleLowerCase(locale),
      )) {
        output += segment.isWordLike
          ? segment.segment.replace(/\p{L}/u, (letter) =>
              letter.toLocaleUpperCase(locale),
            )
          : segment.segment;
      }

      return output;
    }
    case "sentence": {
      let capitalizeNext = true;

      return text
        .toLocaleLowerCase(locale)
        .replace(/[.!?\r\n\u2028\u2029]|\p{L}/gu, (character) => {
          if (/[.!?\r\n\u2028\u2029]/u.test(character)) {
            capitalizeNext = true;
            return character;
          }

          if (!capitalizeNext) return character;

          capitalizeNext = false;
          return character.toLocaleUpperCase(locale);
        });
    }
    default:
      throw new RangeError("Choose a supported case transformation.");
  }
}
