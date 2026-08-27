import React, { useState, useMemo } from 'react';
import { StoreItem } from '../types';
import {
  REWARD_ICONS_CATALOG,
  REWARD_ICON_CATEGORIES,
} from '../data/rewardIconsCatalog';
import {
  X,
  Sparkles,
  Search,
  Check,
  Heart,
  BookOpen,
  Coins,
  Gift,
  Tag,
  FileText,
} from 'lucide-react';

interface RewardEditorModalProps {
  item: StoreItem | null; // null for creating new reward
  onSave: (item: StoreItem) => void;
  onClose: () => void;
}

export const RewardEditorModal: React.FC<RewardEditorModalProps> = ({
  item,
  onSave,
  onClose,
}) => {
  const isEditing = Boolean(item);

  const [title, setTitle] = useState(item?.title || '');
  const [description, setDescription] = useState(item?.description || '');
  const [cost, setCost] = useState<number>(item?.cost || 50);
  const [costType, setCostType] = useState<'vida' | 'sabiduria' | 'coins'>(
    item?.costType || 'vida'
  );
  const [type, setType] = useState<'real_life' | 'avatar'>(
    item?.type || 'real_life'
  );
  const [selectedIcon, setSelectedIcon] = useState<string>(item?.icon || '🍦');

  // Icon Picker Filter State
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredIcons = useMemo(() => {
    return REWARD_ICONS_CATALOG.filter((entry) => {
      const matchesCategory =
        selectedCategory === 'Todos' || entry.category === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newItem: StoreItem = {
      id: item?.id || `reward-custom-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      cost: Math.max(1, cost),
      costType,
      type,
      icon: selectedIcon,
      purchased: item?.purchased || false,
      itemKey: item?.itemKey,
    };

    onSave(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 animate-fade-in select-none">
      <div className="relative w-full max-w-3xl bg-slate-900 border-2 border-amber-500/90 rounded-3xl shadow-[0_16px_60px_rgba(0,0,0,0.85)] text-slate-100 flex flex-col max-h-[92vh] overflow-hidden font-sans">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 p-4 sm:p-5 border-b border-amber-500/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-inner">
              {selectedIcon}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-amber-300 flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-400" />
                {isEditing ? 'Editar Premio de la Tienda' : 'Crear Nuevo Premio'}
              </h3>
              <p className="text-xs text-slate-400">
                Personalizá el título, costo, tipo de puntaje y elegí entre más de 100 iconos.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Main Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title & Description */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-amber-400" />
                  Título del Premio *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Salida por un Helado, 1h de Juegos..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  Descripción / Instrucciones
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalle o condiciones del canje para el niño..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              {/* Cost & Cost Type */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Costo en Puntos
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10000}
                    value={cost}
                    onChange={(e) => setCost(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Tipo de Puntos
                  </label>
                  <select
                    value={costType}
                    onChange={(e) =>
                      setCostType(e.target.value as 'vida' | 'sabiduria' | 'coins')
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="vida">💚 Puntos de Vida (Hogar)</option>
                    <option value="sabiduria">💙 Puntos de Sabiduría (Escuela)</option>
                    <option value="coins">🟡 Monedas de Oro (Especial)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Icon Picker Section */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 flex flex-col h-[280px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Elegí un Icono ({REWARD_ICONS_CATALOG.length}+ disponibles)
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  Actual: <strong className="text-2xl ml-1 align-middle">{selectedIcon}</strong>
                </span>
              </div>

              {/* Search & Category filter */}
              <div className="space-y-1.5 mb-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar icono (ej: helado, pizza, bici...)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
                  {REWARD_ICON_CATEGORIES.map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Icons Grid */}
              <div className="grid grid-cols-6 sm:grid-cols-7 gap-1.5 overflow-y-auto p-1 bg-slate-900/60 rounded-xl flex-1 border border-slate-800/80">
                {filteredIcons.map((item) => {
                  const isSelected = selectedIcon === item.icon;
                  return (
                    <button
                      type="button"
                      key={`${item.category}-${item.name}-${item.icon}`}
                      onClick={() => setSelectedIcon(item.icon)}
                      title={`${item.name} (${item.category})`}
                      className={`h-9 rounded-xl text-xl flex items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/30 border-2 border-amber-400 scale-110 shadow'
                          : 'bg-slate-800/60 hover:bg-slate-750 hover:scale-105 border border-transparent'
                      }`}
                    >
                      {item.icon}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              {isEditing ? 'Guardar Cambios' : 'Crear Premio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
