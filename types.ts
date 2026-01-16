
export type SubjectId = 
  | 'physics' | 'chemistry' | 'maths' | 'english' | 'computer_science' | 'physical_education';

export interface Chapter {
  id: string;
  title: string;
  description: string;
  isImportant?: boolean;
  totalParts: number;
}

export interface Subject {
  id: SubjectId;
  name: string;
  icon: string;
  color: string;
  chapters: Chapter[];
}

export interface NoteSection {
  title: string;
  content: string;
  type: 'theory' | 'formula' | 'trick' | 'reaction' | 'code' | 'summary' | 'application' | 'derivation' | 'character_sketch' | 'stanza_analysis';
  visualPrompt?: string;
}

export interface ImportantQuestion {
  question: string;
  solution: string;
  yearAnalysis: string;
  marks?: number;
  qType?: string; // e.g., 'VSA', 'SA-I', 'SA-II', 'LA', 'Case-Based'
  visualPrompt?: string; // Prompt for generating a diagram/illustration
}

export interface ChapterNote {
  chapterTitle: string;
  subject: SubjectId;
  sections: NoteSection[];
  importantQuestions: ImportantQuestion[];
  part?: number;
}

export interface PremiumQuestion {
  question: string;
  solution: string;
  freqencyScore: number; // 1-10
  repeatedYears: string[];
  marks: number;
  qType: string;
  visualPrompt?: string; // Prompt for generating a diagram/illustration
}

export interface UserProfile {
  email: string;
  phone: string;
  purchasedSubjects: SubjectId[];
  lastLogin: number;
}

export interface AppSettings {
  premiumPrice: number;
  isVaultOpen: boolean;
}

export interface DownloadRecord {
  id: string;
  chapterTitle: string;
  timestamp: number;
}
