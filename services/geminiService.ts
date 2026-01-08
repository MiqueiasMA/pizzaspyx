import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("ERRO CRÍTICO: Variável API_KEY não definida no ambiente.");
  }
  return new GoogleGenAI({ apiKey: apiKey || "" });
};

export const geminiService = {
  async scanLeads(nicho: string, local: string, existingNames: string[] = []) {
    try {
      const ai = getAI();
      const excludePrompt = existingNames.length > 0 
        ? `\nIMPORTANTE: Ignore estes locais: ${existingNames.join(", ")}.`
        : "";

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Aja como um especialista em inteligência de vendas. Encontre 10 estabelecimentos REAIS de "${nicho}" em "${local}". 
        
        CRITÉRIOS:
        1. MATURIDADE: 50 a 350 avaliações no Google.
        2. OPERAÇÃO: Foco em Delivery/Retirada.
        3. GAPS: Notas entre 3.7 e 4.4, sem site oficial ou presença digital amadora.${excludePrompt}

        Retorne EXATAMENTE um array JSON com 10 objetos.`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                nome: { type: Type.STRING },
                endereco: { type: Type.STRING },
                nota: { type: Type.NUMBER },
                reviews: { type: Type.INTEGER },
                whatsapp: { type: Type.STRING },
                website: { type: Type.STRING },
                insight: { type: Type.STRING }
              },
              required: ["nome", "endereco", "nota", "reviews", "insight"]
            }
          }
        }
      });

      return JSON.parse(response.text || '[]');
    } catch (e) {
      console.error("Erro na chamada Gemini (scanLeads):", e);
      throw e;
    }
  },

  async generateAnalysis(leadName: string, localizacao: string) {
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `Investigação profunda sobre "${leadName}" em "${localizacao}".`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              proprietario: { type: Type.STRING },
              cnpj: { type: Type.STRING },
              contatoAdmin: { type: Type.STRING },
              fortes: { type: Type.ARRAY, items: { type: Type.STRING } },
              fracos: { type: Type.ARRAY, items: { type: Type.STRING } },
              oportunidades: { type: Type.ARRAY, items: { type: Type.STRING } },
              ameacas: { type: Type.ARRAY, items: { type: Type.STRING } },
              comparativoConcorrencia: { type: Type.STRING },
              ouro: { type: Type.STRING }
            },
            required: ["fortes", "fracos", "oportunidades", "ameacas", "ouro"]
          }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (e) {
      console.error("Erro na análise profunda:", e);
      return {};
    }
  },

  async generatePitch(leadName: string, insight: string) {
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Crie um pitch para "${leadName}". Insight: "${insight}".`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              mensagem: { type: Type.STRING }
            },
            required: ["mensagem"]
          }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (e) {
      console.error("Erro ao gerar pitch:", e);
      return { mensagem: "Não foi possível gerar a proposta automática." };
    }
  }
};