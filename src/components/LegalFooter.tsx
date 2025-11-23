'use client';

import React, { useState } from 'react';
import { IMPRESSUM_TEXT, DATENSCHUTZ_TEXT } from '@/data/legalText';

export default function LegalFooter() {
  const [modalContent, setModalContent] = useState<{ title: string, text: string } | null>(null);

  const openModal = (title: string, text: string) => {
    setModalContent({ title, text });
  };

  const closeModal = () => {
    setModalContent(null);
  };

  return (
    <>
      <footer className="w-full py-4 bg-gray-900 text-gray-400 text-sm text-center border-t border-gray-800">
        <div className="flex justify-center gap-6">
          <button 
            onClick={() => openModal('Impressum', IMPRESSUM_TEXT)}
            className="hover:text-white transition-colors"
          >
            Impressum
          </button>
          <button 
            onClick={() => openModal('Datenschutz', DATENSCHUTZ_TEXT)}
            className="hover:text-white transition-colors"
          >
            Datenschutz
          </button>
        </div>
      </footer>

      {modalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={closeModal}>
          <div 
            className="bg-gray-800 text-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold">{modalContent.title}</h2>
              <button 
                onClick={closeModal}
                className="p-2 hover:bg-gray-700 rounded-full transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 overflow-y-auto whitespace-pre-wrap text-gray-300 leading-relaxed text-sm">
              {modalContent.text}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-gray-700 flex justify-end">
              <button 
                onClick={closeModal}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white font-medium"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

