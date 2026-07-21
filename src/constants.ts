import { Ingredient, Customer } from './types';

export const INGREDIENTS: Ingredient[] = [
  {
    id: 'herb',
    name: '신선한 약초',
    cost: 8,
    color: '#4ade80', // Green
    emoji: '🌿',
    description: '치유 성분이 가득한 가장 기본적인 허브.',
    primaryEffect: '치유',
    intensity: 10,
  },
  {
    id: 'frost_mint',
    name: '서리 민트',
    cost: 12,
    color: '#38bdf8', // Ice blue
    emoji: '❄️',
    description: '손이 꽁꽁 얼어붙을 정도로 강렬한 냉기를 내뿜는 푸른빛 서리 민트.',
    primaryEffect: '동결',
    intensity: 12,
  },
  {
    id: 'spicy_chili',
    name: '매운 고추',
    cost: 14,
    color: '#f43f5e', // Hot red/rose
    emoji: '🌶️',
    description: '먹으면 입안에서 화염 방사기를 쏘게 되는 지옥의 매운 고추.',
    primaryEffect: '화염',
    intensity: 15,
  },
  {
    id: 'dried_pufferfish',
    name: '말린 복어',
    cost: 16,
    color: '#a855f7', // Purple poison
    emoji: '🐡',
    description: '무시무시한 독가시와 신경독을 품고 있는 잘 말린 복어.',
    primaryEffect: '독',
    intensity: 14,
  },
  {
    id: 'grey_branch',
    name: '회색 나무 가지',
    cost: 18,
    color: '#64748b', // Slate grey
    emoji: '🎋',
    description: '가볍게 부러뜨리기만 해도 불꽃 스파크를 일으키는 불안정한 회색 나뭇가지.',
    primaryEffect: '폭발',
    intensity: 16,
  }
];

export const CUSTOMER_POOL: Omit<Customer, 'id'>[] = [
  {
    name: '덜렁이 용사',
    avatarEmoji: '🛡️',
    avatarColor: 'bg-amber-100 border-amber-400 text-amber-900',
    dialog: '아이고... 슬라임 떼거리한테 쫓기다가 굴러떨어졌소! 온몸에 멍이 시퍼렇소. 뼈를 맞춰줄 뜨끈뜨끈한 치유 물약이 필요하오! 어서 빨리!',
    targetEffect: '치유',
    minIntensity: 10,
    maxBudget: 2.2, // multiplies totalCost
    story: '모험가 길드의 열정만 앞선 신입 전사.',
    reactionText: '오오오오! 상처가 순식간에 아물고 근육이 솟구치는군! 고맙소, 약사님! 최고요!',
    reactionEffect: 'heal',
  },
  {
    name: '지친 농부 아저씨',
    avatarEmoji: '👨‍🌾',
    avatarColor: 'bg-emerald-100 border-emerald-400 text-emerald-900',
    dialog: '하루 종일 밭을 갈았더니 허리가 끊어질 것 같구려... 몸을 개운하게 해 줄 향긋한 약초 치유 물약 하나만 지어주시오.',
    targetEffect: '치유',
    minIntensity: 10,
    maxBudget: 2.0,
    story: '마을 외곽에서 무밭을 가꾸는 평범한 농부.',
    reactionText: '크아~ 허리에 가벼운 바람이 부는 것 같구려! 정말 시원하오, 약사님!',
    reactionEffect: 'heal',
  },
  {
    name: '다친 꼬마 요정',
    avatarEmoji: '🧚‍♀️',
    avatarColor: 'bg-pink-100 border-pink-400 text-pink-900',
    dialog: '가시덤불에 장난감 공이 걸려서 꺼내려다가 손가락을 긁혔어요... 따끔따끔 아픈 상처를 아물게 해줄 향기로운 초록색 치유 물약 주세요!',
    targetEffect: '치유',
    minIntensity: 5,
    maxBudget: 2.5,
    story: '반짝이는 날개를 지닌 말썽쟁이 아기 정령.',
    reactionText: '와앗! 상처가 감쪽같이 사라졌어요! 하나도 안 따끔해요! 고맙습니다 엣헴!',
    reactionEffect: 'heal',
  },
  {
    name: '훈련 중인 경비병',
    avatarEmoji: '💂',
    avatarColor: 'bg-blue-100 border-blue-400 text-blue-900',
    dialog: '훈련 중에 대련을 하다가 팔목을 세게 부딪쳤네. 내일 바로 초소 근무를 서야 하는데, 빠르게 통증을 없애줄 치유 물약이 있나?',
    targetEffect: '치유',
    minIntensity: 15,
    maxBudget: 2.3,
    story: '마을 성벽을 지키는 듬직한 청년 대원.',
    reactionText: '정말 신비로운 효능이군! 팔목의 통증이 말끔하게 사라지고 힘이 넘치네!',
    reactionEffect: 'heal',
  },
  {
    name: '바쁜 우편배달부',
    avatarEmoji: '📮',
    avatarColor: 'bg-red-100 border-red-400 text-red-900',
    dialog: '온 동네 언덕길을 하루 종일 뛰어다녔더니 아킬레스건이 부어올랐습니다! 치유 한 사발 얼른 주십시오! 배달이 밀렸어요!',
    targetEffect: '치유',
    minIntensity: 12,
    maxBudget: 2.1,
    story: '신속 정확을 신조로 삼는 마을의 배달 전령.',
    reactionText: '우와! 다리에 깃털을 단 것처럼 발걸음이 너무 가벼워졌어요! 다시 전력질주하러 갑니다!',
    reactionEffect: 'heal',
  },
  {
    name: '금 간 스켈레톤',
    avatarEmoji: '💀',
    avatarColor: 'bg-slate-200 border-slate-500 text-slate-950',
    dialog: '달그락 달그락... 저기, 묘지 계단에서 굴러서 제 갈비뼈에 가볍게 실금이 갔는데... 뼈를 튼튼하게 붙여줄 약초탕 한 그릇 부탁합니다.',
    targetEffect: '치유',
    minIntensity: 8,
    maxBudget: 1.8,
    story: '마을 근처 공동묘지에 사는 온순한 유골 아저씨.',
    reactionText: '허허! 금 간 부위가 칼슘으로 꽉 채워진 느낌이네요! 달그락달그락, 매우 만족스럽습니다!',
    reactionEffect: 'heal',
  },
  {
    name: '상처입은 동네 고양이',
    avatarEmoji: '🐱',
    avatarColor: 'bg-[#faf0d9] border-[#ca8a04] text-[#78350f]',
    dialog: '야옹... 생선 가시를 훔쳐 먹다가 입안과 입술을 긁혔다옹... 따갑고 쓰라려 죽겠다옹. 얼른 안 맵고 향긋한 치유 에센스 달라옹!',
    targetEffect: '치유',
    minIntensity: 6,
    maxBudget: 2.4,
    story: '생선 가게 주변을 맴도는 영악하고 귀여운 길고양이.',
    reactionText: '골골골... 입안이 싹 코팅되면서 통증이 날아갔다옹! 약사 최고다옹, 생선이라도 물어오겠다옹!',
    reactionEffect: 'heal',
  },
  {
    name: '실수쟁이 마법사 지망생',
    avatarEmoji: '🧙',
    avatarColor: 'bg-violet-100 border-violet-400 text-violet-900',
    dialog: '아앗... 물약 실험을 하다가 비커가 펑! 폭발해서 양 뺨에 까진 상처가 잔뜩 났어요... 흉터 안 남게 말끔히 고쳐줄 좋은 약초탕 부탁드려요.',
    targetEffect: '치유',
    minIntensity: 10,
    maxBudget: 2.2,
    story: '항상 마법 폭발 사고를 달고 사는 마을의 연금 초보.',
    reactionText: '대단해요! 따가운 상처와 그을음 흉터가 눈 녹듯 사라졌어요! 선배님 정말 감사합니다!',
    reactionEffect: 'heal',
  },
  {
    name: '야생 벌에 쏘인 아기 곰',
    avatarEmoji: '🐻',
    avatarColor: 'bg-orange-50 border-orange-400 text-orange-950',
    dialog: '으으으웅... 마시멜로인 줄 알고 벌집 건드렸다가 벌한테 코랑 엉덩이를 쏘였어어... 퉁퉁 부어서 너무 아파... 시원한 치유수 발라줘어...',
    targetEffect: '치유',
    minIntensity: 5,
    maxBudget: 2.5,
    story: '달콤한 꿀과 단것을 무척 좋아하는 숲속의 어린 곰.',
    reactionText: '우와앙! 부은 코가 쏙 들어가구 하나도 안 아파요! 약사님 최고! 나중에 꿀단지 가져올게요!',
    reactionEffect: 'heal',
  },
  {
    name: '열정의 연주가',
    avatarEmoji: '🎸',
    avatarColor: 'bg-rose-50 border-rose-400 text-rose-950',
    dialog: '기타 줄을 밤새 격렬하게 연주했더니 손가락 끝이 다 갈라지고 물집이 터졌습니다! 내일 밤 독주회를 무사히 마칠 수 있게 지문을 복원해 주오!',
    targetEffect: '치유',
    minIntensity: 14,
    maxBudget: 2.3,
    story: '영혼을 담아 현을 타는 마을의 열정적인 버스킹 음악가.',
    reactionText: '오오! 손가락 끝이 아기 피부처럼 매끄럽고 단단해졌구려! 다시 전설의 리프를 연주하겠소!',
    reactionEffect: 'heal',
  },
  {
    name: '세 마리 다람쥐 대장',
    avatarEmoji: '🐿️',
    avatarColor: 'bg-amber-50 border-amber-500 text-amber-950',
    dialog: '토리토리! 옆구역 다람쥐 군단과 도토리 구릉 전투를 하다가 꼬리 털이 뽑히고 긁혔토리! 대장의 체면을 세워줄 울트라 치유약 달라토리!',
    targetEffect: '치유',
    minIntensity: 7,
    maxBudget: 2.4,
    story: '동네 참나무 구역을 지배하는 꼬맹이 다람쥐 우두머리.',
    reactionText: '토리!! 상처가 감쪽같이 회복되고 꼬리 털에 윤기가 다시 돌토리! 부하들 데리고 다시 도토리 따러 간토리!',
    reactionEffect: 'heal',
  },
  {
    name: '은퇴한 대마법사',
    avatarEmoji: '👴',
    avatarColor: 'bg-[#f1f5f9] border-[#94a3b8] text-[#1e293b]',
    dialog: '에구구... 이놈의 노환인지, 젊을 적 마구 써대던 고서 마법의 반동 탓인지 어깨와 허리가 끊어질 것 같구려. 뜨끈하게 달여줄 특효약 하나 지어주게.',
    targetEffect: '치유',
    minIntensity: 18,
    maxBudget: 2.5,
    story: '마법 탑에서 수십 년간 헌신하다 은퇴한 전설의 노현자.',
    reactionText: '허허허! 뼈마디에 뜨거운 마나가 흘러들어 묵은 피로와 통증이 말끔하게 정화되었군! 명의로세!',
    reactionEffect: 'heal',
  },
  {
    name: '부리 그을린 불사조',
    avatarEmoji: '🐦',
    avatarColor: 'bg-[#fff7ed] border-[#ea580c] text-[#7c2d12]',
    dialog: '끼에에엑! 깃털 청소를 하다가 화염 주파수 조절 실패로 자가 폭발을 일으켰소! 부리가 시커멓게 그을려 아프니 부드러운 약초 에센스를 내놓으시오!',
    targetEffect: '치유',
    minIntensity: 12,
    maxBudget: 2.6,
    story: '성깔이 매우 포악하고 뜨거운 성격의 어린 불조.',
    reactionText: '삐약! 부리의 열꽃 통증이 차갑게 가라앉고 시원하구나! 조제 실력이 꽤 쓸만하군, 인간!',
    reactionEffect: 'heal',
  },
  {
    name: '화가 치민 마도학자',
    avatarEmoji: '🔥',
    avatarColor: 'bg-red-50 border-red-500 text-red-950',
    dialog: '화염 마법 주문을 외우다가 주파수 역류로 가슴 속에 불덩이가 맺혔어! 뜨거워 미칠 것 같군! 가슴속 화기를 싹 꺼줄 급속 동결 물약이 필요하다!',
    targetEffect: '동결',
    minIntensity: 10,
    maxBudget: 2.2,
    story: '불 마법을 너무 사랑한 나머지 늘 몸이 과열되어 있는 괴짜 마도사.',
    reactionText: '크아아앗! 가슴에서 차가운 북극바람이 몰아치는구나! 화마가 완전히 얼어붙어 소멸했다! 최고다!',
    reactionEffect: 'freeze',
  },
  {
    name: '더위 먹은 귀족 엘프',
    avatarEmoji: '🧝‍♂️',
    avatarColor: 'bg-emerald-50 border-emerald-500 text-emerald-950',
    dialog: '하아, 이놈의 폭염 때문에 저의 우아하고 고결한 엘프 피부가 타들어가는 느낌입니다. 저의 몸을 급속도로 아주 차갑게 만들어줄 동결 비약이 필요합니다.',
    targetEffect: '동결',
    minIntensity: 10,
    maxBudget: 2.3,
    story: '마을을 방문했다가 혹독한 한여름 열대야에 괴로워하는 엘프 귀족.',
    reactionText: '후우... 뼛속까지 소름 끼칠 정도의 짜릿한 냉기로군요! 저의 체온이 시원하게 보존되었습니다. 엘프의 은혜를 받으십시오.',
    reactionEffect: 'freeze',
  },
  {
    name: '얼음 조각가 양반',
    avatarEmoji: '🗿',
    avatarColor: 'bg-sky-50 border-sky-500 text-sky-950',
    dialog: '마을 광장에 모실 눈사람과 백조 조각상을 깎는 중인데, 날씨가 풀려 조각상이 녹기 시작했소! 얼음이 더 녹지 않게 꽁꽁 묶어둘 고강도 동결 포션 하나만 부어주시오!',
    targetEffect: '동결',
    minIntensity: 15,
    maxBudget: 2.4,
    story: '조각품의 온전한 보존을 위해 밤낮없이 고민하는 열정의 예술가.',
    reactionText: '와하하! 조각상 주변 공기가 절대 영도로 얼어붙었소! 이제 일 년 내내 녹지 않겠군! 대단한 효능이오!',
    reactionEffect: 'freeze',
  },
  {
    name: '열병을 앓는 꼬마 좀비',
    avatarEmoji: '🧟‍♂️',
    avatarColor: 'bg-green-100 border-green-500 text-green-950',
    dialog: '끙끙... 내 뇌가 뜨겁다 좀... 좀비는 몸이 차가워야 썩지 않고 신선한데, 지독한 열병에 걸려 몸이 자꾸 뜨거워진다 좀... 나를 얼려주라 좀...',
    targetEffect: '동결',
    minIntensity: 8,
    maxBudget: 2.0,
    story: '채소밭 근처 묘지에서 밤마다 도토리를 주우며 노는 친근한 아기 좀비.',
    reactionText: '어어억! 대가리가 시베리아처럼 시원해졌다 좀! 이 시원함, 썩 마음에 든다 좀! 고맙다 좀!',
    reactionEffect: 'freeze',
  },
  {
    name: '추위 타는 아궁이 요정',
    avatarEmoji: '🔥',
    avatarColor: 'bg-orange-100 border-orange-400 text-orange-950',
    dialog: '아이고 추워라! 겨울바람 때문에 부엌 아궁이 불씨가 다 꺼져갑니다! 화끈한 화염 성분이 가득한 포션을 부어주시면 화력이 다시 활활 타오를 텐데 말이요!',
    targetEffect: '화염',
    minIntensity: 12,
    maxBudget: 2.5,
    story: '마을 큰 주택의 아궁이에 깃들어 사는 불의 하급 요정.',
    reactionText: '우와아앗! 불꽃이 화르륵 피어오릅니다! 방구들이 뜨끈뜨끈해졌어요! 아주 뜨거운 화력입니다!',
    reactionEffect: 'fire',
  },
  {
    name: '꽁꽁 얼어붙은 모험가',
    avatarEmoji: '🥶',
    avatarColor: 'bg-sky-100 border-sky-400 text-sky-900',
    dialog: '설... 설산 비경을 탐험하다가 얼음 함정을 밟아서 몸이 완전히 얼어붙기 직전입니다... 저를 녹여줄 화끈하게 뜨거운 화염 물약 한 사발만 부탁합니다... 제발요...',
    targetEffect: '화염',
    minIntensity: 15,
    maxBudget: 2.6,
    story: '북쪽 설산을 탐험하다 동상에 걸려 내려온 얼어붙은 청년.',
    reactionText: '하아아! 온몸이 용광로처럼 후끈해지면서 얼음이 싹 녹아내렸습니다! 살았다! 정말 살았어!',
    reactionEffect: 'fire',
  },
  {
    name: '골치 아픈 정원사',
    avatarEmoji: '👩‍🌾',
    avatarColor: 'bg-teal-50 border-teal-500 text-teal-950',
    dialog: '아이고! 우리 집 온실 장미밭에 마력 식인 덩굴 해충들이 가득 퍼졌어요! 일반 물로는 죽지 않으니, 아주 독한 신경독 성분의 물약 한 병만 지어주세요. 싹 박멸해야겠어요!',
    targetEffect: '독',
    minIntensity: 10,
    maxBudget: 2.2,
    story: '희귀하고 예쁜 마법 꽃들을 전문적으로 키우는 깐깐한 정원사.',
    reactionText: '와, 엄청난 맹독이군요! 해충들이 닿자마자 힘을 못 쓰고 툭툭 떨어집니다! 이제 정원이 살았어요!',
    reactionEffect: 'poison',
  },
  {
    name: '어둠의 암살단 견습생',
    avatarEmoji: '👤',
    avatarColor: 'bg-slate-800 border-slate-950 text-slate-100',
    dialog: '쉿... 이번 자객 시험에서 단검에 바를 은밀하고 치명적인 독약이 필요하다. 냄새가 나지 않고 피부에 닿자마자 작용하는 독성이 강한 녀석으로 부탁하지.',
    targetEffect: '독',
    minIntensity: 14,
    maxBudget: 2.4,
    story: '검은 그림자 길드 소속의 과묵하고 비밀이 많은 견습 살수.',
    reactionText: '...음, 보라색 기운이 서린 극상의 맹독이군. 이 정도면 단번에 타겟을 제압할 수 있겠어. 완벽하다.',
    reactionEffect: 'poison',
  },
  {
    name: '광산 광부 대장',
    avatarEmoji: '⛏️',
    avatarColor: 'bg-stone-200 border-stone-500 text-stone-900',
    dialog: '여보시오, 약사 양반! 이번에 탄광 깊숙한 곳에서 전설의 청동 광맥을 찾았는데 단단한 바위벽에 막혔소! 곡괭이론 안 깨지니 화끈하게 바위를 날려버릴 폭발 포션 하나 주시오!',
    targetEffect: '폭발',
    minIntensity: 15,
    maxBudget: 2.6,
    story: '마을 동쪽 마력 탄광을 지휘하는 베테랑 광부 대장.',
    reactionText: '콰과광! 벽이 먼지처럼 흩날리며 드디어 청동 광맥이 훤히 드러났소! 역시 폭발력이 끝내주는구려!',
    reactionEffect: 'explode',
  },
  {
    name: '화난 성벽 철거 기사',
    avatarEmoji: '🛡️',
    avatarColor: 'bg-yellow-50 border-yellow-500 text-yellow-950',
    dialog: '훈련장 구석의 오래된 마법 장벽을 허물어야 하는데 기사단의 함머로는 흠집도 안 나는구려! 폭발 반응을 일으켜 한 번에 장벽을 무너뜨릴 특효 폭발성 물약이 시급하오!',
    targetEffect: '폭발',
    minIntensity: 12,
    maxBudget: 2.3,
    story: '기사단의 훈련 시설과 성벽 유지보수를 담당하는 억척스러운 돌격 대장.',
    reactionText: '우하하하! 대단한 위력의 폭풍이로다! 그 견고하던 방벽이 단박에 산산조각 났소! 속이 다 시원하군!',
    reactionEffect: 'explode',
  }
];

export function blendColors(ingredients: { [id: string]: number }): string {
  const keys = Object.keys(ingredients).filter(k => ingredients[k] > 0);
  if (keys.length === 0) return '#e2e8f0'; // grayish/transparent water base

  let r = 0, g = 0, b = 0;
  let totalCount = 0;

  keys.forEach(key => {
    const count = ingredients[key];
    const ing = INGREDIENTS.find(i => i.id === key);
    if (!ing) return;

    const hex = ing.color.replace('#', '');
    const ir = parseInt(hex.substring(0, 2), 16);
    const ig = parseInt(hex.substring(2, 4), 16);
    const ib = parseInt(hex.substring(4, 6), 16);

    r += ir * count;
    g += ig * count;
    b += ib * count;
    totalCount += count;
  });

  if (totalCount === 0) return '#cbd5e1';
  r = Math.round(r / totalCount);
  g = Math.round(g / totalCount);
  b = Math.round(b / totalCount);

  const rs = r.toString(16).padStart(2, '0');
  const gs = g.toString(16).padStart(2, '0');
  const bs = b.toString(16).padStart(2, '0');

  return `#${rs}${gs}${bs}`;
}

export function generateRandomCustomer(): Customer {
  const base = CUSTOMER_POOL[Math.floor(Math.random() * CUSTOMER_POOL.length)];
  const randomId = Math.random().toString(36).substring(2, 9);
  // Introduce small random variations in minIntensity and dialog slightly
  const intensityVar = Math.floor(Math.random() * 5) - 2; // -2 to +2
  const minIntensity = Math.max(5, base.minIntensity + intensityVar);

  return {
    ...base,
    id: `customer-${randomId}`,
    minIntensity,
  } as Customer;
}

export function calculatePotionPrice(potion: any, customer: any) {
  const requestedEffect = customer.targetEffect;
  const minIntensity = customer.minIntensity;
  const actualIntensity = potion.effects[requestedEffect] || 0;

  const hasEffect = actualIntensity > 0;
  const isStrongEnough = actualIntensity >= minIntensity;

  if (hasEffect && isStrongEnough) {
    // Base value of a healing potion is 22 G
    const basePotionValue = 22; 
    const budgetMultiplier = customer.maxBudget; // e.g. 2.0 to 2.5
    
    // Quality bonus: +3% per level of intensity above minimum, capped at +30%
    const intensityDifference = actualIntensity - minIntensity;
    const qualityBonus = 1 + Math.min(10, intensityDifference) * 0.03; 

    const finalPrice = Math.round(basePotionValue * budgetMultiplier * qualityBonus);
    return { finalPrice, success: true, actualIntensity, minIntensity, hasEffect };
  } else {
    // Fails to meet requirements. Pity gold is 10% of ingredient cost, maxed out to 5 G
    const pityPrice = Math.min(5, Math.max(1, Math.floor(potion.totalCost * 0.1)));
    return { finalPrice: pityPrice, success: false, actualIntensity, minIntensity, hasEffect };
  }
}
