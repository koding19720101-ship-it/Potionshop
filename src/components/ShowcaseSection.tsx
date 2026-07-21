import React, { useState } from 'react';
import { Potion, Ingredient } from '../types';
import { INGREDIENTS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { Archive, Plus, Trash2, Calendar, Sparkles, Coins, ClipboardList, Zap } from 'lucide-react';

interface ShowcaseSectionProps {
  inventory: Potion[];
  showcase: (Potion | null)[];
  onPlaceOnShowcase: (potionId: string, slotIndex: number) => void;
  onRemoveFromShowcase: (slotIndex: number) => void;
  gold: number;
  onPrepareRecipeToBoard: (ingredientsNeeded: { [id: string]: number }, cost: number) => void;
  onShowMessage: (text: string, type: 'success' | 'error' | 'info') => void;
}

export default function ShowcaseSection({
  inventory,
  showcase,
  onPlaceOnShowcase,
  onRemoveFromShowcase,
  gold,
  onPrepareRecipeToBoard,
  onShowMessage,
}: ShowcaseSectionProps) {
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [activePotionDetails, setActivePotionDetails] = useState<Potion | null>(null);
  const [showInventorySelector, setShowInventorySelector] = useState(false);

  // SVG representation helper for potion bottle shapes
  const renderBottleSVG = (color: string, type: string, size = 'w-12 h-12') => {
    return (
      <svg viewBox="0 0 100 100" className={size}>
        <defs>
          <radialGradient id={`showcase-grad-${color}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="100%" stopColor={color} />
          </radialGradient>
        </defs>
        {type === 'round' && (
          <>
            <rect x="42" y="10" width="16" height="15" rx="3" fill="#cbd5e1" />
            <circle cx="50" cy="55" r="30" fill={`url(#showcase-grad-${color})`} stroke="#64748b" strokeWidth="4" />
            <ellipse cx="50" cy="35" rx="20" ry="5" fill="#ffffff" opacity="0.3" />
          </>
        )}
        {type === 'square' && (
          <>
            <rect x="42" y="10" width="16" height="15" rx="3" fill="#cbd5e1" />
            <rect x="22" y="25" width="56" height="60" rx="6" fill={`url(#showcase-grad-${color})`} stroke="#64748b" strokeWidth="4" />
            <line x1="30" y1="35" x2="70" y2="35" stroke="#ffffff" strokeWidth="2" opacity="0.3" />
          </>
        )}
        {type === 'star' && (
          <>
            <rect x="42" y="5" width="16" height="15" rx="3" fill="#cbd5e1" />
            <path
              d="M 50 15 L 62 38 L 88 38 L 68 55 L 75 80 L 50 65 L 25 80 L 32 55 L 12 38 L 38 38 Z"
              fill={`url(#showcase-grad-${color})`}
              stroke="#64748b"
              strokeWidth="4"
              strokeLinejoin="round"
            />
          </>
        )}
        {type === 'flask' && (
          <>
            <rect x="42" y="10" width="16" height="15" rx="3" fill="#cbd5e1" />
            <path
              d="M 42 25 L 20 78 C 17 85, 23 90, 30 90 L 70 90 C 77 90, 83 85, 80 78 L 58 25 Z"
              fill={`url(#showcase-grad-${color})`}
              stroke="#64748b"
              strokeWidth="4"
              strokeLinejoin="round"
            />
          </>
        )}
        {type === 'skull' && (
          <>
            <rect x="42" y="10" width="16" height="15" rx="3" fill="#cbd5e1" />
            <path
              d="M 30 40 C 30 20, 70 20, 70 40 C 70 52, 62 58, 62 65 L 62 82 C 62 84, 58 88, 50 88 C 42 88, 38 84, 38 82 L 38 65 C 38 58, 30 52, 30 40 Z"
              fill={`url(#showcase-grad-${color})`}
              stroke="#64748b"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <circle cx="43" cy="40" r="4.5" fill="#1e293b" />
            <circle cx="57" cy="40" r="4.5" fill="#1e293b" />
            <path d="M 47 52 L 50 49 L 53 52" stroke="#1e293b" strokeWidth="2.5" fill="none" />
          </>
        )}
      </svg>
    );
  };

  // Open modal to place a potion on shelf
  const handleSlotClick = (index: number) => {
    setSelectedSlotIndex(index);
    const displayedPotion = showcase[index];
    if (displayedPotion) {
      setActivePotionDetails(displayedPotion);
      setShowInventorySelector(false);
    } else {
      setActivePotionDetails(null);
      setShowInventorySelector(true);
    }
  };

  // Confirm placement from inventory to active shelf slot
  const handleSelectPotionForShowcase = (potion: Potion) => {
    if (selectedSlotIndex === null) return;
    onPlaceOnShowcase(potion.id, selectedSlotIndex);
    setActivePotionDetails(potion);
    setShowInventorySelector(false);
    onShowMessage(`[${potion.name}] 가 진열대에 성공적으로 올려졌습니다!`, 'success');
  };

  // Remove potion from showcase
  const handleTakeDownPotion = () => {
    if (selectedSlotIndex === null) return;
    onRemoveFromShowcase(selectedSlotIndex);
    setActivePotionDetails(null);
    setShowInventorySelector(false);
    onShowMessage('진열대에서 물약을 다시 내렸습니다.', 'info');
  };

  // Automatically prepare identical recipe on cutting board (Extract recipe feature)
  const handleExtractRecipe = (potion: Potion) => {
    const costToPrepare = potion.totalCost;
    if (gold < costToPrepare) {
      onShowMessage(`자금이 부족합니다! 이 레시피를 도마에 준비하려면 최소 ${costToPrepare} G 가 필요합니다.`, 'error');
      return;
    }

    onPrepareRecipeToBoard(potion.ingredients, costToPrepare);
    onShowMessage(`[${potion.name}] 의 원래 재료가 즉시 구매되어 도마 작업대 위에 나열되었습니다! 🌿`, 'success');
  };

  return (
    <div id="showcase-room-panel" className="bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl relative">
      {/* Wooden Display shelves layout */}
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-1.5">
          <span className="text-xl">🏛️</span>
          <div>
            <h2 className="text-sm font-bold text-slate-100">명예의 물약 진열대</h2>
            <span className="text-[10px] text-slate-400">만든 물약을 슬롯에 전시하고 제조 노하우를 보관하세요.</span>
          </div>
        </div>
        <div className="text-[10px] bg-slate-950 text-amber-400 px-2 py-1 rounded-md font-bold">
          진열 가능 슬롯: {showcase.filter(p => p !== null).length} / 9
        </div>
      </div>

      {/* Grid Shelf System (3 rows x 3 columns) */}
      <div id="grid-shelf-system" className="grid grid-cols-3 gap-y-7 gap-x-4 bg-slate-950/80 rounded-2xl p-6 border border-slate-850">
        {Array.from({ length: 9 }).map((_, idx) => {
          const potion = showcase[idx];
          const isSelected = selectedSlotIndex === idx;

          return (
            <div key={idx} className="flex flex-col items-center justify-end h-28 relative">
              {/* Shelf potion wrapper */}
              <motion.button
                id={`shelf-slot-${idx}`}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSlotClick(idx)}
                className={`w-16 h-16 rounded-xl flex items-center justify-center cursor-pointer transition-all ${
                  potion
                    ? 'bg-slate-900/50 hover:bg-slate-800 border border-slate-800'
                    : isSelected
                    ? 'bg-amber-500/10 border-2 border-dashed border-amber-400 animate-pulse'
                    : 'bg-slate-900/10 border border-dashed border-slate-800 hover:border-slate-700'
                }`}
              >
                {potion ? (
                  <div className="relative">
                    {renderBottleSVG(potion.color, potion.bottleType, 'w-11 h-11')}
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-slate-950/90 text-[8px] text-slate-300 font-bold px-1 rounded whitespace-nowrap overflow-hidden max-w-[54px] border border-slate-850">
                      {potion.name}
                    </div>
                  </div>
                ) : (
                  <Plus size={16} className="text-slate-600" />
                )}
              </motion.button>

              {/* Individual Shelf Wooden plank decoration beneath columns */}
              <div className="w-full h-2 bg-gradient-to-r from-amber-800 to-amber-950 rounded-full mt-2.5 shadow-md shadow-black/40 border-b border-amber-900" />
            </div>
          );
        })}
      </div>

      {/* Interaction Panel (Contextual Details or Selector) */}
      <AnimatePresence mode="wait">
        {selectedSlotIndex !== null && (
          <motion.div
            id="showcase-detail-panel"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="mt-5 bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-4"
          >
            {/* Header displaying selected slot */}
            <div className="flex justify-between items-center pb-2 border-b border-slate-900 text-xs">
              <span className="text-slate-400 font-bold">진열대 {selectedSlotIndex + 1}번 칸 제어</span>
              <button
                id="btn-close-detail"
                onClick={() => {
                  setSelectedSlotIndex(null);
                  setActivePotionDetails(null);
                  setShowInventorySelector(false);
                }}
                className="text-slate-500 hover:text-slate-300 font-bold"
              >
                닫기
              </button>
            </div>

            {/* CASE A: Potion on display (Recipe viewer & Auto-prepare extraction) */}
            {activePotionDetails && !showInventorySelector && (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  {renderBottleSVG(activePotionDetails.color, activePotionDetails.bottleType, 'w-14 h-14 bg-slate-900/60 p-2 border border-slate-800 rounded-xl')}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                      {activePotionDetails.name}
                      <Sparkles size={13} className="text-amber-400 animate-pulse" />
                    </h3>
                    <div className="text-[11px] text-slate-400 mt-1 flex flex-wrap gap-x-2">
                      <span>가치: <strong className="text-amber-400">{activePotionDetails.totalCost}G</strong></span>
                      <span>•</span>
                      <span>제조 시간: <strong className="text-slate-300">{new Date(activePotionDetails.brewedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Recipe detailed ingredients */}
                <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-850">
                  <span className="text-[10px] text-slate-500 font-bold block mb-1.5 uppercase tracking-wider">
                    📝 보관된 배합 레시피 (Recipe Details)
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {Object.entries(activePotionDetails.ingredients).map(([id, count]) => {
                      if (count === 0) return null;
                      const ing = INGREDIENTS.find((i) => i.id === id);
                      return (
                        <div key={id} className="flex justify-between items-center bg-slate-950 p-1.5 rounded-lg border border-slate-850">
                          <span className="text-xs text-slate-300 flex items-center gap-1">
                            <span>{ing?.emoji}</span>
                            <span>{ing?.name}</span>
                          </span>
                          <span className="text-[11px] text-amber-400 font-extrabold bg-slate-900 px-1.5 py-0.5 rounded">
                            {count}개
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Calculated Effects of potion */}
                <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-850 space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold block mb-1.5 uppercase tracking-wider">
                    ⚡ 보유 약효 세기
                  </span>
                  {Object.entries(activePotionDetails.effects).map(([effect, val]) => (
                    <div key={effect} className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-400">{effect} 효과</span>
                      <span className="text-emerald-400">+{val} Intensity</span>
                    </div>
                  ))}
                </div>

                {/* Core requested button: Extract identical recipe ingredients to board immediately! */}
                <div className="flex gap-2">
                  <button
                    id="btn-extract-recipe"
                    onClick={() => handleExtractRecipe(activePotionDetails)}
                    className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 shadow-lg active:scale-95 cursor-pointer"
                  >
                    <Zap size={14} className="fill-slate-950" />
                    <span>만들기에서 이 물약 재료 즉시 꺼내기 ({activePotionDetails.totalCost}G)</span>
                  </button>

                  <button
                    id="btn-takedown-potion"
                    onClick={handleTakeDownPotion}
                    className="p-2.5 bg-slate-900 border border-red-900/40 hover:bg-red-950 text-red-400 hover:text-red-300 rounded-xl transition-all active:scale-95"
                    title="진열장에서 꺼내 인벤토리로"
                  >
                    <Archive size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* CASE B: Slot is empty, choosing a potion from Player's inventory */}
            {showInventorySelector && (
              <div className="space-y-3">
                <span className="text-[11px] text-slate-400 font-bold block">진열할 물약을 선택하세요:</span>

                <div id="inventory-selector-list" className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {inventory.length === 0 ? (
                    <div className="text-xs text-slate-600 italic text-center py-4">
                      인벤토리에 보관된 물약이 없습니다. 물약을 먼저 제작해주세요!
                    </div>
                  ) : (
                    inventory.map((potion) => (
                      <button
                        id={`select-inv-potion-${potion.id}`}
                        key={potion.id}
                        onClick={() => handleSelectPotionForShowcase(potion)}
                        className="w-full flex items-center justify-between p-2.5 bg-slate-900/80 hover:bg-slate-850 border border-slate-800 rounded-xl transition-colors cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          {renderBottleSVG(potion.color, potion.bottleType, 'w-9 h-9')}
                          <div>
                            <h4 className="text-xs font-bold text-slate-200">{potion.name}</h4>
                            <div className="flex gap-2 text-[9px] text-slate-500 mt-0.5">
                              {Object.keys(potion.effects).map((eff) => (
                                <span key={eff} className="text-emerald-500">
                                  {eff} +{potion.effects[eff]}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-1 rounded font-bold">
                          선택
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
