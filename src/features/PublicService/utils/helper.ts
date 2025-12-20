import { format } from "date-fns";
import { id } from "date-fns/locale";

export const formatDate = (dateString: string) => {
  return format(new Date(dateString), "eeee, dd MMMM yyyy HH:mm", {
    locale: id,
  });
};

export const normalizeMarkdown = (text: string) => {
  if (!text) return "";

  let processed = text;
  try {
    // FIX: Menghapus kurung siku [] di sekitar \w
    // Sebelumnya: /\\u([\w]{4})/gi
    // Sesudah:    /\\u(\w{4})/gi
    processed = processed.replaceAll(/\\u(\w{4})/gi, (match, grp) => {
      return String.fromCodePoint(Number.parseInt(grp, 16));
    });
  } catch (e) {
    console.error("Failed to decode unicode:", e);
  }

  // Bagian ini sudah benar dari perbaikan sebelumnya
  processed = processed.replaceAll(String.raw`\n`, "\n");
  
  processed = processed.replaceAll(
    /^\s{0,50}([a-zA-Z])\.\s{1,50}/gm,
    (match, p1) => {
      const number = (p1.toLowerCase().codePointAt(0) || 0) - 96;
      return `${number}. `;
    }
  );

  processed = processed.replaceAll("\n", "  \n");

  return processed;
};