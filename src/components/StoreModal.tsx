import React from 'react';
import { AppState, StoreItem } from '../types';
import { sound } from '../services/audio';
import confetti from 'canvas-confetti';
import { X, ShoppingBag, Sparkles, Heart, Coins, Check, Gift } from 'lucide-react';

interface StoreModalProps {
  state: AppState;
  onClose: () => void;
  onPurchaseItem: (item: StoreItem) => void;
  onEquipAccessory: (accessoryKey: 'none' | 'backpack' | 'glasses' | 'medal' | 'cape') => void;
}

export const StoreModal: React.FC<StoreModalProps> = ({
  state,
  onClose,
  onPurchaseItem,
  onEquipAccessory,
}) => {
  const { profile, storeItems } = state;

  const handleBuy = (item: StoreItem) => {
    // Check funds
    let canAfford = false;
    if (item.costType === 'sabiduria' && profile.wisdomPoints >= item.cost) canAfford = true;
    if (item.costType === 'vida' && profile.lifePoints >= item.cost) canAfford = true;
    if (item.costType === 'coins' && profile.coins >= item.cost) canAfford = true;

    if (!canAfford) {
      alert('¡No tienes suficientes puntos o monedas para canjear este premio! Completa más tareas.');
      return;
    }

    sound.playCoin();
    try {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.5 },
      });
    } catch {}

    onPurchaseItem(item);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 animate-fade-in text-slate-100">
      <div className="relative w-full max-w-[760px] max-h-[90vh] flex flex-col bg-slate-900 rounded-3xl shadow-2xl border-2 border-emerald-500/50 overflow-hidden font-sans">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 p-4 px-6 border-b border-emerald-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/30 border border-emerald-400 flex items-center justify-center shadow">
              <ShoppingBag className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wide text-emerald-200 flex items-center gap-2">
                <span>Tienda de Premios & Accesorios</span>
              </h2>
              <p className="text-xs text-emerald-300/80 font-medium">
                Canjeá tus puntos y monedas por recompensas reales y equipamiento de avatar
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-emerald-950/80 hover:bg-rose-700 text-emerald-200 hover:text-white flex items-center justify-center transition-colors border border-emerald-700/50"
            title="Cerrar Tienda"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Currency summary strip */}
        <div className="bg-slate-950/80 px-6 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-sky-400">
              <Sparkles className="w-4 h-4" /> {profile.wisdomPoints} Pts Sabiduría
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Heart className="w-4 h-4" /> {profile.lifePoints} Pts Vida
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <Coins className="w-4 h-4" /> {profile.coins} Monedas
            </span>
          </div>
          <span className="text-[11px] text-slate-400">Avatar: {profile.name}</span>
        </div>

        {/* Store Grid */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Section 1: Premios de la Vida Real */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
              <Gift className="w-4 h-4" />
              <span>Premios de la Vida Real (Familiares)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {storeItems
                .filter((item) => item.type === 'real_life')
                .map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-emerald-500/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{item.icon}</span>
                        <div>
                          <h4 className="text-sm font-bold text-white">{item.title}</h4>
                          <p className="text-xs text-slate-400">{item.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                      <span
                        className={`text-xs font-black px-2.5 py-1 rounded-xl ${
                          item.costType === 'sabiduria'
                            ? 'text-sky-300 bg-sky-950/60 border border-sky-700/50'
                            : 'text-emerald-300 bg-emerald-950/60 border border-emerald-700/50'
                        }`}
                      >
                        {item.cost} {item.costType === 'sabiduria' ? 'Pts Sabiduría' : 'Pts Vida'}
                      </span>

                      <button
                        onClick={() => handleBuy(item)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow active:scale-95 transition-transform"
                      >
                        Canjear Cupón
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Section 2: Accesorios del Avatar */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-purple-400 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Accesorios para el Avatar 2D</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {storeItems
                .filter((item) => item.type === 'avatar')
                .map((item) => {
                  const isOwned = profile.inventory.includes(item.itemKey || '');
                  const isEquipped = profile.avatar.accessory === item.itemKey;

                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-purple-500/50 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-3xl">{item.icon}</span>
                          <div>
                            <h4 className="text-sm font-bold text-white">{item.title}</h4>
                            <p className="text-xs text-slate-400">{item.description}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                        <span className="text-xs font-black text-amber-300 bg-amber-950/60 border border-amber-700/50 px-2.5 py-1 rounded-xl">
                          {item.cost} Monedas 🪙
                        </span>

                        {isOwned ? (
                          <button
                            onClick={() => {
                              onEquipAccessory(
                                isEquipped ? 'none' : (item.itemKey as 'backpack' | 'glasses' | 'medal' | 'cape')
                              );
                              sound.playSelect();
                            }}
                            className={`px-3.5 py-1.5 text-xs font-black rounded-xl shadow active:scale-95 transition-transform flex items-center gap-1.5 ${
                              isEquipped
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-slate-700 hover:bg-slate-600 text-white'
                            }`}
                          >
                            {isEquipped ? (
                              <>
                                <Check className="w-3.5 h-3.5" /> Equipado
                              </>
                            ) : (
                              'Equipar'
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBuy(item)}
                            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-black rounded-xl shadow active:scale-95 transition-transform"
                          >
                            Comprar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
