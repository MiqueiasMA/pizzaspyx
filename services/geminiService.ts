import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
};

export const geminiService = {
  async scanLeads(nicho: string, local: string, existingNames: string[] = []) {
    try {
      const ai = getAI();
      const excludePrompt = existingNames.length > 0 
        ? `\nNão inclua estes locais: ${existingNames.join(", ")}.`
        : "";

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Encontre 10 estabelecimentos REAIS de "${nicho}" em "${local}" usando Google Search. 
        CRITÉRIOS: 50-350 avaliações, Delivery forte, notas 3.7-4.4.${excludePrompt}
        Retorne APENAS o JSON conforme o esquema definido.`,
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

      const text = response.text;
      if (!text) throw new Error("Resposta vazia da IA");
      return JSON.parse(text);
    } catch (e) {
      console.error("Erro no scanLeads:", e);
      throw e;
    }
  },

  async generateAnalysis(leadName: string, localizacao: string) {
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Faça uma análise SWOT profunda sobre "${leadName}" em "${localizacao}".`,
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
      console.error("Erro na análise:", e);
      return {};
    }
  },

  async generatePitch(leadName: string, insight: string) {
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Crie um pitch persuasivo para "${leadName}". Foco no insight: "${insight}".`,
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
      console.error("Erro no pitch:", e);
      return { mensagem: "Erro ao gerar proposta." };
    }
  }
};