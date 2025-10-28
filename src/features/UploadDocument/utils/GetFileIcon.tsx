import { FileImage, FileText } from "lucide-react";

export const getFileIcon = (fileName: string) => {
  if (/\.(jpe?g|png)$/i.test(fileName)) {
    return <FileImage className="w-5 h-5 text-purple-500" />;
  }
  return <FileText className="w-5 h-5 text-red-500" />;
};
