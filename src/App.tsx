import React, { useState, useEffect } from 'react';
import { Potion, Customer, GameState } from './types';
import { INGREDIENTS, generateRandomCustomer, calculatePotionPrice } from './constants';
import MortarCanvas from './components/MortarCanvas';
import CabinetDrawer from './components/CabinetDrawer';
import CauldronSection from './components/CauldronSection';
import ShowcaseSection from './components/ShowcaseSection';
import CustomerSection from './components/CustomerSection';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Coins,
  Settings,
  HelpCircle,
  Sparkles,
  Info,
  Flame,
  Archive,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';

export default function App() {
  // Current active screen: 0 = Brewing Room, 1 = Showcase Room, 2 = Customer Room
  const [currentScreen, setCurrentScreen] = useState<number>(0);

  // Core game states
  const [gold, setGold] = useState<number>(100);
  const [inventory, setInventory] = useState<Potion[]>([]);
  const [showcase, setShowcase] = useState<(Potion | null)[]>(Array(9).fill(null));
  const [cuttingBoard, setCuttingBoard] = useState<{ [id: string]: number }>({});
  const [customerQueue, setCustomerQueue] = useState<Customer[]>([]);
  const activeCustomer = customerQueue[0] || null;

  // Additional stats
  const [servedCount, setServedCount] = useState<number>(0);
  const [reputation, setReputation] = useState<number>(100);

  // UI state
  const [isCabinetOpen, setIsCabinetOpen] = useState<boolean>(false);
  const [isAudioOn, setIsAudioOn] = useState<boolean>(true);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  // Active brewing state inside cauldron (unboiled)
  const [cauldronIngredients, setCauldronIngredients] = useState<{ [id: string]: number }>({});
  // Uncrushed essence sitting in mortar
  const [mortarEssence, setMortarEssence] = useState<{ [id: string]: number }>({});

  // Flash notifications / feedback banners
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Load state from Local Storage
  useEffect(() => {
    try {
      const savedGold = localStorage.getItem('potionshop_gold');
      const savedInventory = localStorage.getItem('potionshop_inventory');
      const savedShowcase = localStorage.getItem('potionshop_showcase');
      const savedCuttingBoard = localStorage.getItem('potionshop_cuttingboard');
      const savedServedCount = localStorage.getItem('potionshop_servedcount');
      const savedReputation = localStorage.getItem('potionshop_reputation');
      const savedCauldron = localStorage.getItem('potionshop_cauldron');
      const savedMortar = localStorage.getItem('potionshop_mortar');

      if (savedGold !== null) setGold(parseInt(savedGold, 10));
      if (savedInventory !== null) setInventory(JSON.parse(savedInventory));
      if (savedShowcase !== null) {
        // Parse and ensure array of 9 slots
        const parsed = JSON.parse(savedShowcase);
        setShowcase(Array.isArray(parsed) && parsed.length === 9 ? parsed : Array(9).fill(null));
      }
      if (savedCuttingBoard !== null) setCuttingBoard(JSON.parse(savedCuttingBoard));
      if (savedServedCount !== null) setServedCount(parseInt(savedServedCount, 10));
      if (savedReputation !== null) setReputation(parseInt(savedReputation, 10));
      if (savedCauldron !== null) setCauldronIngredients(JSON.parse(savedCauldron));
      if (savedMortar !== null) setMortarEssence(JSON.parse(savedMortar));
    } catch (e) {
      console.error('Failed to load local storage save:', e);
    }

    // Populate initial customer queue
    setCustomerQueue([
      generateRandomCustomer(),
      generateRandomCustomer(),
      generateRandomCustomer(),
      generateRandomCustomer(),
    ]);
  }, []);

  // Sync state to Local Storage upon updates
  useEffect(() => {
    localStorage.setItem('potionshop_gold', gold.toString());
  }, [gold]);

  useEffect(() => {
    localStorage.setItem('potionshop_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('potionshop_showcase', JSON.stringify(showcase));
  }, [showcase]);

  useEffect(() => {
    localStorage.setItem('potionshop_cuttingboard', JSON.stringify(cuttingBoard));
  }, [cuttingBoard]);

  useEffect(() => {
    localStorage.setItem('potionshop_servedcount', servedCount.toString());
  }, [servedCount]);

  useEffect(() => {
    localStorage.setItem('potionshop_reputation', reputation.toString());
  }, [reputation]);

  useEffect(() => {
    localStorage.setItem('potionshop_cauldron', JSON.stringify(cauldronIngredients));
  }, [cauldronIngredients]);

  useEffect(() => {
    localStorage.setItem('potionshop_mortar', JSON.stringify(mortarEssence));
  }, [mortarEssence]);

  // Show customized floating toast alerts
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ text, type });
    // auto dismiss
    setTimeout(() => {
      setToast((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  // BUY INGREDIENT FROM DRAWER
  const handleBuyIngredient = (id: string, cost: number, amount = 1) => {
    const totalCost = cost * amount;
    if (gold < totalCost) {
      showToast('골드가 부족하여 재료를 구매할 수 없습니다!', 'error');
      return;
    }

    setGold((prev) => prev - totalCost);
    setCuttingBoard((prev) => {
      const current = prev[id] || 0;
      return {
        ...prev,
        [id]: current + amount,
      };
    });

    const ing = INGREDIENTS.find((i) => i.id === id);
    showToast(`도마에 [${ing?.name}] ${amount}개가 추가되었습니다! (${totalCost} G 지불)`, 'success');
  };

  // REMOVE FROM BOARD TO DROP INTO MORTAR
  const handleRemoveFromBoard = (id: string) => {
    setCuttingBoard((prev) => {
      const current = prev[id] || 0;
      if (current <= 0) return prev;
      return {
        ...prev,
        [id]: current - 1,
      };
    });
  };

  // POUR MORTAR ESSENCE TO CAULDRON
  const handlePourToCauldron = () => {
    let totalEssence = 0;
    Object.keys(mortarEssence).forEach((id) => {
      totalEssence += mortarEssence[id] || 0;
    });
    if (totalEssence === 0) {
      showToast('절구통에 빻아놓은 액체 에센스가 없습니다!', 'error');
      return;
    }

    setCauldronIngredients((prev) => {
      const updated = { ...prev };
      Object.keys(mortarEssence).forEach((id) => {
        updated[id] = (updated[id] || 0) + (mortarEssence[id] || 0);
      });
      return updated;
    });

    setMortarEssence({});
    showToast('절구통의 원액 에센스를 솥으로 붓고 잘 섞었습니다! 🌋', 'success');
  };

  // CLEAR/DISCARD CURRENT BREWS
  const handleDiscardCauldron = () => {
    setCauldronIngredients({});
    showToast('가마솥을 깨끗이 비워 청소했습니다.', 'info');
  };

  // BREWING POTION SUCCESSFUL
  const handleBrewSuccess = (newPotion: Potion) => {
    setInventory((prev) => [newPotion, ...prev]);
    showToast(`[${newPotion.name}] 물약 제조가 성공하여 가방에 보관되었습니다! 🧪`, 'success');
  };

  // PLACE POTION ON SHOWCASE SHELF
  const handlePlaceOnShowcase = (potionId: string, slotIndex: number) => {
    const targetPotion = inventory.find((p) => p.id === potionId);
    if (!targetPotion) return;

    // Put on display
    setShowcase((prev) => {
      const updated = [...prev];
      updated[slotIndex] = targetPotion;
      return updated;
    });

    // Remove from general inventory
    setInventory((prev) => prev.filter((p) => p.id !== potionId));
  };

  // REMOVE POTION FROM SHOWCASE SHELF
  const handleRemoveFromShowcase = (slotIndex: number) => {
    const targetPotion = showcase[slotIndex];
    if (!targetPotion) return;

    // Add back to inventory
    setInventory((prev) => [targetPotion, ...prev]);

    // Clear slot
    setShowcase((prev) => {
      const updated = [...prev];
      updated[slotIndex] = null;
      return updated;
    });
  };

  // PREPARE RECIPE FROM SHOWCASE DETAILS
  const handlePrepareRecipeToBoard = (ingredientsNeeded: { [id: string]: number }, cost: number) => {
    // Deduct cost and add to board
    setGold((prev) => prev - cost);
    setCuttingBoard((prev) => {
      const updated = { ...prev };
      Object.entries(ingredientsNeeded).forEach(([id, count]) => {
        updated[id] = (updated[id] || 0) + count;
      });
      return updated;
    });
  };

  // SERVE ACTIVE CUSTOMER (AI-powered)
  const handleServeCustomer = async (potionId: string) => {
    if (!activeCustomer) return null;

    const targetPotion = inventory.find((p) => p.id === potionId);
    if (!targetPotion) {
      showToast('해당 물약이 가방에 없습니다!', 'error');
      return null;
    }

    try {
      const response = await fetch("/api/serve-customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activeCustomer, servedPotion: targetPotion }),
      });

      if (!response.ok) {
        throw new Error("API call failed");
      }

      const result = await response.json() as {
        decision: 'drink' | 'refuse';
        success: boolean;
        dies: boolean;
        earnedGold: number;
        feedback: string;
      };

      const { decision, success, dies, earnedGold, feedback } = result;

      // Adjust Reputation (평점)
      if (dies) {
        setReputation((prev) => Math.max(0, prev - 10)); // 사망시 10이 깎임
      } else if (decision === 'refuse') {
        setReputation((prev) => Math.max(0, prev - 2)); // 거절시 2가 깎임
      } else if (success) {
        setReputation((prev) => Math.min(100, prev + 5)); // 성공시 5 상승
      } else {
        setReputation((prev) => Math.max(0, prev - 5)); // 틀릴시 5가 깎임
      }

      // Adjust Gold and Served count
      setGold((prev) => prev + earnedGold);
      if (success && decision === 'drink') {
        setServedCount((prev) => prev + 1);
      }

      // Remove potion from inventory
      setInventory((prev) => prev.filter((p) => p.id !== potionId));

      return {
        decision,
        success,
        dies,
        earnedGold,
        feedback,
      };

    } catch (e) {
      console.error("AI Serving failed, falling back to local calculation:", e);
      // Fallback local logic so game is robust and never crashes
      const { finalPrice, success, actualIntensity, minIntensity, hasEffect } = calculatePotionPrice(targetPotion, activeCustomer);

      const dies = (targetPotion.effects['독'] || 0) > 0 || 
                   (targetPotion.effects['폭발'] || 0) > 0 || 
                   (targetPotion.effects['화염'] || 0) > 0;

      if (dies) {
        setReputation((prev) => Math.max(0, prev - 10));
      } else if (success) {
        setReputation((prev) => Math.min(100, prev + 5));
      } else {
        setReputation((prev) => Math.max(0, prev - 5));
      }

      if (success) {
        setGold((prev) => prev + finalPrice);
        setServedCount((prev) => prev + 1);
      } else {
        setGold((prev) => prev + finalPrice);
      }

      setInventory((prev) => prev.filter((p) => p.id !== potionId));

      let feedback = '';
      if (dies) {
        let deathReason = '독사했습니다! (☠️)';
        if ((targetPotion.effects['폭발'] || 0) > 0) {
          deathReason = '마법 대폭발로 폭사했습니다! (💥)';
        } else if ((targetPotion.effects['화염'] || 0) > 0) {
          deathReason = '온몸이 활활 불타며 타죽었습니다! (🔥)';
        }
        feedback = `🚨 손님이 물약을 들이켜고 ${deathReason} 명성(평점)이 10 깎였습니다!`;
      } else if (success) {
        feedback = `손님이 요구한 효과 강도(+${actualIntensity})가 요구 치(+${minIntensity})를 충족했습니다! 흥정을 통해 정산된 대금인 ${finalPrice} G를 받았습니다. (명성 +5%)`;
      } else {
        let failReason = '';
        const requestedEffect = activeCustomer.targetEffect;
        if (!hasEffect) {
          failReason = `손님은 물약에 본인이 원했던 [${requestedEffect}] 효과가 전혀 없다며 불평했습니다.`;
        } else {
          failReason = `손님은 물약에 [${requestedEffect}] 효과가 들어있지만 강도가 너무 미미하다며 (+${actualIntensity} < 요구: ${minIntensity}) 실망했습니다.`;
        }
        feedback = `${failReason} 손님은 실망하여 약소한 위로금 ${finalPrice} G만 매대에 올려두고 돌아갔습니다. (명성 -5%)`;
      }

      return {
        decision: 'drink' as const,
        success,
        dies,
        earnedGold: finalPrice,
        feedback,
      };
    }
  };

  // GENERATE NEXT CUSTOMER
  const handleGenerateCustomer = () => {
    setCustomerQueue((prev) => {
      const nextQueue = prev.slice(1);
      while (nextQueue.length < 4) {
        nextQueue.push(generateRandomCustomer());
      }
      return nextQueue;
    });
  };

  // FULL WIPE RESET FUNCTION
  const handleResetGame = () => {
    if (confirm('정말로 모든 게임 진행도를 초기화하고 처음부터 시작하시겠습니까? (보유 자금 100G로 복구)')) {
      setGold(100);
      setInventory([]);
      setShowcase(Array(9).fill(null));
      setCuttingBoard({});
      setCauldronIngredients({});
      setMortarEssence({});
      setServedCount(0);
      setReputation(100);
      setCustomerQueue([
        generateRandomCustomer(),
        generateRandomCustomer(),
        generateRandomCustomer(),
        generateRandomCustomer(),
      ]);
      showToast('게임이 성공적으로 초기화되었습니다! 처음부터 즐겨보세요!', 'info');
    }
  };

  // Navigation handlers
  const handlePrevScreen = () => {
    setCurrentScreen((prev) => (prev === 0 ? 2 : prev - 1));
  };

  const handleNextScreen = () => {
    setCurrentScreen((prev) => (prev === 2 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-x-hidden relative">
      {/* Background stars / ambient magical light effect */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-indigo-950/10 via-transparent to-transparent pointer-events-none" />

      {/* TOP HEADER STATUS BAR */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-spin" style={{ animationDuration: '10s' }}>🔮</span>
            <div>
              <h1 className="text-base font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300">
                엉망진창 포션 가게
              </h1>
              <p className="text-[10px] text-slate-400 font-medium">Chaotic Potion Shop v1.0</p>
            </div>
          </div>

          {/* Core HUD data values */}
          <div className="flex items-center gap-3.5">
            {/* Money Box */}
            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800/80 shadow-inner">
              <Coins size={14} className="text-amber-400 animate-pulse" />
              <span className="text-xs font-black text-amber-400 tracking-wider">
                {gold} <span className="text-[10px] font-bold text-amber-500/80">G</span>
              </span>
            </div>

            {/* Served count */}
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 font-bold bg-slate-950/40 border border-slate-800/60 px-2.5 py-1.5 rounded-full">
              <span>서빙 성공:</span>
              <span className="text-emerald-400">{servedCount}회</span>
            </div>

            {/* Reputation bar */}
            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800/80 shadow-inner">
              <span className="text-xs font-black text-teal-400 flex items-center gap-1">
                <span>⭐</span>
                <span>평점:</span>
                <span className="tracking-wider">{reputation}%</span>
              </span>
            </div>

            {/* Action icons */}
            <div className="flex gap-1">
              <button
                id="btn-help"
                onClick={() => setShowHelpModal(true)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="도움말"
              >
                <HelpCircle size={15} />
              </button>

              <button
                id="btn-wipe"
                onClick={handleResetGame}
                className="p-1.5 bg-slate-800/40 hover:bg-red-950 border border-transparent hover:border-red-900/30 text-slate-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                title="진행도 초기화"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* SPACE ROOM INDICATOR PROGRESS DOTS */}
      <div className="flex justify-center items-center gap-3 py-4 mt-2 z-10">
        <button
          onClick={() => setCurrentScreen(0)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
            currentScreen === 0
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/10'
              : 'bg-slate-900 hover:bg-slate-850 text-slate-400'
          }`}
        >
          <span>🥣</span>
          <span>물약 제작실</span>
        </button>
        <button
          onClick={() => setCurrentScreen(1)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
            currentScreen === 1
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/10'
              : 'bg-slate-900 hover:bg-slate-850 text-slate-400'
          }`}
        >
          <span>🏛️</span>
          <span>진열 대기소</span>
        </button>
        <button
          onClick={() => setCurrentScreen(2)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
            currentScreen === 2
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/10'
              : 'bg-slate-900 hover:bg-slate-850 text-slate-400'
          }`}
        >
          <span>👥</span>
          <span>접객 및 판매소</span>
        </button>
      </div>

      {/* MAIN VIEW CONTROLLER (With Left & Right side arrow controls) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 pb-16 flex items-center justify-between relative gap-2">
        {/* LEFT NAV ARROW */}
        <button
          id="btn-nav-left"
          onClick={handlePrevScreen}
          className="p-3 bg-slate-900/60 hover:bg-slate-850 text-slate-400 hover:text-white rounded-full border border-slate-800 backdrop-blur-sm transition-all active:scale-95 shrink-0 z-10 cursor-pointer shadow-lg shadow-black/20"
        >
          <ChevronLeft size={24} />
        </button>

        {/* CONTAINER WITH TRANSITIONS */}
        <div className="flex-1 min-w-0 max-w-4xl mx-auto w-full">
          <AnimatePresence mode="wait">
            {currentScreen === 0 && (
              <motion.div
                key="brewing-room"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.25 }}
                className="bg-[#ebdcb9] border-8 border-[#4a2c11] rounded-[32px] p-6 shadow-2xl relative overflow-hidden min-h-[540px] flex flex-col justify-between"
              >
                {/* Continuous Wood Workbench Table Floor running horizontally across the bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-[#734d26] border-t-[10px] border-[#4a2c11] shadow-[inset_0_8px_16px_rgba(0,0,0,0.5)] z-0" />

                {/* Main Alchemist Workspace layout with Cauldron and Mortar side-by-side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end relative z-10 flex-1 w-full pb-8">
                  {/* Left: Cauldron Section */}
                  <div className="flex flex-col items-center justify-end w-full">
                    <CauldronSection
                      cauldronIngredients={cauldronIngredients}
                      setCauldronIngredients={setCauldronIngredients}
                      onBrewSuccess={handleBrewSuccess}
                      onDiscardCauldron={handleDiscardCauldron}
                    />
                  </div>

                  {/* Right: Mortar Section */}
                  <div className="flex flex-col items-center justify-end w-full">
                    <MortarCanvas
                      cuttingBoard={cuttingBoard}
                      onRemoveFromBoard={handleRemoveFromBoard}
                      mortarEssence={mortarEssence}
                      setMortarEssence={setMortarEssence}
                      onPourToCauldron={handlePourToCauldron}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {currentScreen === 1 && (
              <motion.div
                key="showcase-room"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.25 }}
                className="max-w-2xl mx-auto w-full"
              >
                <ShowcaseSection
                  inventory={inventory}
                  showcase={showcase}
                  onPlaceOnShowcase={handlePlaceOnShowcase}
                  onRemoveFromShowcase={handleRemoveFromShowcase}
                  gold={gold}
                  onPrepareRecipeToBoard={handlePrepareRecipeToBoard}
                  onShowMessage={showToast}
                />
              </motion.div>
            )}

            {currentScreen === 2 && (
              <motion.div
                key="customer-room"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.25 }}
                className="max-w-2xl mx-auto w-full"
              >
                <CustomerSection
                  activeCustomer={activeCustomer}
                  customerQueue={customerQueue}
                  onServeCustomer={handleServeCustomer}
                  onGenerateCustomer={handleGenerateCustomer}
                  inventory={inventory}
                  gold={gold}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT NAV ARROW */}
        <button
          id="btn-nav-right"
          onClick={handleNextScreen}
          className="p-3 bg-slate-900/60 hover:bg-slate-850 text-slate-400 hover:text-white rounded-full border border-slate-800 backdrop-blur-sm transition-all active:scale-95 shrink-0 z-10 cursor-pointer shadow-lg shadow-black/20"
        >
          <ChevronRight size={24} />
        </button>
      </main>

      {/* DRAWER COMPONENT (Cabinet drawer for buying ingredients) */}
      <CabinetDrawer
        gold={gold}
        onBuyIngredient={handleBuyIngredient}
        isOpen={isCabinetOpen}
        setIsOpen={setIsCabinetOpen}
        cuttingBoard={cuttingBoard}
      />

      {/* FLOATING INGREDIENT DRAWER OPEN GUIDE HINT */}
      {!isCabinetOpen && currentScreen === 0 && (
        <div className="fixed bottom-6 right-16 z-10 pointer-events-none bg-slate-900/90 border border-slate-700/60 px-3.5 py-2 rounded-2xl flex items-center gap-1.5 shadow-xl animate-bounce">
          <span className="text-sm">🗄️</span>
          <span className="text-[11px] text-slate-200 font-bold">오른쪽 서랍을 열어 재료를 구입하세요!</span>
        </div>
      )}

      {/* TOAST SYSTEM */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            id="toast-alert"
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl flex items-center gap-2.5 shadow-2xl border ${
              toast.type === 'success'
                ? 'bg-emerald-950 border-emerald-500/30 text-emerald-300'
                : toast.type === 'error'
                ? 'bg-red-950 border-red-500/30 text-red-300'
                : 'bg-slate-900 border-slate-700 text-slate-200'
            }`}
          >
            <Info size={16} className={toast.type === 'success' ? 'text-emerald-400' : toast.type === 'error' ? 'text-red-400' : 'text-amber-400'} />
            <span className="text-xs font-semibold leading-relaxed whitespace-nowrap">{toast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HELP / TUTORIAL MODAL */}
      <AnimatePresence>
        {showHelpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHelpModal(false)}
              className="fixed inset-0 bg-black"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              id="help-modal"
              className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative z-10 max-h-[85vh] overflow-y-auto"
            >
              <div className="text-center mb-4">
                <span className="text-4xl">📘</span>
                <h2 className="text-base font-bold text-slate-100 mt-2">포션 제작 가게 가이드라인</h2>
              </div>

              <div className="space-y-4 text-xs leading-relaxed text-slate-300">
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-850">
                  <h3 className="font-bold text-amber-400 mb-1 flex items-center gap-1">
                    <span>1.</span> 물약 제작 루프 (제작실)
                  </h3>
                  <p className="text-slate-400 pl-4">
                    오른쪽 <strong className="text-slate-200">재료 서랍</strong>을 눌러 필요한 약초나 버섯 등을 구매하세요. 구매한 재료는 <strong className="text-slate-200">도마</strong>에 놓입니다. 도마의 재료를 클릭하여 <strong className="text-slate-200">절구</strong>에 빠뜨린 후, 무거운 절구공이를 드래그하거나 대상을 탭하여 빻으면 원액 에센스로 변합니다. 에센스를 솥에 붓고 끓이면 완제품이 가방으로 들어옵니다.
                  </p>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-850">
                  <h3 className="font-bold text-amber-400 mb-1 flex items-center gap-1">
                    <span>2.</span> 보관 레시피 복사 (진열실)
                  </h3>
                  <p className="text-slate-400 pl-4">
                    만들어진 물약은 <strong className="text-slate-200">진열대</strong>에 예쁘게 전시할 수 있습니다. 진열된 물약을 클릭하면 <strong className="text-slate-200">&apos;만들기에서 이 물약 재료 즉시 꺼내기&apos;</strong> 버튼이 나타나며, 원래 만들었던 재료 성분이 도마 작업대에 똑같이 즉시 세팅됩니다!
                  </p>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-850">
                  <h3 className="font-bold text-amber-400 mb-1 flex items-center gap-1">
                    <span>3.</span> 손님 응대 (접객실)
                  </h3>
                  <p className="text-slate-400 pl-4">
                    가게 문을 열면 다양한 요구사항을 가진 손님이 옵니다. 손님이 요구한 효과와 수치를 가방 속 물약이 만족하면 물약을 판매하여 <strong className="text-emerald-400">재료 가격에 비례한 막대한 보너스 돈</strong>을 받습니다! 마신 손님은 특수한 비주얼 리액션 효과를 냅니다.
                  </p>
                </div>
              </div>

              <button
                id="btn-close-help"
                onClick={() => setShowHelpModal(false)}
                className="mt-6 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold rounded-xl transition-colors cursor-pointer"
              >
                가게로 복귀하기
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GAME OVER OVERLAY */}
      <AnimatePresence>
        {(gold <= 0 || reputation <= 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-slate-900 border-2 border-red-500 max-w-md w-full rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-40 bg-red-600/20 rounded-full blur-2xl pointer-events-none" />

              <span className="text-6xl block mb-4 animate-bounce">💀</span>
              <h2 className="text-xl font-black tracking-tight text-red-500 uppercase">포션 가게 폐업 및 파산</h2>
              <p className="text-slate-400 text-[10px] mt-1 mb-6">Chaotic Potion Shop is Out of Business</p>

              <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 mb-6 text-left space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-bold">실패 원인:</span>
                  <span className="font-black text-red-400">
                    {reputation <= 0 ? '🏆 평점 0% 도달 (평판 사기)' : '💸 파산 (보유 골드 0G 도달)'}
                  </span>
                </div>
                <div className="border-t border-slate-900 my-1" />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-bold">최종 보유 골드:</span>
                  <span className="font-extrabold text-amber-400">{gold} G</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-bold">최종 가게 평점:</span>
                  <span className="font-extrabold text-teal-400">{reputation}%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-bold">총 손님 대접 수:</span>
                  <span className="font-extrabold text-emerald-400">{servedCount}회</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mb-6 leading-relaxed">
                평판 또는 운영 자금이 바닥나 더 이상 물약 가게를 이끌 수 없게 되었습니다.<br />
                다시 시작하여 성실하고 완벽한 일류 연금술사가 되어보세요!
              </p>

              <button
                onClick={() => {
                  setGold(100);
                  setReputation(100);
                  setInventory([]);
                  setShowcase(Array(9).fill(null));
                  setCuttingBoard({});
                  setCauldronIngredients({});
                  setMortarEssence({});
                  setServedCount(0);
                  setCustomerQueue([
                    generateRandomCustomer(),
                    generateRandomCustomer(),
                    generateRandomCustomer(),
                    generateRandomCustomer(),
                  ]);
                  showToast('가게를 정돈하고 새로 문을 열었습니다! 🧪', 'success');
                }}
                className="w-full py-3 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg shadow-red-600/20 active:scale-95"
              >
                처음부터 다시 시도하기 🧪
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
