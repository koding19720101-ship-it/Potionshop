import React, { useState, useEffect } from 'react';
import { Potion } from '../types';
import { INGREDIENTS, blendColors } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Check, RefreshCw, Sparkles, Wand2 } from 'lucide-react';

interface CauldronSectionProps {
  cauldronIngredients: { [id: string]: number };
  setCauldronIngredients: React.Dispatch<React.SetStateAction<{ [id: string]: number }>>;
  onBrewSuccess: (newPotion: Potion) => void;
  onDiscardCauldron: () => void;
}

const FUN_NAMES: { [effect: string]: string[] } = {
  치유: ['할머니표 특효 치유탕', '기적의 붕대맛 포션', '피가 송송 살이 솔솔 비약', '응급처치용 초록 생명수', '우당탕탕 활력 보충제'],
  동결: ['꽁꽁 얼어붙는 만년설 비약', '서리거인의 겨울 숨결', '입 안 가득 빙하기 포션', '절대 영도 시베리아 에센스', '얼음 꽁꽁 맹추위 탕'],
  화염: ['화끈화끈 용암 화염수', '파이어볼의 원액 에센스', '지옥불 불닭맛 비약', '피닉스의 부활 열꽃포션', '화르륵 활활 태우는 묘약'],
  독: ['소리 없는 보라빛 극독액', '전설의 치명적 독니 포션', '마녀의 식인장미 독 에센스', '어둠 속 복어 가시 비약', '만지면 큰일 나는 마법 독수'],
  폭발: ['콰과광 다이너마이트 엘릭서', '불안정한 스파크 스플래시', '폭풍 분출 화약 물약', '성벽 파쇄용 메가 봄 포션', '크레이지 폭탄 요정의 눈물'],
};

export default function CauldronSection({
  cauldronIngredients,
  setCauldronIngredients,
  onBrewSuccess,
  onDiscardCauldron,
}: CauldronSectionProps) {
  const [isBoiling, setIsBoiling] = useState(false);
  const [boilProgress, setBoilProgress] = useState(0);
  const [showNamingModal, setShowNamingModal] = useState(false);

  // Brew specifications (transient state for the naming modal)
  const [customName, setCustomName] = useState('');
  const [selectedBottle, setSelectedBottle] = useState<'round' | 'square' | 'star' | 'flask' | 'skull'>('round');

  const totalIngredients = Object.keys(cauldronIngredients).reduce((sum, key) => sum + (cauldronIngredients[key] || 0), 0);
  const cauldronColor = blendColors(cauldronIngredients);

  // Trigger boiling animation
  const startBoiling = () => {
    if (totalIngredients === 0 || isBoiling) return;
    setIsBoiling(true);
    setBoilProgress(0);
  };

  // Manage auto-boil over time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isBoiling) {
      interval = setInterval(() => {
        setBoilProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsBoiling(false);
            // Suggest a fun name based on primary effect
            const primary = getPrimaryEffectName();
            const suggestions = FUN_NAMES[primary] || ['이상하게 섞인 혼돈의 약수', '정체불명의 수상한 물약'];
            setCustomName(suggestions[Math.floor(Math.random() * suggestions.length)]);
            setShowNamingModal(true);
            return 100;
          }
          return prev + 4; // boil rate
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isBoiling]);

  // Find which effect dominates
  const getPrimaryEffectName = (): string => {
    const counts: { [effect: string]: number } = {};
    Object.keys(cauldronIngredients).forEach((id) => {
      const count = cauldronIngredients[id];
      if (count === 0) return;
      const ing = INGREDIENTS.find((i) => i.id === id);
      if (ing) {
        counts[ing.primaryEffect] = (counts[ing.primaryEffect] || 0) + count;
      }
    });

    let bestEffect = '혼돈';
    let max = 0;
    Object.keys(counts).forEach((effect) => {
      if (counts[effect] > max) {
        max = counts[effect];
        bestEffect = effect;
      }
    });

    return bestEffect;
  };

  // Generate random funny name suggestor
  const rerollName = () => {
    const primary = getPrimaryEffectName();
    const suggestions = FUN_NAMES[primary] || ['수상하고 퀴퀴한 혼합 포션', '망한 연금술사의 한풀이'];
    setCustomName(suggestions[Math.floor(Math.random() * suggestions.length)]);
  };

  // Calculate effects and their strength
  const calculatePotionEffects = (): { [effect: string]: number } => {
    const effects: { [effect: string]: number } = {};
    Object.keys(cauldronIngredients).forEach((id) => {
      const count = cauldronIngredients[id];
      if (count === 0) return;
      const ing = INGREDIENTS.find((i) => i.id === id);
      if (ing) {
        effects[ing.primaryEffect] = (effects[ing.primaryEffect] || 0) + ing.intensity * count;
      }
    });
    return effects;
  };

  // Total cost/worth of ingredients
  const calculateTotalCost = (): number => {
    return Object.keys(cauldronIngredients).reduce((total, id) => {
      const ing = INGREDIENTS.find((i) => i.id === id);
      return total + (ing?.cost || 0) * (cauldronIngredients[id] || 0);
    }, 0);
  };

  // Handle final submission
  const handleCompleteBrew = () => {
    const finalEffects = calculatePotionEffects();
    const totalCost = calculateTotalCost();

    const newPotion: Potion = {
      id: `potion-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: customName.trim() || '이름 없는 물약',
      color: cauldronColor,
      ingredients: { ...cauldronIngredients },
      effects: finalEffects,
      bottleType: selectedBottle,
      totalCost,
      brewedAt: Date.now(),
    };

    onBrewSuccess(newPotion);
    setShowNamingModal(false);
    setCauldronIngredients({});
  };

  // Helper to adjust brightness
  const adjustColorBrightness = (hex: string, percent: number) => {
    let R = parseInt(hex.substring(1, 3), 16);
    let G = parseInt(hex.substring(3, 5), 16);
    let B = parseInt(hex.substring(5, 7), 16);

    R = Math.max(0, Math.min(255, R + (R * percent) / 100));
    G = Math.max(0, Math.min(255, G + (G * percent) / 100));
    B = Math.max(0, Math.min(255, B + (B * percent) / 100));

    const rStr = Math.round(R).toString(16).padStart(2, '0');
    const gStr = Math.round(G).toString(16).padStart(2, '0');
    const bStr = Math.round(B).toString(16).padStart(2, '0');

    return `#${rStr}${gStr}${bStr}`;
  };

  return (
    <div
      id="cauldron-container"
      className="flex flex-col text-[#3e2718] w-full items-center justify-center relative p-2"
    >
      {/* Small floating "솥 비우기" button on top-right of the cauldron area */}
      {totalIngredients > 0 && !isBoiling && (
        <button
          id="btn-discard-cauldron"
          onClick={onDiscardCauldron}
          className="absolute top-0 right-2 text-[10px] text-red-800 bg-red-100/90 hover:bg-red-200 px-2 py-1 rounded border border-red-300 font-bold transition-all shadow-sm cursor-pointer z-20"
        >
          솥 비우기
        </button>
      )}

      {/* DRAG TARGET ZONE wrapper for Cauldron */}
      <div
        id="cauldron-dropzone"
        className="flex flex-col items-center justify-center w-full min-h-[300px] relative transition-all"
      >
        <div className="flex-1 w-full flex flex-col items-center justify-center">
          <div className="flex flex-col items-center w-full">
            {/* Cauldron on Stone Fireplace visual module */}
            <div className="relative w-48 h-36 flex items-center justify-center">
              
              {/* Stone Chimney / Fireplace Arch Base underneath */}
              <div className="absolute bottom-0 w-36 h-12 bg-stone-700 rounded-t-xl border-x-4 border-t-4 border-stone-850 shadow-inner flex items-center justify-center">
                <div className="w-20 h-8 bg-stone-950 rounded-t-lg border-t-2 border-stone-900 relative overflow-hidden" />
              </div>

              {/* Hot charcoal glow inside fireplace */}
              <div className={`absolute bottom-2 w-16 h-4 bg-orange-600 rounded-full blur-md animate-pulse opacity-80 ${totalIngredients > 0 ? '' : 'hidden'}`} />

              {/* Bubbles rising inside liquid */}
              <div className="absolute inset-x-8 top-3 h-14 overflow-hidden pointer-events-none z-10">
                {totalIngredients > 0 && Array.from({ length: isBoiling ? 18 : 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute bg-white/30 rounded-full animate-bounce bottom-0"
                    style={{
                      left: `${15 + i * 8}%`,
                      width: `${Math.random() * 5 + 3}px`,
                      height: `${Math.random() * 5 + 3}px`,
                      animationDuration: `${0.6 + Math.random() * 1.2}s`,
                      animationDelay: `${Math.random() * 0.6}s`,
                      transform: `translateY(-${Math.random() * 25}px)`,
                    }}
                  />
                ))}
              </div>

              {/* Steam waves */}
              <div className="absolute -top-4 inset-x-8 h-10 flex justify-between pointer-events-none z-10">
                {totalIngredients > 0 && Array.from({ length: 4 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [-5, -22, -5],
                      opacity: [0.1, 0.6, 0.1],
                      scale: [0.9, 1.4, 0.9],
                    }}
                    transition={{
                      duration: 1.5 + i * 0.3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="w-6 h-6 rounded-full bg-[#fdf9ee]/40 blur-sm"
                  />
                ))}
              </div>

              {/* Main Cauldron body drawing */}
              <div className="absolute top-1 w-36 h-28 z-10">
                <svg viewBox="0 0 100 80" className="w-full h-full drop-shadow-[0_8px_12px_rgba(0,0,0,0.5)]">
                  {/* Cauldron rim liquid overlay */}
                  <ellipse cx="50" cy="18" rx="36" ry="6" fill="#2d1d12" />
                  <ellipse
                    cx="50"
                    cy="18"
                    rx="34"
                    ry="4.5"
                    fill={totalIngredients > 0 ? cauldronColor : '#1a110a'}
                    className="transition-colors duration-500"
                  />

                  {/* Left/Right metallic handle loop ears */}
                  <circle cx="10" cy="32" r="6" fill="none" stroke="#8c6239" strokeWidth="2.5" />
                  <circle cx="90" cy="32" r="6" fill="none" stroke="#8c6239" strokeWidth="2.5" />

                  {/* Cauldron metal bowl base */}
                  <path
                    d="M 14 18 C 10 50, 20 72, 50 72 C 80 72, 90 50, 86 18 Z"
                    fill="#3e2718"
                    stroke="#22130a"
                    strokeWidth="3.5"
                  />

                  {/* Celtic runic engraving */}
                  <circle cx="50" cy="45" r="11" fill="none" stroke="#5c3e2b" strokeWidth="2" strokeDasharray="4,2" />
                  <circle cx="50" cy="45" r="5" fill="none" stroke="#5c3e2b" strokeWidth="1.5" />

                  {/* Cauldron feet */}
                  <path d="M 22 72 L 15 80 L 20 80 Z" fill="#22130a" />
                  <path d="M 78 72 L 85 80 L 80 80 Z" fill="#22130a" />
                </svg>
              </div>

              {/* Fire Flames under cauldron */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-end gap-1 pointer-events-none z-10">
                {totalIngredients > 0 && (
                  <>
                    <Flame
                      size={isBoiling ? 42 : 24}
                      className={`text-orange-600 fill-orange-500 animate-pulse transition-all duration-300 ${
                        isBoiling ? 'scale-125 text-red-500 fill-red-500' : 'text-orange-600'
                      }`}
                    />
                    <Flame
                      size={isBoiling ? 48 : 28}
                      className={`text-red-600 fill-red-600 animate-bounce transition-all duration-300 ${
                        isBoiling ? 'scale-130 text-yellow-500 fill-yellow-500' : 'text-red-600'
                      }`}
                      style={{ animationDuration: '0.3s' }}
                    />
                    <Flame
                      size={isBoiling ? 42 : 22}
                      className={`text-amber-500 fill-amber-500 animate-pulse transition-all duration-300 ${
                        isBoiling ? 'scale-125 text-orange-400 fill-orange-400' : 'text-amber-500'
                      }`}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Boiling controls */}
            {totalIngredients > 0 && (
              <div className="mt-3 w-full max-w-xs bg-[#ebdcb9] border border-[#8c6239]/40 p-3 rounded-xl shadow-inner relative z-10">
                {isBoiling ? (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] text-[#4a2c11] font-bold">
                      <span className="flex items-center gap-1">
                        <RefreshCw size={12} className="animate-spin text-orange-600" />
                        <span>보글보글 가열 및 대류 배양 중...</span>
                      </span>
                      <span className="font-mono">{boilProgress}%</span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-[#3e2718]/15 h-3 rounded-md overflow-hidden border border-[#8c6239]/20">
                      <motion.div
                        className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500"
                        style={{ width: `${boilProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <motion.button
                    id="btn-trigger-boil"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={startBoiling}
                    className="w-full py-2 bg-gradient-to-r from-[#8c6239] to-[#734d26] hover:from-[#734d26] hover:to-[#5c3e2b] text-[#fbf5e6] font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-md border-2 border-[#4a2c11] cursor-pointer"
                  >
                    <Flame size={12} className="fill-current text-orange-400" />
                    <span>가열하여 물약 끓이기 완성 🧪</span>
                  </motion.button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CURRENT BREWED INGREDIENTS LIST IN CODES */}
      {totalIngredients > 0 && (
        <div className="mt-4 bg-[#fbf5e6] border border-[#8c6239]/30 rounded-2xl p-3.5 shadow-inner">
          <span className="text-[10px] font-bold text-[#5c3e2b] block text-center uppercase tracking-wider mb-2">
            가마솥 액체 배합 에센스 성분
          </span>
          <div className="flex flex-wrap gap-2 justify-center">
            {Object.keys(cauldronIngredients).map((id) => {
              const count = cauldronIngredients[id];
              if (count === 0) return null;
              const ing = INGREDIENTS.find((i) => i.id === id);
              return (
                <div
                  key={id}
                  className="flex items-center gap-1.5 bg-[#ebdcb9] border-2 border-[#8c6239]/40 text-[#4a2c11] text-xs px-3 py-1 rounded-xl font-bold shadow-sm"
                >
                  <span className="text-sm">{ing?.emoji}</span>
                  <span className="font-serif">{ing?.name}</span>
                  <span className="bg-[#4a2c11] text-[#fbf5e6] font-mono font-bold px-1.5 py-0.5 rounded text-[10px]">
                    x{count}개분
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* NAMING AND BOTTLE SELECTOR MODAL */}
      <AnimatePresence>
        {showNamingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.65 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              id="naming-modal"
              className="bg-[#ebdcb9] border-8 border-[#4a2c11] w-full max-w-md rounded-3xl p-6 shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto text-[#3e2718]"
            >
              <div className="text-center mb-5 pb-3 border-b border-[#8c6239]/20">
                <span className="text-5xl animate-bounce inline-block">🏺</span>
                <h2 className="text-xl font-bold text-[#4a2c11] mt-2">연금술 제조 완료!</h2>
                <p className="text-xs text-[#7a5230]">물약의 이름을 지어주고 완제품 유리병에 정성스럽게 밀봉 포장하세요.</p>
              </div>

              {/* Name input */}
              <div className="space-y-1.5 mb-4">
                <label className="text-xs font-bold text-[#4a2c11] flex justify-between">
                  <span>물약 이름 마킹:</span>
                  <button
                    id="btn-reroll-name"
                    onClick={rerollName}
                    className="text-[10px] text-amber-900 hover:text-amber-800 font-bold flex items-center gap-1 underline"
                  >
                    이름 랜덤 작명하기 🪄
                  </button>
                </label>
                <input
                  id="potion-name-input"
                  type="text"
                  maxLength={25}
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-[#fbf5e6] text-[#4a2c11] border-2 border-[#8c6239] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#4a2c11] transition-colors shadow-inner"
                  placeholder="예: 기적의 약초 치유탕"
                />
              </div>

              {/* Bottle Shape selector */}
              <div className="space-y-2 mb-5">
                <label className="text-xs font-bold text-[#4a2c11] block">완제품 물약 병 형태:</label>
                <div id="bottle-shape-selector" className="grid grid-cols-5 gap-2">
                  {(['round', 'square', 'star', 'flask', 'skull'] as const).map((type) => (
                    <button
                      id={`bottle-select-${type}`}
                      key={type}
                      onClick={() => setSelectedBottle(type)}
                      className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all cursor-pointer ${
                        selectedBottle === type
                          ? 'bg-[#ca8a04]/20 border-[#ca8a04] text-[#ca8a04] font-bold'
                          : 'bg-[#fbf5e6] border-[#8c6239]/30 text-amber-950/40 hover:border-[#8c6239]'
                      }`}
                    >
                      <svg viewBox="0 0 100 100" className="w-10 h-10">
                        <defs>
                          <radialGradient id={`liquid-grad-${type}`} cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                            <stop offset="100%" stopColor={cauldronColor} />
                          </radialGradient>
                        </defs>
                        {type === 'round' && (
                          <>
                            <rect x="42" y="10" width="16" height="15" rx="3" fill="#8c6239" opacity="0.6" />
                            <circle cx="50" cy="55" r="30" fill={`url(#liquid-grad-${type})`} stroke="#4a2e1b" strokeWidth="4" />
                            <ellipse cx="50" cy="35" rx="20" ry="5" fill="#ffffff" opacity="0.2" />
                          </>
                        )}
                        {type === 'square' && (
                          <>
                            <rect x="42" y="10" width="16" height="15" rx="3" fill="#8c6239" opacity="0.6" />
                            <rect x="22" y="25" width="56" height="60" rx="6" fill={`url(#liquid-grad-${type})`} stroke="#4a2e1b" strokeWidth="4" />
                            <line x1="30" y1="35" x2="70" y2="35" stroke="#ffffff" strokeWidth="2" opacity="0.2" />
                          </>
                        )}
                        {type === 'star' && (
                          <>
                            <rect x="42" y="5" width="16" height="15" rx="3" fill="#8c6239" opacity="0.6" />
                            <path
                              d="M 50 15 L 62 38 L 88 38 L 68 55 L 75 80 L 50 65 L 25 80 L 32 55 L 12 38 L 38 38 Z"
                              fill={`url(#liquid-grad-${type})`}
                              stroke="#4a2e1b"
                              strokeWidth="4"
                              strokeLinejoin="round"
                            />
                          </>
                        )}
                        {type === 'flask' && (
                          <>
                            <rect x="42" y="10" width="16" height="15" rx="3" fill="#8c6239" opacity="0.6" />
                            <path
                              d="M 42 25 L 20 78 C 17 85, 23 90, 30 90 L 70 90 C 77 90, 83 85, 80 78 L 58 25 Z"
                              fill={`url(#liquid-grad-${type})`}
                              stroke="#4a2e1b"
                              strokeWidth="4"
                              strokeLinejoin="round"
                            />
                          </>
                        )}
                        {type === 'skull' && (
                          <>
                            <rect x="42" y="10" width="16" height="15" rx="3" fill="#8c6239" opacity="0.6" />
                            <path
                              d="M 30 40 C 30 20, 70 20, 70 40 C 70 52, 62 58, 62 65 L 62 82 C 62 84, 58 88, 50 88 C 42 88, 38 84, 38 82 L 38 65 C 38 58, 30 52, 30 40 Z"
                              fill={`url(#liquid-grad-${type})`}
                              stroke="#4a2e1b"
                              strokeWidth="4"
                              strokeLinejoin="round"
                            />
                            <circle cx="43" cy="40" r="4.5" fill="#3e2718" />
                            <circle cx="57" cy="40" r="4.5" fill="#3e2718" />
                          </>
                        )}
                      </svg>
                      <span className="text-[9px] font-bold mt-1 tracking-wider uppercase">
                        {type === 'round' && '둥근병'}
                        {type === 'square' && '사각병'}
                        {type === 'star' && '별 모양'}
                        {type === 'flask' && '플라스크'}
                        {type === 'skull' && '해골병'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Effects description panel */}
              <div className="bg-[#fbf5e6] rounded-2xl p-3.5 border border-[#8c6239]/30 mb-5 text-xs space-y-2.5">
                <span className="text-[10px] font-bold text-[#5c3e2b] block uppercase tracking-wider">
                  물약 효능 감정서
                </span>

                <div className="space-y-1.5">
                  {Object.entries(calculatePotionEffects()).map(([effect, val]) => (
                    <div key={effect} className="flex justify-between items-center text-[#4a2c11] font-semibold">
                      <span className="flex items-center gap-1">
                        <Sparkles size={11} className="text-emerald-700" />
                        <span>효과 성질: <strong className="font-extrabold">{effect}</strong></span>
                      </span>
                      <span className="text-emerald-700 font-extrabold font-mono">+{val} Intensity</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#8c6239]/20 pt-2 flex justify-between text-[11px] font-bold text-[#7a5230]">
                  <span>가치 가격:</span>
                  <span className="text-[#8c6239] font-bold">{calculateTotalCost()} G</span>
                </div>
              </div>

              {/* Modal footer buttons */}
              <div className="flex gap-2">
                <button
                  id="btn-confirm-brew"
                  onClick={handleCompleteBrew}
                  className="flex-1 py-3 bg-[#8c6239] hover:bg-[#734d26] text-[#fdf9ee] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md border-2 border-[#4a2c11] cursor-pointer active:scale-95 transition-all"
                >
                  <Check size={14} />
                  <span>마개 밀봉 후 가방 보관하기</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
