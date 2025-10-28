import React from 'react';

interface UploadProgressProps {
  progress: number;
}

const UploadProgress: React.FC<UploadProgressProps> = ({ progress }) => {
  if (progress === 0) return null;

  return (
    <div className="mt-4">
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-sm text-center mt-1 text-gray-600">{progress}%</p>
    </div>
  );
};

export default UploadProgress;