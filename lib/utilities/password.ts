export const PASSWORD_MIN_LENGTH = 4;
export const PASSWORD_MAX_LENGTH = 128;

export const PASSWORD_CLASSES = Object.freeze({
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~",
});

export type PasswordClass = keyof typeof PASSWORD_CLASSES;

export type PasswordOptions = {
  length: number;
  classes: readonly PasswordClass[];
};

/** Returns a content-free validation message suitable for the local UI. */
export function validatePasswordOptions(options: PasswordOptions): string | null {
  if (
    !Number.isInteger(options.length) ||
    options.length < PASSWORD_MIN_LENGTH ||
    options.length > PASSWORD_MAX_LENGTH
  ) {
    return `Choose a whole-number length from ${PASSWORD_MIN_LENGTH} to ${PASSWORD_MAX_LENGTH}.`;
  }

  if (options.classes.length === 0) {
    return "Select at least one character class.";
  }

  if (
    options.classes.some(
      (characterClass) => !Object.hasOwn(PASSWORD_CLASSES, characterClass),
    )
  ) {
    return "Choose supported character classes.";
  }

  return null;
}

/**
 * Generate only in the browser, using Web Crypto with no insecure fallback.
 * Byte rejection sampling avoids modulo bias. Rejecting whole candidates that
 * omit a selected class makes every valid string equally likely, unlike forcing
 * characters into an otherwise random string. The four disjoint ASCII classes
 * and a minimum length of four ensure every allowed selection is satisfiable.
 *
 * All options, intermediate bytes, and output remain local to this invocation.
 * Never pass any of them to analytics, logging, storage, or a network request.
 */
export function generatePassword(options: PasswordOptions): string {
  const validationError = validatePasswordOptions(options);
  if (validationError) throw new RangeError(validationError);

  if (typeof globalThis.crypto?.getRandomValues !== "function") {
    throw new Error("Secure password generation is unavailable in this browser.");
  }

  const selectedClasses = [...new Set(options.classes)].map(
    (characterClass) => PASSWORD_CLASSES[characterClass],
  );
  const alphabet = selectedClasses.join("");
  const unbiasedLimit = 256 - (256 % alphabet.length);
  const bytes = new Uint8Array(128);
  let byteIndex = bytes.length;

  function nextCharacter(): string {
    let value: number;

    do {
      if (byteIndex === bytes.length) {
        globalThis.crypto.getRandomValues(bytes);
        byteIndex = 0;
      }

      value = bytes[byteIndex++];
    } while (value >= unbiasedLimit);

    return alphabet[value % alphabet.length];
  }

  while (true) {
    let password = "";
    for (let index = 0; index < options.length; index += 1) {
      password += nextCharacter();
    }

    if (
      selectedClasses.every((characters) =>
        [...password].some((character) => characters.includes(character)),
      )
    ) {
      return password;
    }
  }
}
