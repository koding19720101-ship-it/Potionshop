import React from 'react';
import { Ingredient } from '../types';
import { INGREDIENTS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Coins, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface CabinetDrawerProps {
  gold: number;
  onBuyIngredient: (id: string, cost: number, amount?: number) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  cuttingBoard: { [id: string]: number };
}

export default function CabinetDrawer({
  gold,
  onBuyIngredient,
  isOpen,
  setIsOpen,
  cuttingBoard,
}: CabinetDrawerProps) {
  return (
    <div className="relative">
      {/* Drawer Toggle Handle Button - attached to the side or floating */}
      <motion.button
        id="btn-drawer-toggle"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-slate-800 hover:bg-slate-700 text-slate-100 border-l border-t border-b border-slate-700 py-6 px-2.5 rounded-l-2xl shadow-2xl flex flex-col items-center gap-2 cursor-pointer"
      >
        {isOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        <ShoppingBag size={18} className="text-amber-400 animate-bounce" />
        <span className="text-[10px] font-bold writing-mode-vertical uppercase tracking-wider text-amber-400">
          재료 서랍
        </span>
      </motion.button>

      {/* Slide-out Drawer Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for overlay click to close */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black z-30 lg:hidden"
            />

            <motion.div
              id="cabinet-drawer-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 w-80 max-w-[90vw] bg-slate-900 border-l border-slate-700 shadow-2xl z-40 flex flex-col p-5 overflow-y-auto"
            >
              {/* Header */}
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🗄️</span>
                  <div>
                    <h2 className="text-sm font-bold text-slate-100 leading-none">만물상 재료 서랍</h2>
                    <span className="text-[10px] text-slate-400 mt-1 block">구매한 재료는 도마로 즉시 배송됩니다.</span>
                  </div>
                </div>
                <button
                  id="btn-close-drawer"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Current Gold HUD inside drawer */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 flex justify-between items-center mb-4">
                <span className="text-xs font-semibold text-slate-400">보유 자금:</span>
                <div className="flex items-center gap-1.5 text-amber-400 font-black text-base">
                  <Coins size={16} className="animate-spin" style={{ animationDuration: '6s' }} />
                  <span>{gold} G</span>
                </div>
              </div>

              {/* Ingredients List */}
              <div className="flex-1 space-y-3 pr-1">
                {INGREDIENTS.map((ing) => {
                  const isAffordable = gold >= ing.cost;
                  const currentInBoard = cuttingBoard[ing.id] || 0;

                  return (
                    <div
                      id={`drawer-ing-card-${ing.id}`}
                      key={ing.id}
                      className="bg-slate-950/40 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-3 transition-all relative overflow-hidden"
                    >
                      {/* Current Count Badge */}
                      {currentInBoard > 0 && (
                        <div className="absolute top-0 right-0 bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-bl-xl text-[9px] font-black border-l border-b border-emerald-500/10">
                          도마에 {currentInBoard}개 대기중
                        </div>
                      )}

                      <div className="flex items-start gap-2.5">
                        <span className="text-3xl p-1 bg-slate-800 rounded-xl">{ing.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs font-bold text-slate-200 leading-tight flex items-center gap-1.5">
                            {ing.name}
                            <span
                              className="w-1.5 h-1.5 rounded-full inline-block"
                              style={{ backgroundColor: ing.color }}
                            />
                          </h3>
                          <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                            효과: <span className="text-teal-400 font-semibold">{ing.primaryEffect} +{ing.intensity}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {ing.description}
                          </p>
                        </div>
                      </div>

                      {/* Buy Buttons */}
                      <div className="mt-3 flex items-center justify-between gap-1.5 border-t border-slate-800/80 pt-2.5">
                        <div className="flex items-center gap-1 text-slate-300 font-bold text-xs">
                          <span className="text-[10px] text-slate-500 font-medium">가격:</span>
                          <span className="text-amber-400">{ing.cost}G</span>
                        </div>

                        <div className="flex gap-1.5">
                          <motion.button
                            id={`btn-buy-1-${ing.id}`}
                            whileTap={{ scale: 0.95 }}
                            disabled={!isAffordable}
                            onClick={() => onBuyIngredient(ing.id, ing.cost, 1)}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${
                              isAffordable
                                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/10'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            <span>구입</span>
                          </motion.button>

                          <motion.button
                            id={`btn-buy-5-${ing.id}`}
                            whileTap={{ scale: 0.95 }}
                            disabled={gold < ing.cost * 5}
                            onClick={() => onBuyIngredient(ing.id, ing.cost, 5)}
                            className={`px-2 py-1.5 rounded-xl text-[10px] font-black transition-all cursor-pointer ${
                              gold >= ing.cost * 5
                                ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700'
                                : 'bg-slate-800/40 text-slate-600 cursor-not-allowed'
                            }`}
                          >
                            x5
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer hint */}
              <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-500 text-center">
                도마로 간 재료를 절구에 빻아보세요!
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
