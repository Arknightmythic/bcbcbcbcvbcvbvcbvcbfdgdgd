import React, { useState, useCallback, useRef } from "react";
import { UploadCloud, X, Loader2, AlertCircle } from "lucide-react";
import type { DocumentCategory } from "../types/types";
import { getFileIcon } from "../utils/GetFileIcon";
import CustomSelect from "../../../shared/components/CustomSelect";

interface UploadZoneProps {
  stagedFiles: File[];
  duplicateFilenames: Set<string>; 
  isUploading: boolean;
  isScanning: boolean;
  selectedCategory: DocumentCategory | "";
  onFilesSelected: (files: FileList) => void;
  onRemoveFile: (fileIndex: number) => void;
  onUpload: () => void;
  onCategoryChange: (category: DocumentCategory) => void;
}

const categoryOptions = [
  { value: "panduan", label: "Panduan" },
  { value: "qna", label: "Tanya Jawab" },
  { value: "peraturan", label: "Peraturan" },
];

const UploadZone: React.FC<UploadZoneProps> = ({
  stagedFiles,
  duplicateFilenames, 
  isUploading,
  isScanning,
  selectedCategory,
  onFilesSelected,
  onRemoveFile,
  onUpload,
  onCategoryChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onFilesSelected(e.dataTransfer.files);
      }
    },
    [onFilesSelected]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Hitung jumlah file yang valid (Bukan duplikat)
  const validFilesCount = stagedFiles.filter(f => !duplicateFilenames.has(f.name)).length;

  // Tombol nyala jika ada minimal 1 file valid
  const canUpload =
    validFilesCount > 0 &&
    !isUploading &&
    !isScanning &&
    selectedCategory !== "";

  // FIX 1: Mengekstrak logika class CSS nested ternary menjadi fungsi/variabel independen
  const getDropZoneClasses = () => {
    const baseClasses = "w-full p-4 md:p-8 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";
    
    if (isScanning || isUploading) {
      return `${baseClasses} bg-gray-100 border-gray-200 cursor-not-allowed opacity-60`;
    }
    
    if (isDragging) {
      return `${baseClasses} border-blue-500 bg-blue-50`;
    }

    return `${baseClasses} border-gray-300`;
  };

  // FIX 2: Mengekstrak logika konten tombol nested ternary menjadi fungsi independen
  const getButtonContent = () => {
    if (isUploading) {
      return (
        <>
          <Loader2 className="animate-spin h-5 w-5 mr-2" /> Mengunggah...
        </>
      );
    }

    if (isScanning) {
      return (
        <>
          <Loader2 className="animate-spin h-5 w-5 mr-2" /> Memindai...
        </>
      );
    }

    return (
      <>
        <UploadCloud className="h-5 w-5 mr-2" /> Unggah ({validFilesCount})
      </>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <button
        type="button"
        disabled={isScanning || isUploading}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={getDropZoneClasses()} // Panggil fungsi FIX 1
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
          accept=".pdf,.txt"
          disabled={isScanning || isUploading}
        />

        {isScanning ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-sm text-gray-600 font-semibold">
              Memindai duplikasi dokumen...
            </p>
          </div>
        ) : (
          <>
            <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-sm md:text-base text-gray-600">
              Tarik dokumen ke sini, atau{" "}
              <span className="text-blue-600 font-semibold hover:underline">
                pilih file
              </span>
            </p>
            <p className="text-xs text-gray-400 mt-2">
              mendukung format: PDF & txt.
            </p>
          </>
        )}
      </button>

      {stagedFiles.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Dokumen Terpilih ({stagedFiles.length})
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {stagedFiles.map((file, index) => {
              const isDuplicate = duplicateFilenames.has(file.name);

              return (
                <div
                  key={`${file.name}-${index}`}
                  className={`flex items-center justify-between p-3 rounded-md border ${
                    isDuplicate
                      ? "bg-red-50 border-red-200" 
                      : "bg-gray-50 border-gray-100"
                  }`}
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="flex-shrink-0">
                      {getFileIcon(file.name)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className={`text-sm font-medium truncate ${isDuplicate ? "text-red-700" : "text-gray-700"}`}>
                        {file.name}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                        
                        {isDuplicate && (
                          <span className="ml-2 flex items-center text-red-600 font-bold">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Duplikat (Dilewati)
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveFile(index)}
                    disabled={isUploading || isScanning}
                    className="text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:justify-end md:items-center mt-6 gap-4">
        <div className="relative w-full md:w-auto md:min-w-25">
          <CustomSelect
            value={selectedCategory}
            onChange={(value) => onCategoryChange(value as DocumentCategory)}
            options={categoryOptions}
            placeholder="pilih kategori..."
            selectedType="default"
            disabled={isUploading || isScanning}
          />
        </div>

        <button
          onClick={onUpload}
          disabled={!canUpload}
          className="w-full md:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed text-xs transition-all"
        >
          {getButtonContent()} {/* Panggil fungsi FIX 2 */}
        </button>
      </div>
    </div>
  );
};

export default UploadZone;