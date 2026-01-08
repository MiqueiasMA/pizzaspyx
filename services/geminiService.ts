import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey.length < 5) {
    console.error("DIAGNÓSTICO: API_KEY está ausente ou inválida no ambiente process.env.API_KEY");
  } else {
    console.log("DIAGNÓSTICO: API_KEY carregada com sucesso (prefixo: " + apiKey.substring(0, 5) + "...)");
  }
  return new GoogleGenAI({ apiKey: apiKey || "" });
};

export const geminiService = {
  async scanLeads(nicho: string, local: string, existingNames: string[] = []) {
    console.log(`INICIANDO VARREDURA: Nicho=${nicho}, Local=${local}`);
    try {
      const ai = getAI();
      const excludePrompt = existingNames.length > 0 
        ? `\nIgnore: ${existingNames.join(", ")}.`
        : "";

      console.log("CHAMANDO API GEMINI...");
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Encontre 10 estabelecimentos REAIS de "${nicho}" em "${local}". 
        Critérios: 50-350 avaliações, Delivery, notas 3.7-4.4.${excludePrompt}
        Retorne JSON ARRAY.`,
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

      console.log("API RESPONDEU COM SUCESSO.");
      const text = response.text;
      if (!text) {
        console.error("ERRO: Resposta de texto vazia da IA.");
        throw new Error("A IA não retornou nenhum texto.");
      }
      
      const parsed = JSON.parse(text);
      console.log(`DADOS EXTRAÍDOS: ${parsed.length} leads encontrados.`);
      return parsed;
    } catch (e: any) {
      console.group("ERRO NA VARREDURA (DIAGNÓSTICO)");
      console.error("Mensagem:", e.message);
      console.error("Objeto Completo:", e);
      if (e.message?.includes("API_KEY")) console.error("DICA: Verifique suas variáveis de ambiente na Vercel.");
      if (e.message?.includes("googleSearch")) console.error("DICA: Sua API Key pode não ter acesso à ferramenta de busca.");
      console.groupEnd();
      throw e;
    }
  },

  async generateAnalysis(leadName: string, localizacao: string) {
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Análise profunda: "${leadName}" em "${localizacao}".`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json"
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (e) {
      console.error("Erro na análise profunda:", e);
      throw e;
    }
  },

  async generatePitch(leadName: string, insight: string) {
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Pitch para: "${leadName}". Insight: "${insight}".`,
        config: {
          responseMimeType: "application/json"
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (e) {
      console.error("Erro ao gerar pitch:", e);
      throw e;
    }
  }
};