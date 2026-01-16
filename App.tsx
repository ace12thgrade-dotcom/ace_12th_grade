import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { SubjectId, ChapterNote } from './types';
import { SUBJECTS } from './constants';
import { generateChapterNotes } from './services/geminiService';
import NoteRenderer from './components/NoteRenderer';

// Sub-component for the Subject List view
const Home = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
    <div className="max-w-6xl mx-auto">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter">
          ACE12TH<span className="text-indigo-600">GRADE</span>
        </h1>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">The Elite Board Exam Archive</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SUBJECTS.map((subject) => (
          <Link 
            key={subject.id} 
            to={`/subject/${subject.id}`}
            className="group block p-8 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 hover:border-indigo-600 dark:hover:border-indigo-600 transition-all shadow-sm hover:shadow-xl"
          >
            <div className={`w-16 h-16 ${subject.color} rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
              {subject.icon}
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{subject.name}</h2>
            <p className="text-slate-500 font-medium text-sm">{subject.chapters.length} Chapters Available</p>
          </Link>
        ))}
      </div>
    </div>
  </div>
);

// Sub-component for the Chapter List within a Subject
const SubjectView = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const subject = SUBJECTS.find(s => s.id === subjectId);

  if (!subject) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-10">
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Subject Not Found</h2>
      <Link to="/" className="text-indigo-600 font-bold uppercase tracking-widest text-xs">Back to Dashboard</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest mb-8 hover:gap-3 transition-all">
          ← Back to Subjects
        </Link>
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 ${subject.color} rounded-xl flex items-center justify-center text-2xl shadow-md`}>
              {subject.icon}
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{subject.name}</h1>
          </div>
          <p className="text-slate-500 font-bold">Select a chapter to begin studying.</p>
        </header>
        <div className="grid gap-4">
          {subject.chapters.map((chapter) => (
            <div key={chapter.id} className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">{chapter.title}</h3>
                  <p className="text-slate-500 text-sm font-medium">{chapter.description}</p>
                </div>
                {chapter.isImportant && (
                  <span className="bg-rose-100 text-rose-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">High Yield</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: chapter.totalParts }).map((_, i) => (
                  <Link
                    key={i}
                    to={`/chapter/${subject.id}/${encodeURIComponent(chapter.title)}/${i + 1}/${chapter.totalParts}`}
                    className="px-4 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white rounded-lg text-xs font-black uppercase tracking-widest transition-colors border border-slate-200 dark:border-slate-700"
                  >
                    Part {i + 1}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Sub-component for rendering the actual notes
const ChapterView = () => {
  const { subjectId, title, part, total } = useParams<{ subjectId: string, title: string, part: string, total: string }>();
  const [note, setNote] = useState<ChapterNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fix: Implemented missing variables and functions reported in errors
  const fetchNote = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await generateChapterNotes(
        subjectId as SubjectId, 
        decodeURIComponent(title || ''), 
        parseInt(part || '1'), 
        parseInt(total || '1')
      );
      setNote(data);
    } catch (err: any) {
      console.error("Failed to load notes:", err);
      // Fix: Handle specific error message for API keys
      if (err.message && err.message.includes("API KEY")) {
        setError("CRITICAL ERROR: API Key missing in Netlify settings. Please add 'API_KEY' to your Environment Variables.");
      } else {
        setError("Failed to load notes. Please check your internet connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNote();
  }, [subjectId, title, part]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 p-10">
      <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-8"></div>
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 animate-pulse">Accessing Archive...</h2>
      <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Retrieving CBSE High-Yield Content</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 p-10 text-center">
      <div className="text-6xl mb-6">⚠️</div>
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">{error}</h2>
      <button 
        onClick={fetchNote}
        className="px-8 py-3 bg-indigo-600 text-white rounded-full font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all"
      >
        Retry Access
      </button>
      <Link to="/" className="mt-6 text-slate-500 font-bold uppercase tracking-widest text-[10px] hover:text-indigo-600 transition-colors">
        Back to Dashboard
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-0 md:p-10">
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="ml-6 md:ml-0 inline-flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest mb-8 hover:gap-3 transition-all no-print"
        >
          ← Back to Chapter List
        </button>
        {note && <NoteRenderer note={note} />}
      </div>
    </div>
  );
};

// Fix: Provided export default to make the file a valid module for index.tsx
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/subject/:subjectId" element={<SubjectView />} />
        <Route path="/chapter/:subjectId/:title/:part/:total" element={<ChapterView />} />
      </Routes>
    </Router>
  );
}