export function normalizeMarkdown(text: string) {
  // Ubah a. b. c. → 1. 2. 3.
  return text.replace(
    /^\s*([a-zA-Z])\.\s+/gm,
    (match, p1, offset, fullText) => {
      // konversi huruf ke angka
      const number = p1.toLowerCase().charCodeAt(0) - 96;
      return `${number}. `;
    }
  );
}
