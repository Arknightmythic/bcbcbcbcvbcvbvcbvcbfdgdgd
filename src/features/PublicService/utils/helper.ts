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
    processed = processed.replace(/\\u([\d\w]{4})/gi, (match, grp) => {
      return String.fromCharCode(parseInt(grp, 16));
    });
  } catch (e) {
    console.error("Failed to decode unicode:", e);
  }


  processed = processed.replace(/\\n/g, "\n");
  processed = processed.replaceAll(
    /^\s{0,50}([a-zA-Z])\.\s{1,50}/gm,
    (match, p1) => {
      const number = (p1.toLowerCase().codePointAt(0) || 0) - 96;
      return `${number}. `;
    }
  );

  
  
  
  processed = processed.replace(/\n/g, "  \n");

  return processed;
};