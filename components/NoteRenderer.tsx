
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ChapterNote, NoteSection, DownloadRecord } from '../types';
import { generateAestheticImage, generateSpeech } from '../services/geminiService';

const DOWNLOADS_KEY = 'ace12_downloads';

export interface FormattedTextProps {
  text: string;
  className?: string;
}

/**
 * Enhanced Text Formatter for Extreme Visibility
 */
export const FormattedText: React.FC<FormattedTextProps> = ({ text, className = "" }) => {
  const elements = useMemo(() => {
    if (!text) return "";
    
    const clean = text
      .replace(/\\(['"_])/g, '$1') 
      .replace(/\$+(.*?)\$+/gs, '$1');
      
    const parts = clean.split(/(\*\*.*?\*\*)/gs);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-extrabold text-black dark:text-white bg-indigo-50 dark:bg-indigo-950/40 px-1 rounded">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={i}>{part}</span>;
    });
  }, [text]);

  return (
    <div className={`${className} leading-relaxed whitespace-pre-wrap`}>
      {elements}
    </div>
  );
};

/**
 * Professional Educational Diagram Component
 */
export const DiagramImage = ({ prompt, small = false }: { prompt: string, small?: boolean }) => {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchImg = async () => {
      const url = await generateAestheticImage(prompt);
      if (active) {
        setImgUrl(url);
        setLoading(false);
      }
    };
    fetchImg();
    return () => { active = false; };
  }, [prompt]);

  if (loading) return (
    <div className={`no-print ${small ? 'w-32 h-32' : 'w-full max-w-[400px] aspect-square'} rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse flex flex-col items-center justify-center p-8 mx-auto border-2 border-dashed border-slate-200 dark:border-slate-800`}>
      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
      <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Illustrating Concept...</span>
    </div>
  );

  if (!imgUrl) return null;

  return (
    <div className={`${small ? 'w-48 h-48' : 'w-full max-w-[450px]'} shadow-2xl rounded-[2rem] overflow-hidden border-2 border-slate-200 dark:border-slate-800 mx-auto md:mx-0 transition-all hover:scale-[1.02] bg-white group cursor-zoom-in`}>
      <img src={imgUrl} alt="Educational Diagram" className="w-full h-auto block" />
      <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/5 transition-colors"></div>
    </div>
  );
};

interface NoteRendererProps {
  note: ChapterNote;
}

const NoteRenderer: React.FC<NoteRendererProps> = ({ note }) => {
  const [audioMode, setAudioMode] = useState<'idle' | 'loading' | 'playing'>('idle');
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const handlePrint = () => { 
    const record: DownloadRecord = {
      id: Math.random().toString(36).substr(2, 9),
      chapterTitle: note.chapterTitle || 'Module',
      timestamp: Date.now()
    };
    const existing = JSON.parse(localStorage.getItem(DOWNLOADS_KEY) || '[]');
    localStorage.setItem(DOWNLOADS_KEY, JSON.stringify([record, ...existing]));
    window.print();
  };

  const stopAudio = () => {
    sourceNodeRef.current?.stop();
    setAudioMode('idle');
  };

  const handleStartAudio = async (isSummary: boolean) => {
    if (audioMode === 'playing') {
      stopAudio();
      return;
    }

    setAudioMode('loading');
    
    // Concatenate all sections for a single continuous reading experience
    const sectionsText = note.sections.map(s => `${s.title}: ${s.content}`).join('. ');
    const questionsText = note.importantQuestions.length > 0 
      ? `Important Board Questions. ${note.importantQuestions.map(q => `Question: ${q.question}. Solution: ${q.solution}`).join('. ')}` 
      : '';
    
    const fullText = `${note.chapterTitle}. ${sectionsText}. ${questionsText}`;
    
    const buffer = await generateSpeech(fullText, isSummary);
    if (!buffer) {
      setAudioMode('idle');
      return;
    }

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = () => setAudioMode('idle');
    source.start();
    sourceNodeRef.current = source;
    setAudioMode('playing');
  };

  useEffect(() => {
    return () => {
      sourceNodeRef.current?.stop();
    };
  }, []);

  const renderSection = (section: NoteSection, index: number) => {
    const isFormula = section.type === 'formula' || section.type === 'reaction';

    if (isFormula) {
      return (
        <div key={index} className="my-8 section-card bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 md:p-10 shadow-sm flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                 <div className={`w-2.5 h-2.5 rounded-full ${section.type === 'formula' ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-900 dark:text-slate-100">
                    {section.type === 'formula' ? 'BOARD FORMULA' : 'CORE REACTION'}
                 </span>
               </div>
            </div>
            <h4 className="text-2xl font-black text-black dark:text-white mb-6 tracking-tight">{section.title}</h4>
            <div className="bg-white dark:bg-black p-6 rounded-2xl border border-slate-900 dark:border-slate-100 mb-4 shadow-lg">
              <FormattedText text={section.content} className="text-xl md:text-2xl font-black text-black dark:text-white text-center" />
            </div>
          </div>
          {section.visualPrompt && <DiagramImage prompt={section.visualPrompt} small={true} />}
        </div>
      );
    }

    const hasVisual = !!section.visualPrompt;
    return (
      <div key={index} className={`my-10 section-card ${hasVisual ? 'flex flex-col md:flex-row gap-10 items-start' : ''}`}>
        <div className="flex-1 w-full">
          <div className="flex items-center justify-between mb-6 group/title">
            <h3 className="text-2xl md:text-3xl font-black text-black dark:text-white flex items-center gap-4 tracking-tighter">
              <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
              {section.title}
            </h3>
          </div>
          <FormattedText text={section.content} className="note-content text-lg font-bold text-slate-950 dark:text-white leading-relaxed" />
        </div>
        {hasVisual && <DiagramImage prompt={section.visualPrompt!} />}
      </div>
    );
  };

  return (
    <div className="note-container max-w-4xl mx-auto py-10 px-6 md:px-16 bg-white dark:bg-slate-950 md:rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 no-print gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg">A12</div>
          <span className="text-black dark:text-white text-[9px] font-black uppercase tracking-[0.3em]">ACE12THGRADE ELITE ARCHIVE</span>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-3">
          {audioMode === 'loading' ? (
            <div className="bg-indigo-50 dark:bg-indigo-900/40 px-6 py-3 rounded-xl flex items-center gap-3 animate-pulse">
               <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
               <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600">Synthesizing...</span>
            </div>
          ) : audioMode === 'playing' ? (
            <button 
              onClick={stopAudio}
              className="bg-rose-600 text-white px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3 animate-pulse border border-rose-400/30"
            >
              <span className="text-lg">⏹</span>
              <span>STOP LECTURE</span>
            </button>
          ) : (
            <>
              <button 
                onClick={() => handleStartAudio(true)}
                className="bg-indigo-600 text-white px-6 py-3 rounded-full font-black text-[9px] uppercase tracking-widest shadow-lg hover:scale-105 transition-all border-b-2 border-indigo-800 flex items-center gap-2"
              >
                <span className="text-lg">⚡</span>
                <span>RECAP</span>
              </button>
              <button 
                onClick={() => handleStartAudio(false)}
                className="bg-slate-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-full font-black text-[9px] uppercase tracking-widest shadow-lg hover:scale-105 transition-all flex items-center gap-2"
              >
                <span className="text-lg">🎧</span>
                <span>LECTURE</span>
              </button>
            </>
          )}
          
          <button 
            onClick={handlePrint} 
            className="bg-emerald-600 text-white px-8 py-3 rounded-full font-black text-[9px] uppercase tracking-widest shadow-lg hover:bg-emerald-700 transition-all border-b-2 border-emerald-800"
          >
            PRINT NOTES
          </button>
        </div>
      </div>

      <header className="mb-14 text-center">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-black dark:text-white tracking-tighter mb-4 leading-tight uppercase">
          {note.chapterTitle}
        </h1>
        <div className="flex justify-center items-center gap-3">
          <div className="inline-block bg-indigo-600 text-white px-6 py-1.5 rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-md">
            {note.subject}
          </div>
          <div className="inline-block border border-slate-200 dark:border-slate-800 text-slate-500 px-6 py-1.5 rounded-full font-black text-[10px] uppercase tracking-[0.3em]">
            PART {note.part || 1}
          </div>
        </div>
      </header>

      <div className="space-y-10">
        {note.sections.map((section, idx) => renderSection(section, idx))}
      </div>

      {note.importantQuestions.length > 0 && (
        <div className="mt-20 pt-16 border-t-4 border-slate-100 dark:border-slate-900">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-12 gap-3">
            <h2 className="text-3xl md:text-5xl font-black text-black dark:text-white tracking-tighter italic underline decoration-indigo-600 decoration-4 underline-offset-8">
              Board <span className="text-indigo-600 not-italic">Elite Archive.</span>
            </h2>
          </div>
          
          <div className="grid gap-10">
            {note.importantQuestions.map((q, idx) => (
              <div key={idx} className="section-card bg-slate-50 dark:bg-slate-900/40 p-8 md:p-12 rounded-[2rem] border border-slate-300 dark:border-slate-700 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <span className="bg-black text-white dark:bg-white dark:text-black text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-md">
                      {q.qType} • {q.marks} Marks
                    </span>
                    <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest">{q.yearAnalysis}</span>
                  </div>
                  <span className="text-indigo-600 font-black text-5xl italic opacity-20">#{idx+1}</span>
                </div>
                <h4 className="text-2xl md:text-3xl font-black text-black dark:text-white mb-8 leading-tight">
                   <FormattedText text={q.question} />
                </h4>

                {q.visualPrompt && (
                  <div className="my-8">
                    <DiagramImage prompt={q.visualPrompt} />
                    <p className="text-[9px] font-black uppercase text-indigo-600 mt-3 tracking-[0.2em] italic">Illustration: Visual Core Concept</p>
                  </div>
                )}

                <div className="bg-white dark:bg-black p-8 rounded-[1.5rem] border-2 border-indigo-600 shadow-xl">
                   <div className="text-[9px] font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-300 mb-4">Strategic Solution</div>
                   <FormattedText text={q.solution} className="text-black dark:text-white text-lg md:text-xl font-bold" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <footer className="mt-20 pt-8 border-t border-slate-100 dark:border-slate-800 text-center text-slate-900 dark:text-slate-300 text-[8px] font-black uppercase tracking-[0.4em] no-print">
        ACE12THGRADE • 2025 ELITE ACADEMIC SERIES • NCERT VERIFIED
      </footer>
    </div>
  );
};

export default NoteRenderer;
