export interface Ingredient {
  id: string;
  name: string;
  cost: number;
  color: string; // hex color e.g., "#2ecc71"
  emoji: string;
  description: string;
  primaryEffect: string; // e.g., "치유", "화염", "냉기", "비행", "독", "골드", "석화", "빛"
  intensity: number; // base intensity added per unit
}

export interface Potion {
  id: string;
  name: string;
  color: string; // blended color hex e.g., "#3ab4c9"
  ingredients: { [ingredientId: string]: number }; // list of ingredients used
  effects: { [effectType: string]: number }; // calculated final effects and their strengths
  bottleType: 'round' | 'square' | 'star' | 'flask' | 'skull'; // bottle shape
  totalCost: number; // cost of ingredients used
  brewedAt: number; // timestamp
}

export interface Customer {
  id: string;
  name: string;
  avatarEmoji: string;
  avatarColor: string; // background color for avatar
  dialog: string;
  targetEffect: string; // effect requested
  minIntensity: number; // minimum strength
  maxBudget: number; // maximum they are willing to pay (totalCost * multiplier)
  story: string; // description
  reactionText: string; // reaction text after drinking
  reactionEffect: 'heal' | 'fire' | 'freeze' | 'float' | 'poison' | 'gold' | 'petrify' | 'glow' | 'explode'; // visual effect type
}

export interface PhysicalIngredient {
  id: string;
  ingredientId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  emoji: string;
  crushProgress: number; // 0 to 100% crushed
  rotation: number;
  angularVelocity: number;
  isInsideMortar?: boolean;
  isPowderClump?: boolean;
}

export interface GameState {
  gold: number;
  inventory: Potion[];
  showcase: (Potion | null)[]; // 9 shelf slots (index 0 to 8)
  cuttingBoard: { [ingredientId: string]: number }; // purchased ingredients sitting on board
  activeCustomer: Customer | null;
  customerCooldown: number; // countdown till next customer
  servedCount: number;
  reputation: number; // 1-100 rating
}
