import { afterEach, describe, expect, it, vi } from "vitest";
import {
  generatePassword,
  PASSWORD_CLASSES,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  type PasswordClass,
  validatePasswordOptions,
} from "../../lib/utilities/password";

const allClasses = Object.keys(PASSWORD_CLASSES) as PasswordClass[];

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("password option validation", () => {
  it.each([0, PASSWORD_MIN_LENGTH - 1, PASSWORD_MAX_LENGTH + 1, 4.5, NaN, Infinity])(
    "rejects an invalid length of %s",
    (length) => {
      const options = { length, classes: allClasses };
      expect(validatePasswordOptions(options)).not.toBeNull();
      expect(() => generatePassword(options)).toThrow(RangeError);
    },
  );

  it("rejects no character classes before accessing randomness", () => {
    const random = vi.spyOn(globalThis.crypto, "getRandomValues");
    expect(() => generatePassword({ length: 16, classes: [] })).toThrow(
      "Select at least one character class.",
    );
    expect(random).not.toHaveBeenCalled();
  });

  it.each(["unknown", "constructor", "__proto__"])(
    "rejects unsupported class %s without accepting object prototypes",
    (characterClass) => {
      expect(() =>
        generatePassword({
          length: 16,
          classes: [characterClass as PasswordClass],
        }),
      ).toThrow("Choose supported character classes.");
    },
  );
});

describe("generatePassword", () => {
  it("supports every class combination at minimum and maximum length", () => {
    for (let mask = 1; mask < 1 << allClasses.length; mask += 1) {
      const classes = allClasses.filter((_, index) => mask & (1 << index));
      const alphabet = classes.map((name) => PASSWORD_CLASSES[name]).join("");

      for (const length of [PASSWORD_MIN_LENGTH, 16, PASSWORD_MAX_LENGTH]) {
        const password = generatePassword({ length, classes });
        // Assert booleans so a failure never prints generated secrets.
        expect(password.length === length).toBe(true);
        expect([...password].every((character) => alphabet.includes(character))).toBe(
          true,
        );
        for (const name of classes) {
          expect(
            [...password].some((character) => PASSWORD_CLASSES[name].includes(character)),
          ).toBe(true);
        }
      }
    }
  });

  it("deduplicates selected classes", () => {
    const password = generatePassword({
      length: 16,
      classes: ["numbers", "numbers"],
    });
    expect(/^\d{16}$/.test(password)).toBe(true);
  });

  it("uses Web Crypto and never Math.random", () => {
    const secureRandom = vi.spyOn(globalThis.crypto, "getRandomValues");
    const insecureRandom = vi.spyOn(Math, "random").mockImplementation(() => {
      throw new Error("Insecure randomness must not be used.");
    });
    generatePassword({ length: 16, classes: allClasses });
    expect(secureRandom).toHaveBeenCalled();
    expect(insecureRandom).not.toHaveBeenCalled();
  });

  it("rejects bytes that would introduce modulo bias", () => {
    const getRandomValues = vi.fn((bytes: Uint8Array) => {
      bytes.fill(0);
      // With a 10-character alphabet, byte values 250–255 must be rejected.
      bytes.set([255, 250, 249, 1, 2, 3]);
      return bytes;
    });
    vi.stubGlobal("crypto", { getRandomValues });
    const password = generatePassword({ length: 4, classes: ["numbers"] });
    expect(password === "9123").toBe(true);
    expect(getRandomValues).toHaveBeenCalledOnce();
  });

  it("rejects a candidate that omits a selected class", () => {
    const getRandomValues = vi.fn((bytes: Uint8Array) => {
      bytes.fill(0);
      // The first candidate omits digits; the second includes both classes.
      bytes.set([0, 1, 2, 3, 0, 26, 1, 27]);
      return bytes;
    });
    vi.stubGlobal("crypto", { getRandomValues });
    const password = generatePassword({
      length: 4,
      classes: ["lowercase", "numbers"],
    });
    expect(password === "a0b1").toBe(true);
  });

  it("refills random bytes when rejected samples exhaust a buffer", () => {
    const getRandomValues = vi
      .fn((bytes: Uint8Array) => {
        bytes.fill(1);
        return bytes;
      })
      .mockImplementationOnce((bytes: Uint8Array) => {
        bytes.fill(255);
        return bytes;
      });
    vi.stubGlobal("crypto", { getRandomValues });
    const password = generatePassword({ length: 4, classes: ["numbers"] });
    expect(password === "1111").toBe(true);
    expect(getRandomValues).toHaveBeenCalledTimes(2);
  });

  it("fails explicitly if secure randomness is unavailable", () => {
    vi.stubGlobal("crypto", undefined);
    expect(() => generatePassword({ length: 16, classes: allClasses })).toThrow(
      "Secure password generation is unavailable in this browser.",
    );
  });

  it("propagates crypto failures without falling back to weak randomness", () => {
    vi.spyOn(globalThis.crypto, "getRandomValues").mockImplementation(() => {
      throw new Error("Randomness unavailable.");
    });
    expect(() => generatePassword({ length: 16, classes: allClasses })).toThrow(
      "Randomness unavailable.",
    );
  });
});
