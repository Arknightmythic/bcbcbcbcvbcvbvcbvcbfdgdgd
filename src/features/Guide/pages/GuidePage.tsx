import React from 'react';
const pdfUrl = "/Markdown to PDF.pdf";

const GuidePage: React.FC = () => {
  return (
    <div className="flex flex-col h-[800px]">
      <div className="flex-1 bg-white rounded-lg shadow-md overflow-hidden">
        <iframe
          src={pdfUrl}
          title="Application Guide"
          className="w-full h-full border-0"
          allowFullScreen
        >
          <p>Your browser does not support PDFs. Please download the PDF to view it: <a href={pdfUrl}>Download PDF</a>.</p>
        </iframe>
      </div>
    </div>
  );
};

export default GuidePage;