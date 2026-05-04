import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { POPULAR_BRANDS } from '../lib/brands';
import { getBrandLogoUrl } from '../lib/utils';

interface IconSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (iconUrl: string) => void;
}

export function IconSelectorModal({ isOpen, onClose, onSelect }: IconSelectorModalProps) {
  const [search, setSearch] = useState('');

  const filteredBrands = useMemo(() => {
    return POPULAR_BRANDS.filter(brand => 
      brand.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Brand Icon">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            autoFocus
            placeholder="Search brands..." 
            className="pl-9 dark:bg-slate-950 dark:border-slate-800"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 max-h-[50vh] overflow-y-auto p-1 pb-4">
          {filteredBrands.map(brand => {
            const url = getBrandLogoUrl(brand);
            return (
              <button
                key={brand}
                type="button"
                onClick={() => {
                  onSelect(url);
                  onClose();
                }}
                className="flex flex-col items-center gap-2 p-2 rounded-xl transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent dark:hover:border-slate-700"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 bg-white flex items-center justify-center">
                  <img 
                    src={url} 
                    alt={brand}
                    className="w-full h-full object-cover bg-white"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                      const parent = (e.target as HTMLElement).parentElement;
                      if (parent) {
                        parent.innerHTML = `<span class="text-sm font-bold text-slate-900">${brand.charAt(0).toUpperCase()}</span>`;
                      }
                    }}
                  />
                </div>
                <span className="text-[10px] text-center font-medium text-slate-600 dark:text-slate-400 truncate w-full">{brand}</span>
              </button>
            );
          })}
          {filteredBrands.length === 0 && (
            <div className="col-span-full py-8 text-center text-sm text-slate-500">
              No brands found matching "{search}"
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
