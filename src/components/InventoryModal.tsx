import React, { useState } from 'react';
import { X, Key, FileText, Wrench, Shield, Search } from 'lucide-react';
import { InventoryItem } from '../types/game';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  inventory
}) => {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  if (!isOpen) return null;

  const getCategoryIcon = (category: InventoryItem['category']) => {
    switch (category) {
      case 'key':
        return <Key className="w-4 h-4 text-amber-500" />;
      case 'document':
        return <FileText className="w-4 h-4 text-red-400" />;
      case 'tool':
        return <Wrench className="w-4 h-4 text-emerald-400" />;
      case 'code':
        return <Shield className="w-4 h-4 text-cyan-400" />;
      default:
        return <Search className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-xl max-h-[85vh] flex flex-col bg-zinc-950 border border-zinc-800 text-zinc-300 font-terminal shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-red-500" />
            <h2 className="text-sm font-bold tracking-wider text-white">
              SURVIVOR SATCHEL // RECOVERED INVENTORY ({inventory.length} ITEMS)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-500 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {inventory.length === 0 ? (
            <div className="py-12 text-center text-zinc-600">
              <Search className="w-8 h-8 mx-auto mb-2 text-zinc-700" />
              <p>NO CLUES OR ITEMS COLLECTED YET.</p>
              <p className="text-[11px] text-zinc-700 mt-1">Search the reception desk and terminals for clearance keys.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {inventory.map(item => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-3 border transition-all cursor-pointer flex items-start gap-3 ${
                    selectedItem?.id === item.id
                      ? 'bg-red-950/40 border-red-600 text-white shadow-md'
                      : 'bg-zinc-900/40 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <div className="p-2 bg-black border border-zinc-800 shrink-0 mt-0.5">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs truncate">{item.name}</div>
                    <div className="text-[10px] text-zinc-500 capitalize">{item.category} // {item.foundIn}</div>
                    <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Detailed item inspection viewer */}
          {selectedItem && (
            <div className="mt-5 p-4 bg-zinc-900/80 border border-zinc-700 text-xs animate-in fade-in">
              <div className="flex items-center gap-2 text-red-400 font-bold mb-2">
                {getCategoryIcon(selectedItem.category)}
                <span>INSPECTING: {selectedItem.name.toUpperCase()}</span>
              </div>
              <p className="text-zinc-300 mb-3">{selectedItem.description}</p>

              {selectedItem.inspectedText && (
                <div className="p-3 bg-black border border-red-950 font-mono text-emerald-400 leading-relaxed whitespace-pre-line text-[11px]">
                  {selectedItem.inspectedText}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-900/30 flex justify-between items-center text-xs text-zinc-500">
          <span>SELECT ITEM TO EXAMINE CRYPTIC TRANSCRIPT</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs cursor-pointer"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
