export function normalizeMarkdown(text: string) {
  return text.replace(
    /^\s{0,50}([a-zA-Z])\.\s{1,50}/gm, 
    (match, p1) => {
      const number = p1.toLowerCase().charCodeAt(0) - 96;
      return `${number}. `;
    }
  );
}