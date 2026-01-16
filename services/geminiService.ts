import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ChapterNote, SubjectId, PremiumQuestion } from "../types";

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
4. DIAGRAMS: If a solution requires a diagram, include a "visualPrompt" that describes a clear textbook illustration.
5. HIGH CONTRAST: Use **Bold** for every key term, law, and important value.
6. NO MARKDOWN JARGON: Use plain text formatting.
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
          visualPrompt: { type: Type.STRING }
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
          visualPrompt: { type: Type.STRING }
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
      marks: { type: Type.NUMBER },
      qType: { type: Type.STRING },
      visualPrompt: { type: Type.STRING }
    },
    required: ['question', 'solution', 'freqencyScore', 'repeatedYears', 'marks', 'qType']
  }
};

const audioCache = new Map<string, AudioBuffer>();

function safeLocalStorageSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
      console.warn("Storage quota exceeded. Clearing non-essential data...");
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('img_') || k.includes('base64'))) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
      try { localStorage.setItem(key, value); } catch (retryError) {}
    }
  }
}

async function retryRequest<T>(fn: () => Promise<T>, retries = 5, delay = 1000): Promise<T> {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "" || apiKey === "undefined" || apiKey === "null") {
    // This will be caught by the UI and shown as the error
    throw new Error("API KEY MISSING: Please add API_KEY to Netlify Environment Variables.");
  }
  
  try {
    return await fn();
  } catch (error: any) {
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
    try { return JSON.parse(data); } catch (e) { return null; }
  }
  return null;
};

// Fix: Use gemini-3-pro-preview for complex reasoning tasks and follow SDK guidelines for initialization
export const generateChapterNotes = async (
  subjectId: SubjectId, 
  chapterTitle: string, 
  part: number,
  totalParts: number
): Promise<ChapterNote> => {
  const cacheKey = `note_v11_${subjectId}_${chapterTitle}_${part}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const prompt = `EXHAUSTIVE PREMIUM NOTES for "${chapterTitle}" (${subjectId}), Part ${part}/${totalParts}. 
  Include detailed theory, NCERT definitions, and 8 Board questions (2x1m, 2x2m, 2x3m, 2x5m).`;

  const result = await retryRequest(async () => {
    // Fix: Using correct model for complex STEM reasoning and correct initialization
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: NOTE_SCHEMA,
        thinkingConfig: { thinkingBudget: 4096 }
      },
    });
    const parsed = JSON.parse(response.text || '{}');
    const finalNote = { ...parsed, part };
    safeLocalStorageSet(cacheKey, JSON.stringify(finalNote));
    return finalNote;
  });

  return result;
};

// Fix: Use gemini-3-pro-preview for complex reasoning tasks
export const generatePremiumQuestions = async (subjectId: SubjectId): Promise<PremiumQuestion[]> => {
  const cacheKey = `premium_vault_v16_${subjectId}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const prompt = `CBSE BOARD SOLVED ARCHIVE (2015-2025): Extract 50 high-yield questions for Class 12 ${subjectId}.`;

  const result = await retryRequest(async () => {
    // Fix: Using correct model for complex reasoning and correct initialization
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: PREMIUM_SCHEMA.items
        },
        thinkingConfig: { thinkingBudget: 4096 }
      },
    });
    const parsed = JSON.parse(response.text || '[]');
    safeLocalStorageSet(cacheKey, JSON.stringify(parsed));
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
      // Fix: Follow initialization guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: `${prompt}. Clean textbook illustration, white background, high-contrast, educational style.` }] },
        config: { imageConfig: { aspectRatio: "1:1" } }
      });
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const data = `data:image/png;base64,${part.inlineData.data}`;
          safeLocalStorageSet(cacheKey, data);
          return data;
        }
      }
      return null;
    });
  } catch (e) {
    return null;
  }
};

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
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

  try {
    // Fix: Follow initialization guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text.slice(0, 2500) }] }],
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
    const buffer = await decodeAudioData(decodeBase64(base64Audio), audioContext, 24000, 1);
    audioCache.set(hash, buffer);
    return buffer;
  } catch (e) {
    return null;
  }
};