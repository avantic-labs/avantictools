import { describe, expect, it } from "vitest";
import { convertCase, countText, type CaseMode } from "../../lib/utilities/text";

describe("countText", () => {
  it.each([
    ["", { words: 0, characters: 0 }],
    [" \t\n", { words: 0, characters: 3 }],
    ["Hello, world!", { words: 2, characters: 13 }],
    ["First line\nSecond line", { words: 4, characters: 22 }],
    ["one\r\ntwo", { words: 2, characters: 7 }],
    ["...!?—", { words: 0, characters: 6 }],
    ["don't re-enter 123", { words: 4, characters: 18 }],
    ["café cafe\u0301", { words: 2, characters: 9 }],
    ["👩🏽‍💻 🇬🇧 👨‍👩‍👧‍👦", { words: 0, characters: 5 }],
    ["你好 世界", { words: 2, characters: 5 }],
    ["Привет мир", { words: 2, characters: 10 }],
    ["مرحبا بالعالم", { words: 2, characters: 13 }],
  ])("counts %j consistently", (input, expected) => {
    expect(countText(input)).toEqual(expected);
  });

  it("uses one grapheme for a pasted decomposed letter", () => {
    expect(countText("é")).toEqual(countText("e\u0301"));
    expect(countText("a\u0301\u0327")).toEqual({ words: 1, characters: 1 });
  });

  it("handles a long pasted passage", () => {
    expect(countText("Hello 👩🏽‍💻\n".repeat(2_000))).toEqual({
      words: 2_000,
      characters: 16_000,
    });
  });
});

describe("convertCase", () => {
  it.each<CaseMode>(["lower", "upper", "title", "sentence"])(
    "preserves empty and whitespace-only input in %s mode",
    (mode) => {
      expect(convertCase("", mode)).toBe("");
      expect(convertCase(" \t\n\r\n ", mode)).toBe(" \t\n\r\n ");
    },
  );

  it("applies Unicode lowercase with a fixed locale", () => {
    expect(convertCase(" CAFÉ\nПРИВЕТ ΟΣ I İ ", "lower")).toBe(
      " café\nпривет ος i i\u0307 ",
    );
  });

  it("supports Unicode uppercase expansions", () => {
    expect(convertCase("straße café привет 👩🏽‍💻", "upper")).toBe(
      "STRASSE CAFÉ ПРИВЕТ 👩🏽‍💻",
    );
  });

  it("title-cases words while preserving punctuation and whitespace", () => {
    expect(convertCase("  DON'T\tSTOP—RE-ENTER\nélÈVE  3d ", "title")).toBe(
      "  Don't\tStop—Re-Enter\nÉlève  3D ",
    );
  });

  it("does not remove combining marks, emoji, or uncased scripts", () => {
    expect(convertCase("e\u0301COLE 👩🏽‍💻 中文", "title")).toBe(
      "E\u0301cole 👩🏽‍💻 中文",
    );
  });

  it("capitalizes sentences and line starts after quotes or numbers", () => {
    expect(
      convertCase(
        '  "hELLO!" 42 wORLD?\nélÈVE.\r\nпрИВЕТ\u2028LAST\u2029LINE',
        "sentence",
      ),
    ).toBe('  "Hello!" 42 World?\nÉlève.\r\nПривет\u2028Last\u2029Line');
  });

  it("documents rule-based sentence boundaries and lowercased proper nouns", () => {
    expect(convertCase("DR. SMITH VISITS NASA... HELLO", "sentence")).toBe(
      "Dr. Smith visits nasa... Hello",
    );
  });

  it("rejects unsupported transformations at runtime", () => {
    expect(() => convertCase("input", "unsupported" as CaseMode)).toThrow(
      RangeError,
    );
  });
});
