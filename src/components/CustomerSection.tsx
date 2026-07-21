import React, { useState, useEffect } from 'react';
import { Customer, Potion } from '../types';
import { INGREDIENTS, calculatePotionPrice } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, User, Sparkles, AlertCircle, ArrowRight, ThumbsUp, ThumbsDown, CheckCircle, XCircle } from 'lucide-react';

interface CustomerSectionProps {
  activeCustomer: Customer | null;
  customerQueue: Customer[];
  onServeCustomer: (potionId: string) => Promise<{ success: boolean; dies: boolean; earnedGold: number; feedback: string; decision?: 'drink' | 'refuse' } | null>;
  onGenerateCustomer: () => void;
  inventory: Potion[];
  gold: number;
}

export default function CustomerSection({
  activeCustomer,
  customerQueue,
  onServeCustomer,
  onGenerateCustomer,
  inventory,
  gold,
}: CustomerSectionProps) {
  const [selectedPotionId, setSelectedPotionId] = useState<string>('');
  const [drinkState, setDrinkState] = useState<'idle' | 'drinking' | 'reacted' | 'fail'>('idle');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [earnedGoldAmount, setEarnedGoldAmount] = useState(0);
  const [servedPotion, setServedPotion] = useState<Potion | null>(null);
  const [customerDied, setCustomerDied] = useState<boolean>(false);

  // Reset states when active customer changes
  useEffect(() => {
    setSelectedPotionId('');
    setDrinkState('idle');
    setFeedbackMsg('');
    setEarnedGoldAmount(0);
    setServedPotion(null);
    setCustomerDied(false);
  }, [activeCustomer]);

  // Handle Offer Potion action
  const handleOfferPotion = async () => {
    if (!selectedPotionId || !activeCustomer) return;

    const potion = inventory.find((p) => p.id === selectedPotionId);
    if (potion) {
      setServedPotion(potion);
    }

    setDrinkState('drinking');

    const startTime = Date.now();

    try {
      const result = await onServeCustomer(selectedPotionId);
      
      // Ensure at least 1.5 seconds of "drinking/review" animation
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 1500 - elapsedTime);
      
      await new Promise((resolve) => setTimeout(resolve, remainingTime));

      if (result) {
        setEarnedGoldAmount(result.earnedGold);
        setFeedbackMsg(result.feedback);
        setCustomerDied(result.dies);
        
        if (result.decision === 'refuse') {
          setDrinkState('fail');
        } else if (result.dies) {
          setDrinkState('fail');
        } else if (result.success) {
          setDrinkState('reacted');
        } else {
          setDrinkState('fail');
        }
      } else {
        setDrinkState('idle');
      }
    } catch (e) {
      console.error(e);
      setDrinkState('idle');
    }
  };

  const getDynamicReactionText = () => {
    if (!servedPotion || !activeCustomer) return '';

    const effects = servedPotion.effects;

    if (customerDied) {
      const deathCauses: string[] = [];
      if ((effects['독'] || 0) > 0) {
        deathCauses.push("☠️ 보라색 맹독이 온몸을 마비시켜 거품을 물고 사망했습니다");
      }
      if ((effects['화염'] || 0) > 0) {
        deathCauses.push("🔥 고열의 화염이 전신을 감싸며 새까맣게 타죽었습니다");
      }
      if ((effects['폭발'] || 0) > 0) {
        deathCauses.push("💥 마법 배 속 대폭발로 공중분해되어 폭사했습니다");
      }
      return `[사망 경고!] 손님이 물약을 들이켜자마자 ${deathCauses.join(" 동시에 ")}... 🪦`;
    }

    const activeEffects = Object.entries(effects)
      .filter(([_, val]) => (val as number) > 0)
      .map(([key, _]) => key);

    if (activeEffects.length === 0) {
      return "음... 아무 맛도 효과도 느껴지지 않는 그냥 물이잖아?! 돈을 더 줄 수는 없네.";
    }

    const phrases: string[] = [];
    if ((effects['치유'] || 0) > 0) {
      phrases.push("상처 부위에 포근한 초록 온기가 감돌며 깨끗하게 치유되고(💚)");
    }
    if ((effects['동결'] || 0) > 0) {
      phrases.push("손발 끝부터 뼛속까지 절대영도의 얼음 송곳이 박히듯 몸이 꽁꽁 얼어붙고(❄️)");
    }
    if ((effects['화염'] || 0) > 0) {
      phrases.push("목구멍에서부터 뜨거운 화염이 마구 뿜어져 나와 온몸이 활활 타오르고(🔥)");
    }
    if ((effects['독'] || 0) > 0) {
      phrases.push("혈관을 타고 보라색 맹독이 퍼지면서 피가 썩어 들어가 죽을 것 같고(☠️)");
    }
    if ((effects['폭발'] || 0) > 0) {
      phrases.push("마치 마법 수류탄을 삼킨 것처럼 배 속에서 콰과과광 폭발이 일어나(💥)");
    }

    if (phrases.length === 1) {
      if (drinkState === 'reacted') {
        return `${activeCustomer.reactionText} (${phrases[0]} 정말 완벽한 조합이오!)`;
      } else {
        return `으윽! 내가 원한 정도는 아니었지만... ${phrases[0]} 몸이 가만히 있질 못하는군!`;
      }
    } else {
      const combined = phrases.join(" 동시에 ");
      if (drinkState === 'reacted') {
        return `${activeCustomer.reactionText} 게다가 이 무슨 해괴한 혼합물인가! ${combined} 복합 작용이 대폭발하는구나!!!`;
      } else {
        return `으아악! 물약 요구 조건도 맞지 않는데... ${combined} 복합 작용으로 혼이 완전히 비정상으로 빠져나간다!!!`;
      }
    }
  };

  // Skip / wait for next customer
  const handleNextCustomer = () => {
    onGenerateCustomer();
  };

  const selectedPotion = inventory.find((p) => p.id === selectedPotionId);

  // Check if a potion matches customer requirements
  const checkRequirements = (potion: Potion) => {
    if (!activeCustomer) return { matchesEffect: false, matchesIntensity: false };
    const effectVal = potion.effects[activeCustomer.targetEffect] || 0;
    return {
      matchesEffect: effectVal > 0,
      matchesIntensity: effectVal >= activeCustomer.minIntensity,
    };
  };

  // SVG representation helper for potion bottle shapes on scale/counter
  const renderScalePotionSVG = (color: string, type: string, size = 'w-14 h-14') => {
    return (
      <svg viewBox="0 0 100 100" className={`${size} drop-shadow-lg`}>
        <defs>
          <radialGradient id={`customer-scale-grad-${color}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="100%" stopColor={color} />
          </radialGradient>
        </defs>
        {type === 'round' && (
          <>
            <rect x="42" y="10" width="16" height="15" rx="3" fill="#8b5a2b" stroke="#3e2723" strokeWidth="2" />
            <circle cx="50" cy="55" r="30" fill={`url(#customer-scale-grad-${color})`} stroke="#4a2e1b" strokeWidth="4" />
            <ellipse cx="50" cy="35" rx="20" ry="5" fill="#ffffff" opacity="0.4" />
          </>
        )}
        {type === 'square' && (
          <>
            <rect x="42" y="10" width="16" height="15" rx="3" fill="#8b5a2b" stroke="#3e2723" strokeWidth="2" />
            <rect x="22" y="25" width="56" height="60" rx="6" fill={`url(#customer-scale-grad-${color})`} stroke="#4a2e1b" strokeWidth="4" />
            <line x1="30" y1="35" x2="70" y2="35" stroke="#ffffff" strokeWidth="2" opacity="0.4" />
          </>
        )}
        {type === 'star' && (
          <>
            <rect x="42" y="5" width="16" height="15" rx="3" fill="#8b5a2b" stroke="#3e2723" strokeWidth="2" />
            <path
              d="M 50 15 L 62 38 L 88 38 L 68 55 L 75 80 L 50 65 L 25 80 L 32 55 L 12 38 L 38 38 Z"
              fill={`url(#customer-scale-grad-${color})`}
              stroke="#4a2e1b"
              strokeWidth="4"
              strokeLinejoin="round"
            />
          </>
        )}
        {type === 'flask' && (
          <>
            <rect x="42" y="10" width="16" height="15" rx="3" fill="#8b5a2b" stroke="#3e2723" strokeWidth="2" />
            <path
              d="M 42 25 L 20 78 C 17 85, 23 90, 30 90 L 70 90 C 77 90, 83 85, 80 78 L 58 25 Z"
              fill={`url(#customer-scale-grad-${color})`}
              stroke="#4a2e1b"
              strokeWidth="4"
              strokeLinejoin="round"
            />
          </>
        )}
        {type === 'skull' && (
          <>
            <rect x="42" y="10" width="16" height="15" rx="3" fill="#8b5a2b" stroke="#3e2723" strokeWidth="2" />
            <path
              d="M 30 40 C 30 20, 70 20, 70 40 C 70 52, 62 58, 62 65 L 62 82 C 62 84, 58 88, 50 88 C 42 88, 38 84, 38 82 L 38 65 C 38 58, 30 52, 30 40 Z"
              fill={`url(#customer-scale-grad-${color})`}
              stroke="#4a2e1b"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <circle cx="43" cy="40" r="4.5" fill="#1e293b" />
            <circle cx="57" cy="40" r="4.5" fill="#1e293b" />
          </>
        )}
      </svg>
    );
  };

  // Remaining queue excluding active (indices 1, 2, 3)
  const waitingQueue = customerQueue.slice(1, 4);

  return (
    <div
      id="customer-room-panel"
      className="bg-gradient-to-b from-[#3a271d] via-[#2f1f17] to-[#1e130e] border-4 border-[#1c110a] rounded-3xl p-5 shadow-2xl relative min-h-[580px] flex flex-col justify-between overflow-hidden"
    >
      {/* Dynamic particles / reaction overlays inside shop */}
      <AnimatePresence>
        {(drinkState === 'reacted' || drinkState === 'fail') && activeCustomer && servedPotion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 pointer-events-none rounded-2xl overflow-hidden flex items-center justify-center bg-black/40"
          >
            {/* 1. HEALING PARTICLE OVERLAY */}
            {(servedPotion.effects['치유'] || 0) > 0 && (
              <div className="absolute inset-0 bg-emerald-500/5 flex flex-col items-center justify-center pointer-events-none">
                {Array.from({ length: 15 }).map((_, i) => (
                  <motion.div
                    key={`heal-${i}`}
                    initial={{ y: 350, x: Math.random() * 320, scale: 0.5, opacity: 1 }}
                    animate={{ y: -50, opacity: 0, scale: 1.5 }}
                    transition={{ duration: 1.5 + Math.random(), repeat: Infinity }}
                    className="absolute text-lg text-emerald-400 font-bold"
                  >
                    ✦
                  </motion.div>
                ))}
              </div>
            )}

            {/* 2. FREEZING PARTICLE OVERLAY */}
            {(servedPotion.effects['동결'] || 0) > 0 && (
              <div className="absolute inset-0 bg-sky-500/5 flex flex-col items-center justify-center pointer-events-none">
                {Array.from({ length: 15 }).map((_, i) => (
                  <motion.div
                    key={`freeze-${i}`}
                    initial={{ y: 350, x: Math.random() * 320, scale: 0.5, opacity: 1 }}
                    animate={{ y: -50, opacity: 0, scale: 1.5, rotate: 360 }}
                    transition={{ duration: 1.5 + Math.random(), repeat: Infinity }}
                    className="absolute text-lg text-sky-300 font-bold"
                  >
                    ❄️
                  </motion.div>
                ))}
              </div>
            )}

            {/* 3. FIRE PARTICLE OVERLAY */}
            {(servedPotion.effects['화염'] || 0) > 0 && (
              <div className="absolute inset-0 bg-rose-500/5 flex flex-col items-center justify-center pointer-events-none">
                {Array.from({ length: 15 }).map((_, i) => (
                  <motion.div
                    key={`fire-${i}`}
                    initial={{ y: 350, x: Math.random() * 320, scale: 0.5, opacity: 1 }}
                    animate={{ y: -50, opacity: 0, scale: 1.5, rotate: Math.random() * 90 }}
                    transition={{ duration: 1.2 + Math.random(), repeat: Infinity }}
                    className="absolute text-lg text-rose-500 font-bold"
                  >
                    🔥
                  </motion.div>
                ))}
              </div>
            )}

            {/* 4. POISON PARTICLE OVERLAY */}
            {(servedPotion.effects['독'] || 0) > 0 && (
              <div className="absolute inset-0 bg-purple-500/5 flex flex-col items-center justify-center pointer-events-none">
                {Array.from({ length: 15 }).map((_, i) => (
                  <motion.div
                    key={`poison-${i}`}
                    initial={{ y: 350, x: Math.random() * 320, scale: 0.5, opacity: 1 }}
                    animate={{ y: -50, opacity: 0, scale: 1.5, rotate: 360 }}
                    transition={{ duration: 1.6 + Math.random(), repeat: Infinity }}
                    className="absolute text-lg text-purple-400 font-bold"
                  >
                    🧪
                  </motion.div>
                ))}
              </div>
            )}

            {/* 5. EXPLOSION PARTICLE OVERLAY */}
            {(servedPotion.effects['폭발'] || 0) > 0 && (
              <div className="absolute inset-0 bg-amber-500/10 flex flex-col items-center justify-center pointer-events-none">
                {Array.from({ length: 20 }).map((_, i) => {
                  const angle = (i / 20) * Math.PI * 2 + (Math.random() * 0.2);
                  const radius = 60 + Math.random() * 100;
                  return (
                    <motion.div
                      key={`explode-${i}`}
                      initial={{ x: 0, y: 0, scale: 0.1, opacity: 1 }}
                      animate={{ 
                        x: Math.cos(angle) * radius, 
                        y: Math.sin(angle) * radius, 
                        scale: 2.2, 
                        opacity: 0,
                        rotate: 720
                      }}
                      transition={{ duration: 0.8 + Math.random() * 0.4, repeat: Infinity }}
                      className="absolute text-xl"
                    >
                      {Math.random() > 0.5 ? '💥' : '🔥'}
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Floating text badge indicating what the customer suffered */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-40 flex flex-col items-center gap-1.5 pointer-events-auto">
              <div className="bg-slate-900/95 border-2 border-amber-500/60 text-amber-200 px-4 py-2 rounded-2xl shadow-2xl flex flex-col items-center text-center max-w-[280px]">
                <span className="text-[10px] uppercase font-black tracking-wider text-amber-400/80">복합 마법 작용 감지</span>
                <div className="flex flex-wrap gap-1 mt-1 justify-center">
                  {Object.entries(servedPotion.effects).map(([effectName, effectVal]) => {
                    const valNum = effectVal as number;
                    if (valNum <= 0) return null;
                    let emoji = '🔮';
                    let colorClass = 'bg-slate-800 text-slate-200 border-slate-600';
                    if (effectName === '치유') { emoji = '💚'; colorClass = 'bg-emerald-950 text-emerald-300 border-emerald-800'; }
                    if (effectName === '동결') { emoji = '❄️'; colorClass = 'bg-sky-950 text-sky-300 border-sky-800'; }
                    if (effectName === '화염') { emoji = '🔥'; colorClass = 'bg-rose-950 text-rose-300 border-rose-800'; }
                    if (effectName === '독') { emoji = '☠️'; colorClass = 'bg-purple-950 text-purple-300 border-purple-800'; }
                    if (effectName === '폭발') { emoji = '💥'; colorClass = 'bg-amber-950 text-amber-300 border-amber-800'; }

                    return (
                      <span key={effectName} className={`text-[8px] font-black px-1.5 py-0.5 rounded border flex items-center gap-0.5 ${colorClass}`}>
                        <span>{emoji}</span>
                        <span>{effectName} +{valNum}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. SHOP WINDOW & BACKGROUND QUEUE PATH (Isometric feel) */}
      <div className="relative h-44 w-full bg-[#2a1b12]/60 rounded-2xl border-2 border-[#1c120b] overflow-hidden p-3 flex flex-col justify-between">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-950/10 to-transparent pointer-events-none" />
        
        {/* Subtle stone floor lane graphic */}
        <div className="absolute bottom-4 inset-x-0 h-4 bg-[#412a1d] border-y border-[#1f130c] transform -skew-x-12 opacity-80" />

        <div className="flex justify-between items-start z-10">
          <div>
            <h2 className="text-xs font-black text-amber-100/90 tracking-wide flex items-center gap-1">
              <span>🏰</span> 접객실 대기열 (Potion Craft Style)
            </h2>
            <p className="text-[9px] text-amber-200/50">방문한 모험가들이 상점 매대 앞에 줄지어 서 있습니다.</p>
          </div>
          <div className="bg-[#1f130c] text-amber-400 px-2.5 py-0.5 rounded-full text-[9px] border border-[#3c2518] font-mono">
            대기 중인 손님: {customerQueue.length}명
          </div>
        </div>

        {/* PHYSICAL 2.5D QUEUE LINE OF CHARACTERS */}
        <div className="relative h-20 flex items-end justify-end gap-6 pr-8 z-10">
          <AnimatePresence>
            {waitingQueue.map((cust, idx) => {
              // Staggered size & opacity to create depth (closer is index 0 of waitingQueue, which is queue index 1)
              const depthScale = 1 - idx * 0.15; // e.g., 1.0, 0.85, 0.7
              const depthOpacity = 1 - idx * 0.25; // e.g., 1.0, 0.75, 0.5
              const depthTranslateX = idx * 24;

              return (
                <motion.div
                  key={cust.id}
                  initial={{ opacity: 0, x: 50, scale: 0.5 }}
                  animate={{ opacity: depthOpacity, x: -depthTranslateX, scale: depthScale }}
                  exit={{ opacity: 0, x: -50, scale: 0.5 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center justify-end"
                >
                  {/* Bouncing Dialogue / Thought Preview Bubble */}
                  <div className="bg-[#ebdcc2] border border-[#5c3e2b] rounded-lg px-1.5 py-0.5 text-[8px] text-[#422917] font-bold mb-1 shadow-sm whitespace-nowrap animate-pulse">
                    {cust.targetEffect} 필요..
                  </div>

                  {/* Character Token */}
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center text-2xl border-2 border-[#5c3e2b] shadow-md ${cust.avatarColor} ring-2 ring-[#1f130c]/40`}>
                    {cust.avatarEmoji}
                  </div>
                  
                  {/* Miniature shadow */}
                  <div className="w-8 h-1 bg-black/40 rounded-full mt-0.5" />
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Empty bench hint if no one behind */}
          {waitingQueue.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-amber-200/20 text-[10px] font-bold">
              뒤에 대기 중인 손님이 없습니다.
            </div>
          )}
        </div>
      </div>

      {/* 2. ACTIVE CUSTOMER IN THE CENTER & MEDIEVAL SPEECH SCROLL */}
      <div className="my-4 flex flex-col md:flex-row items-center gap-4 relative z-10">
        
        {/* Active Customer Character Token */}
        <div className="flex flex-col items-center shrink-0">
          <AnimatePresence mode="wait">
            {activeCustomer ? (
              <motion.div
                key={activeCustomer.id}
                initial={{ scale: 0.8, opacity: 0, y: 15 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  y: drinkState === 'drinking'
                    ? [0, -12, 0, -12, 0]
                    : drinkState === 'reacted'
                    ? [0, -8, 0, -8, 0]
                    : [0, -4, 0],
                }}
                exit={{ scale: 0.8, opacity: 0, y: -15 }}
                transition={{
                  y: drinkState === 'drinking' || drinkState === 'reacted'
                    ? { duration: 1.5, repeat: Infinity }
                    : { repeat: Infinity, duration: 4, ease: "easeInOut" }
                }}
                className="flex flex-col items-center"
              >
                {/* Vintage wooden framed avatar */}
                <div className={`w-28 h-28 md:w-32 md:h-32 rounded-full flex items-center justify-center text-6xl border-4 border-[#3e2311] shadow-2xl relative ${customerDied ? 'bg-slate-900' : activeCustomer.avatarColor} ring-4 ring-[#8c654f]/30 overflow-hidden`}>
                  {/* Subtle inner background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/10" />
                  <span className="relative z-10 select-none animate-pulse">
                    {customerDied ? '💀' : activeCustomer.avatarEmoji}
                  </span>
                </div>
                
                {/* Character Label Badge */}
                <div className={`mt-2 ${customerDied ? 'bg-red-950 border-red-800' : 'bg-[#4a2e1b] border-[#8c654f]'} border-2 px-3 py-0.5 rounded-md text-[10px] font-black shadow-md uppercase tracking-wider`}>
                  <span className={customerDied ? 'text-red-400 line-through' : 'text-[#f7eedb]'}>
                    {customerDied ? `고인 ${activeCustomer.name}` : activeCustomer.name}
                  </span>
                </div>
                <div className="text-[8px] text-amber-200/50 mt-1">
                  {customerDied ? '⚠️ 마법 물약 급성 부작용으로 급사함' : activeCustomer.story}
                </div>
              </motion.div>
            ) : (
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-dashed border-amber-950/40 flex items-center justify-center text-4xl opacity-30">
                🚪
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Scroll Speech Bubble (양필지 두루마리 스타일) */}
        <div className="flex-1 w-full">
          <AnimatePresence mode="wait">
            {activeCustomer ? (
              <motion.div
                key={activeCustomer.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`border-4 rounded-3xl p-4 shadow-xl relative min-h-[100px] flex flex-col justify-between transition-colors ${
                  customerDied
                    ? 'bg-red-50/95 border-red-800 text-red-950'
                    : 'bg-[#fdf9ee] border-[#8c6245] text-amber-950'
                }`}
              >
                {/* Left/Right scroll pin rollers graphics */}
                <div className="absolute -left-2 top-4 w-3 h-12 bg-[#8c6245] rounded-full hidden md:block" />
                <div className="absolute -right-2 top-4 w-3 h-12 bg-[#8c6245] rounded-full hidden md:block" />

                <div className="text-xs font-serif leading-relaxed text-[#4a2a16]">
                  {drinkState === 'reacted' ? (
                    <p className="font-extrabold text-[#115e59] text-sm animate-pulse">
                      &quot;{feedbackMsg}&quot;
                    </p>
                  ) : drinkState === 'fail' ? (
                    <p className="font-extrabold text-red-800">
                      &quot;{feedbackMsg}&quot;
                    </p>
                  ) : (
                    <p className="italic font-semibold">&quot;{activeCustomer.dialog}&quot;</p>
                  )}
                </div>

                {/* Requirement indicators at the bottom of speech scroll */}
                <div className="mt-3 pt-2.5 border-t border-[#8c6245]/20 flex flex-wrap items-center justify-between gap-1 text-[10px]">
                  <div className="flex items-center gap-1 font-bold">
                    <span className="text-[#8c6245]">원하는 물약:</span>
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded font-black">
                      {activeCustomer.targetEffect} 물약
                    </span>
                    <span className="bg-[#4a2e1b] text-[#fdf9ee] px-1.5 py-0.5 rounded text-[9px]">
                      세기 +{activeCustomer.minIntensity} 이상
                    </span>
                  </div>
                  <div className="text-amber-800 font-bold">
                    예산율: <span className="underline font-black">재료값 x{activeCustomer.maxBudget}</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-[#2a1b12]/30 border-2 border-dashed border-[#422c1d]/60 rounded-2xl p-6 text-center text-xs text-amber-200/30">
                현재 손님이 없습니다. 다음 손님을 호출하여 약초 물약을 판매해 돈을 버세요.
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 3. THE WOODEN COUNTER & DYNAMIC SCALE (협상 매대와 저울) */}
      <div className="bg-[#4d3222] border-t-8 border-[#342116] border-b-4 border-[#1f130b] h-32 -mx-5 px-6 relative z-20 flex items-center justify-between shadow-inner">
        {/* Wood textures grains */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-100 via-transparent to-black pointer-events-none" />

        {/* THE GOLDEN SCALE (저울 그래픽) */}
        <div className="flex items-center gap-4 relative z-10 w-full justify-between">
          <div className="flex items-center gap-2">
            <div className="relative w-24 h-24 flex items-center justify-center">
              {/* Scale Stand Pillar */}
              <div className="absolute bottom-1 w-3 h-16 bg-amber-600 border border-amber-950 rounded-sm" />
              <div className="absolute bottom-1 w-10 h-2 bg-amber-800 border border-amber-950 rounded-sm" />

              {/* Balance Bar - Rotates or Tilts if a potion is placed! */}
              <motion.div
                animate={{ rotate: selectedPotionId ? -15 : 0 }}
                transition={{ type: 'spring', stiffness: 80 }}
                className="absolute top-8 w-20 h-1 bg-amber-500 flex justify-between px-1"
              >
                {/* Left Pan cord */}
                <div className="w-0.5 h-10 bg-amber-700/80 absolute -left-0.5 top-1 origin-top" />
                {/* Right Pan cord */}
                <div className="w-0.5 h-10 bg-amber-700/80 absolute -right-0.5 top-1 origin-top" />

                {/* Left Plate (Holds potion) */}
                <motion.div
                  animate={{ y: selectedPotionId ? 8 : 0, rotate: selectedPotionId ? 15 : 0 }}
                  className="absolute -left-3 top-10 w-7 h-1 bg-amber-600 border border-amber-950 rounded-full flex items-center justify-center"
                >
                  {/* Miniature potion rendered on plate */}
                  {selectedPotion && (
                    <div className="absolute -top-11">
                      {renderScalePotionSVG(selectedPotion.color, selectedPotion.bottleType, 'w-10 h-10')}
                    </div>
                  )}
                </motion.div>

                {/* Right Plate (Holds weights/gold) */}
                <motion.div
                  animate={{ y: selectedPotionId ? -8 : 0, rotate: selectedPotionId ? 15 : 0 }}
                  className="absolute -right-3 top-10 w-7 h-1 bg-amber-600 border border-amber-950 rounded-full flex items-center justify-center"
                >
                  {selectedPotionId && (
                    <span className="absolute -top-4 text-[9px] font-black text-amber-200 animate-pulse">🪙</span>
                  )}
                </motion.div>
              </motion.div>
            </div>

            {/* Counter Text label */}
            <div className="hidden sm:block">
              <span className="text-[10px] text-amber-100/40 uppercase font-black tracking-wider block">거래 전용 저울</span>
              <span className="text-xs font-bold text-amber-100/90">
                {selectedPotionId ? '물약 감정 및 흥정 중' : '물약을 선택해 저울에 올리세요'}
              </span>
            </div>
          </div>

          {/* SERVING / NEGOTIATION ACTIONS */}
          <div className="flex flex-col gap-1.5 shrink-0 max-w-[240px]">
            {activeCustomer && drinkState === 'idle' && (
              <>
                <button
                  id="btn-offer-potion"
                  disabled={!selectedPotionId}
                  onClick={handleOfferPotion}
                  className={`px-5 py-2.5 rounded-xl font-serif font-black text-xs flex items-center justify-center gap-1.5 border-2 shadow-lg transition-all active:scale-95 cursor-pointer ${
                    selectedPotionId
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 border-amber-950 shadow-amber-500/10'
                      : 'bg-stone-800 text-stone-500 border-stone-900 cursor-not-allowed shadow-none'
                  }`}
                >
                  <ThumbsUp size={13} className="fill-current" />
                  <span>물약 건네고 흥정하기</span>
                </button>

                <button
                  id="btn-skip-customer"
                  onClick={handleNextCustomer}
                  className="px-5 py-1.5 bg-[#311b0e] hover:bg-[#4a2e1b] text-amber-300/80 hover:text-amber-300 text-[10px] font-black rounded-lg border border-[#543b2a] transition-all active:scale-95"
                >
                  <span>그냥 돌려보내기</span>
                </button>
              </>
            )}

            {/* DRINKING IN PROGRESS */}
            {drinkState === 'drinking' && (
              <div className="px-5 py-3 bg-[#1f130c] rounded-xl border border-[#3c2518] text-center flex items-center gap-2">
                <span className="text-lg animate-spin" style={{ animationDuration: '3s' }}>🧪</span>
                <span className="text-[10px] font-bold text-amber-200">꿀꺽꿀꺽... 물약 마시는 중</span>
              </div>
            )}

            {/* RESULTS DISMISS OVERLAY BUTTONS */}
            {(drinkState === 'reacted' || drinkState === 'fail') && (
              <div className="flex flex-col gap-1 bg-[#1c110a] p-2 rounded-xl border border-[#3c2518]">
                <div className="flex items-center justify-between text-[10px] px-1 pb-1 border-b border-[#3c2518] gap-4">
                  <span className="text-amber-400/80">정산된 가격:</span>
                  <span className="font-mono text-amber-400 font-bold">+{earnedGoldAmount} G</span>
                </div>
                <button
                  id="btn-dismiss-customer"
                  onClick={handleNextCustomer}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black text-[10px] rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1"
                >
                  <span>다음 대기자 들여보내기</span>
                  <ArrowRight size={10} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. CHOOSE POTION GRID (인벤토리 보관 가방 - 클릭으로 저울에 올리기) */}
      <div className="mt-4 bg-[#1f130c] border border-[#3c2518] rounded-2xl p-3.5 space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-[10px] text-amber-200/50 font-black uppercase tracking-wider block">
            🎒 보관 물약 가방 ({inventory.length}개 보유 중)
          </label>
          {selectedPotion && (
            <span className="text-[9px] text-teal-400 font-bold bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800">
              선택됨: {selectedPotion.name}
            </span>
          )}
        </div>

        {/* CLICKABLE INVENTORY BOTTLES GRID */}
        {inventory.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[140px] overflow-y-auto pr-1">
            {inventory.map((potion) => {
              const isSelected = selectedPotionId === potion.id;
              const { matchesEffect, matchesIntensity } = checkRequirements(potion);
              
              // Determine if this potion satisfies customer demands (visual assist highlights)
              const isPerfectMatch = activeCustomer && matchesEffect && matchesIntensity;

              return (
                <button
                  key={potion.id}
                  onClick={() => {
                    if (drinkState === 'idle') {
                      setSelectedPotionId(potion.id);
                    }
                  }}
                  disabled={drinkState !== 'idle'}
                  className={`p-2 rounded-xl text-left transition-all border flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/5'
                      : isPerfectMatch
                      ? 'bg-emerald-950/30 border-emerald-800/80 hover:bg-emerald-900/10'
                      : 'bg-[#291a10] border-[#3e2718] hover:border-[#5a3a24] hover:bg-[#2d1d12]'
                  }`}
                >
                  {/* Miniature bottle avatar */}
                  <div className="shrink-0">
                    {renderScalePotionSVG(potion.color, potion.bottleType, 'w-8 h-8')}
                  </div>

                  <div className="flex-1 min-w-0 text-[10px]">
                    <div className="font-bold text-amber-100 truncate">{potion.name}</div>
                    <div className="text-[8px] text-amber-200/50 flex flex-wrap gap-1 mt-1">
                      {Object.entries(potion.effects).map(([effName, effVal]) => {
                        if (effVal <= 0) return null;
                        const isRequested = activeCustomer && effName === activeCustomer.targetEffect;
                        return (
                          <span
                            key={effName}
                            className={`px-1 py-0.5 rounded-sm text-[7.5px] border ${
                              isRequested
                                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800 font-black'
                                : 'bg-[#1b100a] text-amber-200/60 border-amber-950'
                            }`}
                          >
                            {effName.substring(0, 2)} +{effVal}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Indicators for perfect fit */}
                  {isPerfectMatch && !isSelected && (
                    <span className="text-[8px] bg-emerald-500 text-[#1f130c] font-black px-1 rounded scale-90 shrink-0 animate-pulse">
                      추천
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-amber-200/20 border border-dashed border-[#3c2518]/60 rounded-xl flex flex-col items-center justify-center gap-1">
            <span>👜 가방에 판매 가능한 완제품 물약이 없습니다!</span>
            <span className="text-[9px] text-amber-200/10">물약 제작실로 돌아가 에센스를 빻고 끓이세요.</span>
          </div>
        )}

        {/* Selected potion checklist assist card */}
        {selectedPotion && activeCustomer && (
          <div className="bg-[#1c110a] border border-[#342014] rounded-xl p-2.5 flex items-center justify-between text-[9px] gap-4">
            <div className="flex items-center gap-3">
              <span className="text-amber-200/40 font-bold uppercase tracking-wide">선택된 물약 진단:</span>
              <div className="flex items-center gap-1 font-bold">
                <span className="text-amber-200/70">{activeCustomer.targetEffect} 함유:</span>
                {checkRequirements(selectedPotion).matchesEffect ? (
                  <span className="text-emerald-400 flex items-center gap-0.5"><CheckCircle size={10} /> 있음</span>
                ) : (
                  <span className="text-red-400 flex items-center gap-0.5"><XCircle size={10} /> 없음</span>
                )}
              </div>
              <div className="flex items-center gap-1 font-bold">
                <span className="text-amber-200/70">세기 기준 (+{activeCustomer.minIntensity}):</span>
                {checkRequirements(selectedPotion).matchesIntensity ? (
                  <span className="text-emerald-400 flex items-center gap-0.5"><CheckCircle size={10} /> 충족됨 (+{selectedPotion.effects[activeCustomer.targetEffect] || 0})</span>
                ) : (
                  <span className="text-red-400 flex items-center gap-0.5"><XCircle size={10} /> 미달 (+{selectedPotion.effects[activeCustomer.targetEffect] || 0})</span>
                )}
              </div>
            </div>

            <div className="font-black text-amber-400 font-mono">
              예상 판매액: ~{calculatePotionPrice(selectedPotion, activeCustomer).finalPrice} G
            </div>
          </div>
        )}
      </div>

      {/* Force customer caller (if none) */}
      {!activeCustomer && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-30 rounded-2xl">
          <span className="text-5xl mb-3">🔔</span>
          <h3 className="text-sm font-bold text-amber-100">손님이 문 밖에서 서성이고 있습니다</h3>
          <p className="text-[10px] text-amber-200/50 mt-1 max-w-[280px]">
            가게 문을 활짝 열고 기다리고 있는 다음 손님을 영접하십시오.
          </p>
          <button
            onClick={handleNextCustomer}
            className="mt-4 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-amber-950 font-serif font-black text-xs rounded-xl border-2 border-amber-950 transition-all active:scale-95 shadow-xl shadow-amber-500/10 cursor-pointer"
          >
            대기 손님 입장 시키기
          </button>
        </div>
      )}
    </div>
  );
}
