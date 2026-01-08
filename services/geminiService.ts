import { GoogleGenAI, Type } from "@google/genai";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("ERRO: API_KEY ausente.");
  }
  return new GoogleGenAI({ apiKey: apiKey || "" });
};

export const geminiService = {
  async scanLeads(nicho: string, local: string, retries = 0): Promise<any[]> {
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Localize 10 ${nicho} reais em ${local}. Retorne obrigatoriamente um JSON array seguindo este esquema exato.`,
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

      if (!response.text) throw new Error("A Inteligência retornou dados vazios.");
      return JSON.parse(response.text);
    } catch (e: any) {
      if ((e.message?.includes("429") || e.status === 429) && retries < 1) {
        console.warn("Quota temporária excedida. Aguardando 4s para retry...");
        await delay(4000);
        return this.scanLeads(nicho, local, retries + 1);
      }
      this.handleApiError(e);
      throw e;
    }
  },

  handleApiError(e: any) {
    if (e.message?.includes("429") || e.status === 429) {
      e.friendlyMessage = "LIMITE DE QUOTA: A ferramenta de pesquisa do Google (Search) atingiu o limite de consultas gratuitas. Aguarde 1 minuto ou mude para o plano Pay-as-you-go.";
    } else if (e.message?.includes("API_KEY")) {
      e.friendlyMessage = "Falha de Autenticação: Verifique a configuração da sua API_KEY.";
    } else {
      e.friendlyMessage = "Erro no Motor de Busca: " + (e.message || "Erro desconhecido");
    }
  },

  async generateAnalysis(leadName: string, localizacao: string) {
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Realize uma análise SWOT técnica para o negócio "${leadName}" em "${localizacao}". Inclua dados sobre dono e CNPJ se encontrar na rede.`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json"
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (e: any) {
      this.handleApiError(e);
      throw e;
    }
  },

  async generatePitch(leadName: string, insight: string) {
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Gere um script de abordagem persuasivo para WhatsApp. Empresa: "${leadName}". Insight: "${insight}". Foco: Venda de serviços de Marketing/Agência.`,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || '{}');
    } catch (e: any) {
      this.handleApiError(e);
      throw e;
    }
  }
};