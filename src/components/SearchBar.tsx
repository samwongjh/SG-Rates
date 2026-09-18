import React, { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, TrendingDown, DollarSign, Percent, ArrowRight, Star } from 'lucide-react';
import { CurrencyRate, SoraRate, SearchResultItem } from '../types';

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
  currencies: CurrencyRate[];
  soraRates: SoraRate[];
  onSelectCurrency: (code: string) => void;
  onSelectSora: (tenor: string) => void;
  bookmarkedCurrencies?: string[];
  onToggleBookmark?: (code: string) => void;
}

export const SearchModal: React.FC<SearchBarProps> = ({
  isOpen,
  onClose,
  currencies,
  soraRates,
  onSelectCurrency,
  onSelectSora,
  bookmarkedCurrencies = [],
  onToggleBookmark,
}) => {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<
    'all' | 'currency' | 'sora' | 'bookmarked' | 'major' | 'regional'
  >('all');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global hotkey listener for "/" and "Escape"
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) && !isOpen) {
        if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
        e.preventDefault();
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
      title: `${s.name} (${s.code})`,
      subtitle: `MAS Benchmark • ${s.rateFormatted} • Vol: S$ ${s.volumeSgdBillions || '4.28'}B`,
      valueDisplay: s.rateFormatted,
      changePct: s.changePct,
      category: 'sora' as const,
      originalData: s,
      tag: 'SORA Rate',
    })),

    // Currency entries
    ...currencies.map((c) => ({
      id: `currency-${c.code}`,
      type: 'currency' as const,
      code: c.code,
      title: `${c.code}/SGD - ${c.name}`,
      subtitle: `${c.flag} ${c.country} • Mid: ${c.mid.toFixed(c.unit === 100 && c.mid < 0.1 ? 5 : 4)} (${c.unit === 100 ? 'per 100' : 'per 1'})`,
      valueDisplay: `${c.mid.toFixed(c.unit === 100 && c.mid < 0.1 ? 5 : 4)} SGD`,
      changePct: c.changePct,
      category: c.category,
      originalData: c,
      tag: c.category === 'major' ? 'G10 Major' : 'ASEAN / Reg',
    })),
  ];

  // Filter items based on active tab and query string
  const filteredItems = items.filter((item) => {
    // Type/Category Filter
    if (filterType === 'currency' && item.type !== 'currency') return false;
    if (filterType === 'sora' && item.type !== 'sora') return false;
    if (filterType === 'bookmarked' && (item.type !== 'currency' || !bookmarkedCurrencies.includes(item.code))) return false;
    if (filterType === 'major' && item.category !== 'major') return false;
    if (filterType === 'regional' && item.category !== 'regional') return false;

    // Search query matching
    if (!query.trim()) return true;
    const q = query.toLowerCase().trim();
    return (
      item.code.toLowerCase().includes(q) ||
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q)
    );
  });

  const handleSelect = (item: SearchResultItem) => {
    if (item.type === 'sora') {
      const sora = item.originalData as SoraRate;
      onSelectSora(sora.tenor);
    } else {
      onSelectCurrency(item.code);
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    }
  };

  return (
    <div
      id="search-modal-container"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative border-b border-slate-200 flex items-center px-4 py-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
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
            placeholder="Search SORA tenors, USD, EUR, MYR, Yen, interest rates..."
            className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-2 text-xs font-semibold px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded"
          >
            ESC
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-xs bg-slate-50/30">
          {[
            { id: 'all', label: 'All Rates' },
            { id: 'bookmarked', label: `★ Watchlist (${bookmarkedCurrencies.length})` },
            { id: 'sora', label: 'SORA Rates' },
            { id: 'currency', label: 'All Currencies' },
            { id: 'major', label: 'G10 Major' },
            { id: 'regional', label: 'ASEAN & Reg' },
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
              const isCurrBookmarked =
                item.type === 'currency' && bookmarkedCurrencies.includes(item.code);

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
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          : 'bg-slate-100 text-slate-800 border border-slate-200'
                      }`}
                    >
                      {item.type === 'sora' ? (
                        <Percent className="w-4 h-4 text-emerald-700" />
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
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {item.tag}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 ml-3 text-right">
                    {/* Star bookmark toggle if currency */}
                    {item.type === 'currency' && onToggleBookmark && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleBookmark(item.code);
                        }}
                        className="p-1 rounded hover:bg-slate-200 text-slate-400"
                        title={isCurrBookmarked ? 'Remove bookmark' : 'Bookmark currency'}
                      >
                        <Star
                          className={`w-4 h-4 ${
                            isCurrBookmarked
                              ? 'fill-amber-400 text-amber-500'
                              : 'text-slate-300 hover:text-amber-400'
                          }`}
                        />
                      </button>
                    )}

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
