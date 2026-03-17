import React, { useState } from 'react';
import Icon from './Icon';

const VariantDropdown = ({ variants, currentVariant, onChange, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Búsqueda profunda de la variante seleccionada (incluyendo grupos)
  const selectedVariant = variants.reduce((found, item) => {
    if (found) return found;
    if (item.id === currentVariant) return item;
    if (item.items) return item.items.find(v => v.id === currentVariant);
    return null;
  }, null) || variants[0];

  return (
    <div className={`relative ${className}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#1e293b] text-sm font-bold py-2 px-4 rounded-full border border-[#e2e8f0] transition-colors cursor-pointer"
      >
        {selectedVariant?.label}
        <svg 
          width="12" 
          height="12" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute left-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-border/50 overflow-hidden z-20 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Si existen grupos en la lista */}
            {variants.some(v => v.items) ? (
              variants.map((item, index) => {
                if (item.items) {
                  return (
                    <div key={item.title || index} className={index > 0 ? 'mt-2 pt-2 border-t border-border/30' : ''}>
                      {item.title && (
                        <div className="px-5 py-1.5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">
                          {item.title}
                        </div>
                      )}
                      {item.items.map(variant => (
                        <button
                          key={variant.id}
                          className={`w-full text-left px-5 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${
                            currentVariant === variant.id ? 'bg-[#1e293b] text-white' : 'text-[#64748b] hover:bg-[#f8fafc] hover:text-[#1e293b]'
                          }`}
                          onClick={() => {
                            onChange(variant.id);
                            setIsOpen(false);
                          }}
                        >
                          {variant.label}
                        </button>
                      ))}
                    </div>
                  );
                } else {
                  // Item plano (como 'Todos')
                  return (
                    <button
                      key={item.id}
                      className={`w-full text-left px-5 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${
                        currentVariant === item.id ? 'bg-[#1e293b] text-white' : 'text-[#64748b] hover:bg-[#f8fafc] hover:text-[#1e293b]'
                      }`}
                      onClick={() => {
                        onChange(item.id);
                        setIsOpen(false);
                      }}
                    >
                      {item.label}
                    </button>
                  );
                }
              })
            ) : (
              // Fallback para lista plana simple (sin ningún grupo)
              variants.map(variant => (
                <button
                  key={variant.id}
                  className={`w-full text-left px-5 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${
                    currentVariant === variant.id ? 'bg-[#1e293b] text-white' : 'text-[#64748b] hover:bg-[#f8fafc] hover:text-[#1e293b]'
                  }`}
                  onClick={() => {
                    onChange(variant.id);
                    setIsOpen(false);
                  }}
                >
                  {variant.label}
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default VariantDropdown;
