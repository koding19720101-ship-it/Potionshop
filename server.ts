import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini AI SDK
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// AI Potion serving endpoint
app.post("/api/serve-customer", async (req, res) => {
  try {
    const { activeCustomer, servedPotion } = req.body;

    if (!activeCustomer || !servedPotion) {
      return res.status(400).json({ error: "Missing activeCustomer or servedPotion data" });
    }

    const prompt = `
당신은 혼돈의 판타지 물약 상점 시뮬레이션 게임의 게임 마스터이자 AI 손님입니다.
현재 물약 가게를 찾은 손님이 당신이 제조한 물약을 받았습니다. 손님의 인적 사항과 주문 및 서빙된 물약 정보를 바탕으로 리얼한 반응을 결정해주세요.

[손님 정보]
- 이름: ${activeCustomer.name}
- 배경 이야기: ${activeCustomer.story}
- 손님의 대사(주문 목적): "${activeCustomer.dialog}"
- 원하는 효과: [${activeCustomer.targetEffect}]
- 원하는 효과의 최소 요구 강도: +${activeCustomer.minIntensity}

[전달된 물약 정보]
- 물약 이름: ${servedPotion.name}
- 물약의 마법 효과 수치:
${Object.entries(servedPotion.effects)
  .map(([name, val]) => `  * ${name}: +${val}`)
  .join("\n")}

[게임 룰 및 판정 기준]
1. 물약 마실지 여부 결정 (decision):
   - 손님이 요구한 효과 [${activeCustomer.targetEffect}]가 물약에 조금도 없거나(0 이하), 손님이 원하는 목적과 아예 정반대의 물약이라서 매우 의심스러울 경우 refusal('refuse')할 수 있습니다.
   - 웬만해서는 모험심이 있거나 절박한 손님이므로 마셔볼 수도 있습니다 ('drink').
2. 성공 판정 (success):
   - 만약 마시기를 선택했다면, 손님이 요구한 효과 [${activeCustomer.targetEffect}]의 수치가 최소 요구 강도인 +${activeCustomer.minIntensity} 이상이어야 완벽히 성공('success': true)입니다.
   - 강도가 미달이거나, 엉뚱한 효과만 가득할 경우 실패('success': false)입니다.
3. 사망 판정 (dies):
   - 물약에 '독', '폭발', '화염' 효과의 수치 중 하나라도 양수(> 0)이거나 매우 높은 치명적인 속성이 들어있을 경우, 또는 손님의 몸 상태에 맞지 않는 끔찍한 물질이 혼합된 경우, 손님이 사망할 수 있습니다 ('dies': true).
   - 예를 들어, 몸이 약한 노인이나 환자에게 '폭발'이나 '독'이 든 물약을 서빙하면 당연히 사망합니다.
   - 사망 시에는 'dies': true, 'success': false 가 됩니다.
4. 대금 정산 (earnedGold):
   - 손님이 거절한 경우 ('refuse'): 0 G를 지불합니다.
   - 손님이 마시고 만족한 경우 ('success': true, 'dies': false): 30~100 G 사이에서 물약의 전반적인 품질과 강도에 비례해 후하게 지불합니다. (AI 재량)
   - 손님이 마셨으나 실패한 경우 ('success': false, 'dies': false): 실망했으나 성의를 봐서 1~10 G 사이의 약소한 위로금을 매대에 두고 갑니다.
   - 손님이 마시고 사망한 경우 ('dies': true): 당연히 0 G를 받습니다 (유가족도 돈을 내지 않습니다).
5. 반응 대사 (feedback):
   - 손님의 캐릭터 컨셉, 말투, 배경 이야기에 맞춰 극적이고 코믹한 한국어 대사로 작성해주세요.
   - 거절 시: "으윽, 내가 바보인 줄 아나? 여기에 내가 원하는 게 없잖아!" 등 분노/의심 섞인 대사.
   - 마시고 성공 시: "와앗! 전신에 힘이 넘쳐흐른다! 정말 고마워요!" 같은 대성공 반응.
   - 마시고 실패 시: "음... 맛은 괜찮은데 별로 효과가 없군요... 여기 차비나 하쇼." 같은 아쉬운 반응.
   - 마시고 사망 시: "꺼으으윽...! 물약이... 내 배를... 뚫고... (꽥)" 같이 사망하는 처참하고 유쾌한(?) 반응.

다음 JSON 스키마를 엄격히 준수하여 응답하십시오.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            decision: {
              type: Type.STRING,
              description: "Whether the customer decides to drink ('drink') or refuse ('refuse')."
            },
            success: {
              type: Type.BOOLEAN,
              description: "Whether the potion successfully satisfies the customer's request/order."
            },
            dies: {
              type: Type.BOOLEAN,
              description: "Whether the customer dies from drinking this potion (e.g., contains toxic/explosive elements)."
            },
            earnedGold: {
              type: Type.INTEGER,
              description: "The gold amount the customer pays based on the rules (0 for refuse or dies, 30-100 for success, 1-10 for failed drinking)."
            },
            feedback: {
              type: Type.STRING,
              description: "Dramatic and funny custom reaction dialogue in Korean. Do not include prefix like '반응 대사:' or markdown."
            }
          },
          required: ["decision", "success", "dies", "earnedGold", "feedback"]
        }
      }
    });

    const resultText = response.text?.trim() || "{}";
    const resultJson = JSON.parse(resultText);

    res.json(resultJson);
  } catch (error: any) {
    console.error("Gemini serve evaluation error:", error);
    res.status(500).json({ error: error.message || "Failed to evaluate potion serving" });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
