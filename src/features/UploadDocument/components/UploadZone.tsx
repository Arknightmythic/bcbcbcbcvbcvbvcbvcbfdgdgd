import React, { useState, useCallback } from 'react';
import { UploadCloud, X, Loader2} from 'lucide-react';
import type { DocumentCategory } from '../types/types';
import { getFileIcon } from '../utils/GetFileIcon';
import CustomSelect from '../../../shared/components/CustomSelect';


interface UploadZoneProps {
  stagedFiles: File[];
  isUploading: boolean;
  selectedCategory: DocumentCategory | '';
  onFilesSelected: (files: FileList) => void;
  onRemoveFile: (fileName: string) => void;
  onUpload: () => void;
  onCategoryChange: (category: DocumentCategory) => void;
}

const categoryOptions = [
  { value: 'panduan', label: 'Panduan' },
  { value: 'uraian', label: 'Uraian' },
  { value: 'peraturan', label: 'Peraturan' },
];

const UploadZone: React.FC<UploadZoneProps> = ({
  stagedFiles,
  isUploading,
  selectedCategory,
  onFilesSelected,
  onRemoveFile,
  onUpload,
  onCategoryChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback(() => setIsDragging(false), []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    onFilesSelected(e.dataTransfer.files);
  }, [onFilesSelected]);

  const canUpload = stagedFiles.length > 0 && !isUploading && selectedCategory !== '';

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        /* --- PERUBAHAN DI SINI: Kurangi padding di mobile (p-4) --- */
        className={`p-4 md:p-8 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center transition-colors ${ isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300' }`}
      >
        <input type="file" id="file-input" multiple className="hidden" onChange={(e) => e.target.files && onFilesSelected(e.target.files)} accept=".pdf,.txt" />
        <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
        {/* --- PERUBAHAN DI SINI: Kecilkan teks di mobile --- */}
        <p className="text-sm md:text-base text-gray-600">Drag the document here, or <label htmlFor="file-input" className="text-blue-600 font-semibold cursor-pointer hover:underline">choose file</label></p>
        <p className="text-xs text-gray-400 mt-2">Supports: PDF, txt.</p>
      </div>

      
      {stagedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="font-semibold text-gray-700">File ready to be uploaded:</h3>
          {stagedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
              <div className="flex items-center space-x-2">
                
                {getFileIcon(file.name)} 
                <span className="text-sm text-gray-800">{file.name}</span>
              </div>
              <button onClick={() => onRemoveFile(file.name)} className="text-gray-500 hover:text-red-600"><X className="w-5 h-5" /></button>
            </div>
          ))}
        </div>
      )}

      
      {/* --- PERUBAHAN DI SINI: Buat layout flex-col di mobile, md:flex-row di desktop --- */}
      <div className="flex flex-col md:flex-row md:justify-end md:items-center mt-6 gap-4">
        
        {/* --- PERUBAHAN DI SINI: Buat dropdown w-full di mobile --- */}
        <div className="relative w-full md:w-auto md:min-w-25">
          <CustomSelect
            value={selectedCategory}
            onChange={(value) => onCategoryChange(value as DocumentCategory)}
            options={categoryOptions}
            placeholder="Pilih Kategori..."
            selectedType='default'
          />
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            
          </div>
        </div>
        
        
        {/* --- PERUBAHAN DI SINI: Buat tombol w-full di mobile --- */}
        <button
          onClick={onUpload}
          disabled={!canUpload}
          className="w-full md:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed text-xs"
        >
          {isUploading ? (
            <><Loader2 className="animate-spin h-5 w-5 mr-2" /> Uploading...</>
          ) : (
            <><UploadCloud className="h-5 w-5 mr-2" /> Upload ({stagedFiles.length})</>
          )}
        </button>
      </div>
    </div>
  );
};

export default UploadZone;