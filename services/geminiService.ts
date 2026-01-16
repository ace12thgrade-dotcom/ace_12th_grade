
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ChapterNote, SubjectId, PremiumQuestion } from "../types";

// Cleaned up the system instruction to remove corrupted escaping from previous turns
const SYSTEM_INSTRUCTION = `You are "Ace12thGRADE AI Master", the top-rated CBSE examiner and teacher with 20+ years of experience in paper setting. 

STYLE & ACCURACY RULES:
1. ACCURACY: Every fact, formula, and solution must be 100% accurate based on latest NCERT and CBSE Marking Schemes (2024-25).
2. CBSE FORMAT: Categorize questions strictly into: 
   - VSA (1 Mark)
   - SA-I (2 Marks)
   - SA-II (3 Marks)
   - Case-Based (4 Marks)
   - LA (5 Marks)
3. STEP MARKING: Provide solutions in a step-by-step format as per CBSE topper answer sheets. Use labels like [Step 1], [Formula], [Calculation].
4. DIAGRAMS: If a solution requires a diagram (e.g., Physics circuits, Ray optics, Chem structures, Math graphs), include a "visualPrompt" that describes a clear, professional textbook illustration.
5. HIGH CONTRAST: Use **Bold** for every key term, law, name, and important value.
6. NO MARKDOWN JARGON: Use plain text formatting. Do not use markdown backticks (\`) for surrounding text unless specifically requested for code.
7. SYMBOLS: Use symbols: ² (square), ³ (cube), √ (root), π, θ, α, β, Δ, →, ±.`;

const NOTE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    chapterTitle: { type: Type.STRING },
    subject: { type: Type.STRING },
    sections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['theory', 'formula', 'trick', 'reaction', 'code', 'summary', 'application', 'derivation', 'character_sketch', 'stanza_analysis'] },
          visualPrompt: { type: Type.STRING, description: "A simple prompt for a high-quality educational diagram." }
        },
        required: ['title', 'content', 'type']
      }
    },
    importantQuestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          solution: { type: Type.STRING },
          yearAnalysis: { type: Type.STRING },
          marks: { type: Type.NUMBER },
          qType: { type: Type.STRING },
          visualPrompt: { type: Type.STRING, description: "Prompt for a textbook-style diagram if relevant." }
        },
        required: ['question', 'solution', 'yearAnalysis', 'marks', 'qType']
      }
    }
  },
  required: ['chapterTitle', 'subject', 'sections', 'importantQuestions']
};

const PREMIUM_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      question: { type: Type.STRING },
      solution: { type: Type.STRING },
      freqencyScore: { type: Type.NUMBER },
      repeatedYears: { type: Type.ARRAY, items: { type: Type.STRING } },
      marks: { type: Type.NUMBER, description: "1, 2, 3, 4, or 5 marks." },
      qType: { type: Type.STRING, description: "VSA, SA-I, SA-II, Case-Based, or LA." },
      visualPrompt: { type: Type.STRING, description: "Detailed prompt for a professional educational illustration." }
    },
    required: ['question', 'solution', 'freqencyScore', 'repeatedYears', 'marks', 'qType']
  }
};

const audioCache = new Map<string, AudioBuffer>();

/**
 * Robust retry mechanism for production reliability on Vercel
 */
async function retryRequest<T>(fn: () => Promise<T>, retries = 5, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    console.error("Gemini API Error details:", error);
    // Retry on rate limit (429) or transient server errors (500, 503)
    if (retries > 0 && (error.status === 429 || error.status === 503 || error.status === 500)) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryRequest(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

const getCachedData = (key: string) => {
  const data = localStorage.getItem(key);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      return null;
    }
  }
  return null;
};

export const generateChapterNotes = async (
  subjectId: SubjectId, 
  chapterTitle: string, 
  part: number,
  totalParts: number
): Promise<ChapterNote> => {
  // Use template literal for cache key
  const cacheKey = `note_v11_${subjectId}_${chapterTitle}_${part}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const prompt = `EXHAUSTIVE PREMIUM NOTES for "${chapterTitle}" (${subjectId}), Part ${part}/${totalParts}. 
  Requirements:
  1. Detailed theory with **Bolded** key terms.
  2. Every important NCERT definition.
  3. Strategic Board Prep tips.
  4. 8 highly important Board questions (2x1m, 2x2m, 2x3m, 2x5m).
  5. For 3-mark and 5-mark questions, focus on DIAGRAM-BASED questions where applicable. If the question involves a diagram, provide a 'visualPrompt'.`;

  const result = await retryRequest(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: NOTE_SCHEMA,
      },
    });
    // Guidelines: response.text is a property, not a function
    const parsed = JSON.parse(response.text || '{}');
    const finalNote = { ...parsed, part };
    localStorage.setItem(cacheKey, JSON.stringify(finalNote));
    return finalNote;
  });

  return result;
};

export const generatePremiumQuestions = async (subjectId: SubjectId): Promise<PremiumQuestion[]> => {
  // Use template literal for cache key
  const cacheKey = `premium_vault_v16_${subjectId}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const prompt = `CBSE BOARD SOLVED ARCHIVE (2015-2025): Extract 50 high-yield questions for Class 12 ${subjectId}.
  
  MANDATORY: 
  - Include exactly 10 questions that are DIAGRAM-BASED or require visual aids for full marks.
  - For complex derivations or mechanisms, describe a clear diagram in 'visualPrompt'.
  
  PATTERN:
  - 15 x 5-Mark LA (Focus on derivations/long theory/diagrams).
  - 15 x 3-Mark SA-II (Conceptual/Reasoning/Numericals).
  - 10 x 2-Mark SA-I (Definitions/Direct Proofs).
  - 5 x 4-Mark Case Study.
  - 5 x 1-Mark A-R/MCQs.`;

  const result = await retryRequest(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: PREMIUM_SCHEMA.items
        },
      },
    });
    // Guidelines: response.text is a property, not a function
    const parsed = JSON.parse(response.text || '[]');
    localStorage.setItem(cacheKey, JSON.stringify(parsed));
    return parsed;
  });

  return result;
};

export const generateAestheticImage = async (prompt: string): Promise<string | null> => {
  const cacheKey = `img_v6_${btoa(prompt).slice(0, 48)}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return cached;

  try {
    return await retryRequest(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: `${prompt}. Clean textbook illustration, white background, high-contrast black and blue lines, educational scientific style, sharp detail, labeled diagram.` }] },
        config: { imageConfig: { aspectRatio: "1:1" } }
      });
      // Find the image part in the response
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const data = `data:image/png;base64,${part.inlineData.data}`;
          localStorage.setItem(cacheKey, data);
          return data;
        }
      }
      return null;
    });
  } catch (e) {
    console.error("Image generation failed:", e);
    return null;
  }
};

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const generateSpeech = async (text: string, isSummary: boolean = false): Promise<AudioBuffer | null> => {
  const hash = btoa(text.slice(0, 100) + text.length + (isSummary ? '1' : '0'));
  if (audioCache.has(hash)) return audioCache.get(hash)!;

  const instruction = isSummary ? "Quick summary:" : "Board teacher lecture:";

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `${instruction} ${text.slice(0, 2500)}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return null;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioBytes = decodeBase64(base64Audio);
    const buffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);
    
    audioCache.set(hash, buffer);
    return buffer;
  } catch (e) {
    console.error("Speech generation failed:", e);
    return null;
  }
};
