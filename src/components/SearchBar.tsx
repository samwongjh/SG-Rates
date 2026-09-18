import React, { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, TrendingDown, DollarSign, Percent, ArrowRight } from 'lucide-react';
import { CurrencyRate, SoraRate, SearchResultItem } from '../types';

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
  currencies: CurrencyRate[];
  soraRates: SoraRate[];
  onSelectCurrency: (code: string) => void;
  onSelectSora: (tenor: string) => void;
}

export const SearchModal: React.FC<SearchBarProps> = ({
  isOpen,
  onClose,
  currencies,
  soraRates,
  onSelectCurrency,
  onSelectSora,
}) => {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'currency' | 'sora' | 'major' | 'regional'>('all');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global hotkey listener for "/" and "Escape"
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) && !isOpen) {
        // Prevent default only if not in an input
        if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
        e.preventDefault();
        // Trigger opening handled by parent or state
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Build unified search items
  const items: SearchResultItem[] = [
    // SORA entries
    ...soraRates.map((s) => ({
      id: `sora-${s.tenor}`,
      type: 'sora' as const,
      code: s.code,
      title: s.name,
      subtitle: `${s.calculationType} · MAS SORA`,
      valueDisplay: s.rateFormatted,
      changePct: s.changePct,
      tag: 'SORA Rate',
    })),
    // Currency entries
    ...currencies.map((c) => ({
      id: `fx-${c.code}`,
      type: 'currency' as const,
      code: c.code,
      title: `${c.code} / SGD (${c.name})`,
      subtitle: `${c.country} · Unit: ${c.unit} ${c.code} = ${c.mid.toFixed(4)} SGD`,
      valueDisplay: `${c.mid.toFixed(c.unit === 100 && c.mid < 0.1 ? 5 : 4)} SGD`,
      changePct: c.changePct,
      tag: c.category === 'major' ? 'Major FX' : 'Regional FX',
    })),
  ];

  const filteredItems = items.filter((item) => {
    const matchesFilter =
      filterType === 'all'
        ? true
        : filterType === 'sora'
        ? item.type === 'sora'
        : filterType === 'currency'
        ? item.type === 'currency'
        : filterType === 'major'
        ? item.tag === 'Major FX'
        : filterType === 'regional'
        ? item.tag === 'Regional FX'
        : true;

    if (!matchesFilter) return false;

    if (!query.trim()) return true;

    const q = query.toLowerCase().trim();
    return (
      item.code.toLowerCase().includes(q) ||
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.tag.toLowerCase().includes(q)
    );
  });

  const handleSelect = (item: SearchResultItem) => {
    if (item.type === 'sora') {
      const tenor = item.id.replace('sora-', '');
      onSelectSora(tenor);
    } else {
      onSelectCurrency(item.code);
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    }
  };

  return (
    <div
      id="search-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 px-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="search-modal-container"
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search header & input */}
        <div className="p-3.5 border-b border-slate-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            id="search-rates-modal-input"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search USD, SORA, Ringgit, Euro, 3M SORA, Yen..."
            className="w-full text-sm sm:text-base text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-mono text-slate-400 bg-slate-100 border border-slate-200 rounded">
            ESC
          </kbd>
        </div>

        {/* Quick Filter Categories */}
        <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'All Rates' },
            { id: 'sora', label: 'SORA Rates' },
            { id: 'currency', label: 'All Currencies' },
            { id: 'major', label: 'Major (G10)' },
            { id: 'regional', label: 'ASEAN & Regional' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setFilterType(tab.id as any);
                setSelectedIndex(0);
              }}
              className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                filterType === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 p-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <p className="text-sm font-medium">No currency or interest rate matching &quot;{query}&quot;</p>
              <p className="text-xs text-slate-400 mt-1">
                Try searching for &quot;USD&quot;, &quot;MYR&quot;, &quot;3M SORA&quot;, or &quot;Yen&quot;
              </p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              const isPositive = item.changePct >= 0;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    isSelected ? 'bg-slate-100/90' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        item.type === 'sora'
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : 'bg-slate-100 text-slate-800 border border-slate-200'
                      }`}
                    >
                      {item.type === 'sora' ? (
                        <Percent className="w-4 h-4 text-amber-700" />
                      ) : (
                        <DollarSign className="w-4 h-4 text-slate-700" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-sm">{item.title}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            item.type === 'sora'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {item.tag}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-3 text-right">
                    <div>
                      <div className="font-mono font-bold text-sm text-slate-900">
                        {item.valueDisplay}
                      </div>
                      <div
                        className={`text-xs flex items-center justify-end gap-0.5 font-medium ${
                          isPositive ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isPositive ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span>
                          {isPositive ? '+' : ''}
                          {item.changePct.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                    <ArrowRight
                      className={`w-4 h-4 text-slate-400 ${isSelected ? 'translate-x-0.5 text-slate-700' : ''} transition-transform`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Use ↑ and ↓ arrows to navigate, Enter to view historical chart</span>
          <span className="font-medium text-slate-600">{filteredItems.length} results</span>
        </div>
      </div>
    </div>
  );
};
