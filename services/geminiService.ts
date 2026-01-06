
import { GoogleGenAI } from "@google/genai";

export const generateProfessionalNote = async (context: string): Promise<string> => {
  try {
    // Fix: Initialize GoogleGenAI with process.env.API_KEY directly as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Atue como um especialista em gestão empresarial e fiscal em Angola. Gere uma nota profissional, formal e concisa para o rodapé de uma fatura. 
      A nota deve mencionar agradecimento, conformidade com a legislação tributária vigente e, se possível, referir a importância da liquidação dentro do prazo. 
      Contexto específico: ${context}.
      Idioma: Português de Angola. Evite redundâncias.`,
    });
    
    return response.text?.trim() || "Agradecemos a confiança depositada nos nossos serviços.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Agradecemos a preferência. Serviços prestados em conformidade com as normas em vigor.";
  }
};

export const analyzeInvoiceSummary = async (invoiceText: string): Promise<string> => {
  try {
    // Fix: Initialize GoogleGenAI with process.env.API_KEY directly as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Analise este resumo de fatura empresarial e verifique se os termos estão de acordo com as boas práticas comerciais e fiscais: ${invoiceText}`,
    });
    
    return response.text?.trim() || "Análise indisponível.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erro ao analisar conformidade.";
  }
};
