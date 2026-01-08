import { GoogleGenAI, Type } from "@google/genai";

// Função auxiliar para inicializar o AI apenas quando necessário
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY não encontrada. Verifique as variáveis de ambiente.");
  }
  return new GoogleGenAI({ apiKey: apiKey || "" });
};

export const geminiService = {
  /**
   * Realiza a varredura de leads focada no "Sweet Spot".
   */
  async scanLeads(nicho: string, local: string, existingNames: string[] = []) {
    const ai = getAI();
    const excludePrompt = existingNames.length > 0 
      ? `\nIMPORTANTE: Não retorne nenhum destes estabelecimentos que já encontrei: ${existingNames.join(", ")}. Busque novos alvos.`
      : "";

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Aja como um especialista em inteligência de vendas. Encontre 10 estabelecimentos REAIS de "${nicho}" em "${local}". 
      
      CRITÉRIOS DO "SWEET SPOT":
      1. MATURIDADE: 50 a 350 avaliações no Google.
      2. OPERAÇÃO: Foco em Delivery/Retirada.
      3. GAPS: Notas entre 3.7 e 4.4, sem site oficial ou presença digital amadora.${excludePrompt}

      Retorne exatamente 10 resultados únicos e verificáveis que se encaixam perfeitamente para prospecção de tráfego pago e gestão de presença online.`,
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

    try {
      return JSON.parse(response.text || '[]');
    } catch (e) {
      console.error("Erro ao processar JSON da varredura:", e);
      return [];
    }
  },

  async generateAnalysis(leadName: string, localizacao: string) {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Realize uma investigação profunda sobre o estabelecimento "${leadName}" em "${localizacao}".
      
      TAREFAS:
      1. Localize dados corporativos (CNPJ, Nome do Proprietário/Sócio).
      2. Análise Competitiva: Compare com 2-3 vizinhos.
      3. Análise SWOT Detalhada.
      4. Diagnóstico Financeiro de perda por falta de tráfego.`,
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
          required: ["fortes", "fracos", "oportunidades", "ameacas", "ouro", "comparativoConcorrencia"]
        }
      }
    });

    try {
      return JSON.parse(response.text || '{}');
    } catch (e) {
      console.error("Erro na análise:", e);
      return {};
    }
  },

  async generatePitch(leadName: string, insight: string) {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Crie um pitch de alta conversão para o WhatsApp do dono da "${leadName}". Insight: "${insight}". Seja direto, humano e foque em ROI.`,
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

    try {
      return JSON.parse(response.text || '{}');
    } catch (e) {
      console.error("Erro no pitch:", e);
      return { mensagem: "Erro ao gerar proposta automática." };
    }
  }
};