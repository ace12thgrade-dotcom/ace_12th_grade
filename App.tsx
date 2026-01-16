
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { HashRouter, Routes, Route, Link, useParams, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { SUBJECTS, OWNER_EMAIL } from './constants';
import { ChapterNote, SubjectId, UserProfile, PremiumQuestion, AppSettings, Subject } from './types';
import { generateChapterNotes, generatePremiumQuestions, generateSpeech } from './services/geminiService';
import NoteRenderer, { FormattedText, DiagramImage } from './components/NoteRenderer';

// Persistence Keys
const GLOBAL_DB_KEY = 'ace12_global_archive';
const ACTIVE_USER_KEY = 'ace12_current_user'; 

/**
 * DATABASE HELPERS
 */
const getGlobalArchive = (): Record<string, UserProfile> => {
  try {
    const data = localStorage.getItem(GLOBAL_DB_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error("Archive Read Error", e);
    return {};
  }
};

const saveToGlobalArchive = (user: UserProfile) => {
  try {
    const db = getGlobalArchive();
    const emailKey = user.email.toLowerCase().trim();
    db[emailKey] = {
      ...user,
      email: emailKey,
      lastLogin: Date.now()
    };
    localStorage.setItem(GLOBAL_DB_KEY, JSON.stringify(db));
  } catch (e) {
    console.error("Archive Save Error", e);
  }
};

/**
 * SHARED COMPONENTS
 */
const BackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  if (location.pathname === '/') return null;

  return (
    <button 
      onClick={() => navigate(-1)}
      className="fixed top-6 left-6 z-[70] bg-white text-black dark:bg-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-xl hover:bg-slate-50"
    >
      <span className="text-lg">←</span>
      <span>Go Back</span>
    </button>
  );
};

const GlobalFOMO = () => (
  <div className="bg-rose-600 text-white text-[9px] font-black uppercase tracking-[0.3em] py-2.5 text-center sticky top-0 z-[100] shadow-xl">
    ⚡ 2025 BOARD ARCHIVE ACTIVE: SYSTEM SYNCED & SECURED ⚡
  </div>
);

const PriceAlertFOMO = () => (
  <div className="fixed bottom-6 right-6 z-[150] no-print group pointer-events-none sm:pointer-events-auto">
    <div className="bg-rose-600 text-white p-4 rounded-2xl shadow-[0_20px_50px_rgba(225,29,72,0.3)] border border-rose-400 animate-pulse flex items-center gap-3 max-w-[220px] transition-transform hover:scale-105">
      <div className="text-2xl shrink-0">🔥</div>
      <div className="flex flex-col">
        <span className="text-[9px] font-black uppercase tracking-widest leading-none mb-1">Price Hike Alert</span>
        <span className="text-[8px] font-bold text-rose-100 uppercase leading-tight">
          Solved Vault prices may increase to <span className="text-white font-black">₹199</span> anytime. Lock in <span className="text-yellow-400">₹19</span> now!
        </span>
      </div>
    </div>
  </div>
);

/**
 * HOME HERO SECTION
 */
const Hero = () => (
  <div className="text-center py-12 px-6 space-y-6 animate-in fade-in slide-in-from-top-10 duration-1000">
    <div className="inline-block bg-[#49f2b3]/20 text-[#49f2b3] px-5 py-1.5 rounded-full font-black text-[9px] uppercase tracking-[0.3em] border border-[#49f2b3]/30">
      2025 Board Mastery Series
    </div>
    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-tight max-w-4xl mx-auto">
      Class 12 <br/>
      <span className="text-indigo-500">Boards Simplified.</span>
    </h1>
    <p className="text-slate-400 text-base md:text-lg font-medium max-w-2xl mx-auto">
      Ultra-clear Hinglish notes, high-yield diagrams. Now 100% Free for all students.
    </p>
    <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
      <Link to="/" className="bg-white text-black px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
        Start Learning Free
      </Link>
      <Link to="/premium" className="bg-rose-600 text-white px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
        Unlock Solved PYQs
      </Link>
    </div>
  </div>
);

const HomeSubjectCard: React.FC<{ subject: Subject, isPremiumUnlocked: boolean }> = ({ subject, isPremiumUnlocked }) => (
  <Link to={`/subject/${subject.id}`} className="bg-[#141829] p-8 rounded-[2rem] border border-indigo-500/10 hover:border-indigo-500/40 transition-all group flex flex-col items-center text-center space-y-4 relative overflow-hidden">
    {isPremiumUnlocked && <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest z-10 shadow-lg animate-pulse">Vault Unlocked 💎</div>}
    <div className="text-5xl group-hover:scale-110 transition-transform drop-shadow-2xl">{subject.icon}</div>
    <div className="space-y-1">
      <h3 className="text-xl font-black text-white uppercase tracking-tight">{subject.name}</h3>
      <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Full Course • {subject.chapters.length} Chapters</p>
    </div>
    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-2">
      <div className="h-full bg-indigo-500 w-full transition-all duration-1000"></div>
    </div>
  </Link>
);

const Home = ({ user }: { user: UserProfile | null }) => {
  return (
    <div className="min-h-screen bg-[#0a0c14] pb-20 font-sans relative overflow-x-hidden">
      <GlobalFOMO />
      <div className="flex justify-center gap-4 py-8 opacity-40 text-[8px] font-black uppercase tracking-[0.3em] text-white flex-wrap px-4 text-center">
        {SUBJECTS.map(s => <span key={s.id}>{s.id.replace('_',' ')}</span>)}
      </div>
      
      <Hero />
      
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {SUBJECTS.map(s => (
          <HomeSubjectCard 
            key={s.id} 
            subject={s} 
            isPremiumUnlocked={!!user?.purchasedSubjects.includes(s.id)} 
          />
        ))}
      </div>
    </div>
  );
};

const PremiumPortal = ({ user, onUpdateUser, openLogin }: { user: UserProfile | null, onUpdateUser: (u: UserProfile) => void, openLogin: () => void }) => {
  const [cart, setCart] = useState<SubjectId[]>([]);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', city: '', pincode: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const checkoutRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const toggleCart = (id: SubjectId) => {
    setCart(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const unlockAllAndCheckout = () => {
    setCart(SUBJECTS.map(s => s.id));
    setTimeout(() => {
        checkoutRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const totals = useMemo(() => {
    const marketValue = SUBJECTS.length * 99;
    const baseTotal = cart.length * 19;
    const isBundle = cart.length === SUBJECTS.length;
    const finalTotal = isBundle ? 91 : baseTotal;
    const savings = marketValue - finalTotal;
    
    return { marketValue, finalTotal, savings, isBundle };
  }, [cart]);

  const handleCheckout = () => {
    const emailKey = form.email.toLowerCase().trim();
    if (cart.length === 0) {
      alert("Please select at least one subject vault to unlock.");
      return;
    }
    if (!emailKey.includes('@')) {
      alert("A valid email is required to secure your archival access.");
      return;
    }
    
    setIsProcessing(true);
    setTimeout(() => {
      const db = getGlobalArchive();
      const existing = db[emailKey];
      
      const updated: UserProfile = {
        email: emailKey,
        phone: '', 
        purchasedSubjects: Array.from(new Set([...(existing?.purchasedSubjects || []), ...cart])),
        lastLogin: Date.now()
      };
      
      saveToGlobalArchive(updated);
      localStorage.setItem(ACTIVE_USER_KEY, emailKey);
      onUpdateUser(updated);
      setIsProcessing(false);
      alert("Payment Successful! Your lifetime archive is now synced.");
      navigate(`/premium-vault/${cart[0]}`); 
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0c14] text-white font-sans pb-24 relative overflow-x-hidden">
      <GlobalFOMO />
      <BackButton />

      <div className="max-w-4xl mx-auto pt-16 pb-12 px-6">
        <div className="bg-gradient-to-br from-[#1e234a] to-[#0a0c14] rounded-[2.5rem] p-8 md:p-12 text-center border border-indigo-500/20 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full"></div>
          <div className="bg-emerald-500 text-white px-5 py-1.5 rounded-full inline-block text-[9px] font-black uppercase tracking-widest relative z-10 animate-bounce">
             LIFETIME DEVICE-LINKED ACCESS
          </div>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-none relative z-10">
            Unlock All <br/> Vaults <br/>
            <span className="text-[#49f2b3]">@ ₹91 ONLY</span>
          </h2>
          <div className="flex justify-center items-center gap-8 pt-2 relative z-10">
            <div className="text-center">
              <p className="text-slate-500 text-[8px] font-black uppercase tracking-widest mb-1">Market Value</p>
              <p className="text-2xl font-black text-rose-500 line-through">₹594</p>
            </div>
            <div className="bg-indigo-500/20 px-6 py-2 rounded-full border border-indigo-500/30 text-[9px] font-black uppercase tracking-widest">
              Save ₹503 Today
            </div>
          </div>
          <button onClick={unlockAllAndCheckout} className="bg-white text-black px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-2xl relative z-10">
            Get Everything Now
          </button>
          
          <div className="relative z-10 pt-4">
             <button onClick={openLogin} className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors">
                Already Purchased? <span className="underline">Login / Re-Sync Access</span>
             </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-800 pb-6 gap-6">
           <div className="space-y-1">
             <h3 className="text-3xl font-black uppercase tracking-tighter">Subject Vaults</h3>
             <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Board-Solved Decadal Archive (2015-2025)</p>
           </div>
           <div className="flex flex-wrap gap-3">
              <div className="bg-indigo-600 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest">Permanent Access</div>
              <div className="bg-rose-600 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest">Selling Fast 🔥</div>
           </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SUBJECTS.map(s => {
            const inCart = cart.includes(s.id);
            const isOwned = user?.purchasedSubjects.includes(s.id);
            return (
              <div key={s.id} className="bg-[#141829] p-6 rounded-[1.5rem] border border-indigo-500/10 flex flex-col space-y-4 relative group hover:border-indigo-500/30 transition-all">
                <div className="flex justify-between items-start">
                  <span className="text-4xl group-hover:scale-110 transition-transform">{s.icon}</span>
                  <div className="text-right">
                    <p className="text-slate-500 text-[7px] font-black uppercase">MRP ₹99</p>
                    <p className="text-2xl font-black text-white">₹19</p>
                    <span className="bg-rose-500 text-white px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-tighter">Sale</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-black uppercase tracking-tight">{s.name}</h4>
                  <p className="text-[9px] text-slate-500 leading-relaxed font-bold uppercase tracking-wide">Detailed Solutions & Analysis.</p>
                </div>
                <button 
                  onClick={() => isOwned ? navigate(`/premium-vault/${s.id}`) : toggleCart(s.id)}
                  className={`w-full py-3.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${isOwned ? 'bg-emerald-500 text-white shadow-xl' : inCart ? 'bg-rose-600 text-white shadow-xl' : 'bg-amber-400 text-black hover:scale-105 shadow-lg shadow-amber-400/20'}`}
                >
                  {isOwned ? 'Open Vault 💎' : inCart ? 'Remove from Cart' : `Unlock @ ₹19`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div ref={checkoutRef} className="pt-20">
          {cart.length > 0 ? (
            <div className="max-w-4xl mx-auto px-6 animate-in slide-in-from-bottom-20 duration-500">
              <div className="bg-[#141829] rounded-[2rem] p-8 md:p-12 border border-indigo-500/20 space-y-8 shadow-2xl relative">
                 <div className="absolute top-6 right-8 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Permanent ID Linked Access</span>
                 </div>
                 
                 <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-indigo-400">
                       <span>Selected: {cart.length} Subject Vaults</span>
                       <span className="bg-indigo-600 px-3 py-1 rounded-full text-white">MAX DISCOUNT</span>
                    </div>
                    <div className="w-full h-2 bg-black rounded-full overflow-hidden">
                       <div className="h-full bg-indigo-600 transition-all duration-700 shadow-[0_0_15px_rgba(79,70,229,0.5)]" style={{ width: `${(cart.length / SUBJECTS.length) * 100}%` }}></div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Student Full Name</label>
                       <input type="text" placeholder="YOUR FULL NAME" className="w-full bg-black/40 border border-slate-800 p-5 rounded-xl font-bold text-white outline-none focus:border-indigo-500 uppercase text-xs" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Access Email (For Re-Login)</label>
                       <input type="email" placeholder="student@example.com" className="w-full bg-black/40 border border-slate-800 p-5 rounded-xl font-bold text-white outline-none focus:border-indigo-500 uppercase text-xs" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                    </div>
                 </div>

                 <div className="pt-6 border-t border-slate-800 space-y-4">
                    <div className="flex justify-between items-end pt-2">
                       <h3 className="text-2xl font-black uppercase tracking-tighter">Final Amount</h3>
                       <div className="text-5xl font-black text-amber-400 tracking-tighter flex items-baseline gap-1">
                         <span className="text-2xl">₹</span>{totals.finalTotal}
                       </div>
                    </div>
                 </div>

                 <button 
                    disabled={isProcessing}
                    onClick={handleCheckout}
                    className="w-full bg-amber-400 text-black py-6 rounded-2xl font-black text-xl uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.01] transition-all"
                 >
                    {isProcessing ? 'SECURE SYNCING...' : 'CHECKOUT & UNLOCK'}
                 </button>
                 <div className="text-[8px] font-black uppercase text-center text-rose-500 tracking-[0.2em] space-y-1 opacity-90">
                    <p>⚡ ACCESS STAYS FOREVER • RE-LOGIN ANYTIME</p>
                 </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto py-16 bg-[#141829] rounded-[2rem] border-2 border-dashed border-slate-800 flex flex-col items-center space-y-6 opacity-60">
               <div className="text-6xl grayscale opacity-20">🛒</div>
               <h3 className="text-xl font-black uppercase text-slate-600 tracking-widest">Cart is Empty</h3>
               <button onClick={unlockAllAndCheckout} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest hover:scale-105 transition-all">Unlock All Subjects Now</button>
            </div>
          )}
      </div>
    </div>
  );
};

const SubjectPage = ({ user }: { user: UserProfile | null }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const subject = SUBJECTS.find(s => s.id === id);
  const isPremiumUnlocked = user?.purchasedSubjects.includes(id as SubjectId);

  if (!subject) return <div className="p-20 text-center text-4xl font-black text-white">SUBJECT NOT FOUND</div>;

  return (
    <div className="p-6 md:p-16 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 relative min-h-screen overflow-x-hidden">
      <BackButton />
      
      <div className="flex flex-col md:flex-row items-center gap-8 pt-10">
        <div className="text-7xl bg-white dark:bg-slate-900 w-24 h-24 md:w-32 md:h-32 rounded-[2rem] flex items-center justify-center shadow-xl border-2 border-indigo-600/10 transition-transform group hover:rotate-6">
           <span className="group-hover:scale-110 transition-transform">{subject.icon}</span>
        </div>
        <div className="text-center md:text-left">
           <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-black dark:text-white tracking-tighter uppercase leading-none">{subject.name}</h1>
           <p className="text-lg md:text-xl font-bold text-slate-500 mt-2 uppercase tracking-[0.2em]">{subject.chapters.length} FREE CHAPTERS AVAILABLE</p>
        </div>
      </div>

      <div className="bg-indigo-600 p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8 border-2 border-indigo-400/30 group">
        <div className="space-y-3 text-center lg:text-left">
          <div className="inline-block bg-white/20 px-4 py-1.5 rounded-full text-[9px] font-black text-white uppercase tracking-widest">SOLVED BOARD ARCHIVE (2015-2025)</div>
          <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">Premium Solved Vault</h2>
          <p className="text-base md:text-lg font-bold text-indigo-100">Unlock decadal repetitions and model answers. Essential for Toppers.</p>
        </div>
        {isPremiumUnlocked ? (
          <button 
            onClick={() => navigate(`/premium-vault/${subject.id}`)}
            className="bg-white text-indigo-600 px-10 py-5 rounded-2xl font-black uppercase tracking-[0.15em] text-xs hover:scale-105 transition-all shadow-2xl border-b-4 border-indigo-200 whitespace-nowrap"
          >
            Open Vault 💎
          </button>
        ) : (
          <Link to="/premium" className="bg-[#49f2b3] text-black px-10 py-5 rounded-2xl font-black uppercase tracking-[0.15em] text-xs hover:scale-105 transition-all shadow-2xl border-b-4 border-emerald-700 whitespace-nowrap">
            Unlock Vault @ ₹19
          </Link>
        )}
      </div>

      <div className="grid gap-6">
        {subject.chapters.map(chapter => (
          <div key={chapter.id} className="group bg-white dark:bg-[#141829] p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 dark:border-slate-800 hover:border-indigo-600 transition-all shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="space-y-2 text-center md:text-left">
                <h3 className="text-xl md:text-2xl font-black text-black dark:text-white uppercase tracking-tight">{chapter.title}</h3>
                <p className="text-sm font-bold text-slate-500 max-w-lg">{chapter.description}</p>
             </div>
             
             <div className="flex gap-3 flex-wrap justify-center">
              {Array.from({ length: chapter.totalParts }).map((_, i) => (
                <button 
                  key={i}
                  onClick={() => navigate(`/chapter/${subject.id}/${encodeURIComponent(chapter.title)}/${i+1}/${chapter.totalParts}`)}
                  className="px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all bg-indigo-600 text-white hover:scale-110 active:scale-95 shadow-lg border-b-2 border-indigo-800 flex items-center gap-2"
                >
                  <span>Part {i+1}</span>
                  <span className="opacity-40">→</span>
                </button>
              ))}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ChapterView = () => {
  const { subjectId, title, part, total } = useParams<{ subjectId: string, title: string, part: string, total: string }>();
  const [note, setNote] = useState<ChapterNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setError("Failed to load notes. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNote();
  }, [subjectId, title, part, total]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10 bg-[#0a0c14]">
       <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
       <h2 className="text-2xl font-black uppercase mt-8 tracking-tighter text-white animate-pulse">Synthesizing Notes...</h2>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10 bg-[#0a0c14] text-center">
       <div className="text-6xl mb-6">⚠️</div>
       <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-4">{error}</h2>
       <button 
         onClick={fetchNote}
         className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
       >
         Try Again
       </button>
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <BackButton />
      {note ? <NoteRenderer note={note} /> : null}
    </div>
  );
};

const PremiumVaultView = ({ user, onUpdateUser }: { user: UserProfile | null, onUpdateUser: (u: UserProfile) => void }) => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<PremiumQuestion[]>([]);
  const [viewState, setViewState] = useState<'checking' | 'unauthorized' | 'granted' | 'loading' | 'content'>('checking');
  const [verifyEmail, setVerifyEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const subject = SUBJECTS.find(s => s.id === subjectId);

  useEffect(() => {
    const activeEmail = localStorage.getItem(ACTIVE_USER_KEY);
    const db = getGlobalArchive();
    const storedUser = activeEmail ? db[activeEmail.toLowerCase().trim()] : null;
    
    const hasAccess = (user?.purchasedSubjects || []).includes(subjectId as SubjectId) || 
                      (storedUser?.purchasedSubjects || []).includes(subjectId as SubjectId);

    if (!hasAccess) {
       setViewState('unauthorized');
       return;
    }

    setViewState('granted');
  }, [subjectId, user]);

  const handleVerifyAccess = () => {
    const emailKey = verifyEmail.toLowerCase().trim();
    if (!emailKey.includes('@')) {
        alert("Please enter a valid registered email.");
        return;
    }
    setIsVerifying(true);
    setTimeout(() => {
        const db = getGlobalArchive();
        const found = db[emailKey];
        if (found && (found.purchasedSubjects || []).includes(subjectId as SubjectId)) {
            localStorage.setItem(ACTIVE_USER_KEY, emailKey);
            onUpdateUser(found);
            setViewState('granted');
            alert("Login Successful! Vault Unlocked.");
        } else if (found) {
            alert(`Subject not found. This email has access to other subjects, but not ${subject?.name}.`);
        } else {
            alert("No purchase found for this email. If you just paid, please check the email spelling.");
        }
        setIsVerifying(false);
    }, 1500);
  };

  const handleRevealVault = async () => {
    try {
      setViewState('loading');
      const data = await generatePremiumQuestions(subjectId as SubjectId);
      setQuestions(data);
      setViewState('content');
    } catch (err) {
      alert("Failed to load archive questions. Please try again.");
      setViewState('granted');
    }
  };

  if (viewState === 'checking') return (
     <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0c14] text-white p-10">
        <h2 className="text-4xl font-black uppercase animate-pulse tracking-tighter">Checking Archive Access...</h2>
     </div>
  );

  if (viewState === 'unauthorized') return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0c14] text-white p-6 md:p-10 text-center space-y-10 overflow-x-hidden">
        <BackButton />
        <div className="bg-[#141829] border border-indigo-500/20 p-8 md:p-16 rounded-[2.5rem] max-w-xl w-full shadow-2xl space-y-8 animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-rose-600/20 rounded-full flex items-center justify-center mx-auto border border-rose-600/30">
                <span className="text-4xl">🔒</span>
            </div>
            <div className="space-y-3">
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Vault Locked</h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Re-Login to Verify purchase for {subject?.name}</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2 text-left">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Registered Email Address</label>
                    <input 
                        type="email" 
                        placeholder="ENTER YOUR EMAIL" 
                        className="w-full bg-black/40 border border-slate-800 p-5 rounded-2xl font-black text-white outline-none focus:border-indigo-500 uppercase text-xs tracking-widest"
                        value={verifyEmail}
                        onChange={e => setVerifyEmail(e.target.value)}
                    />
                </div>
                <button 
                    onClick={handleVerifyAccess}
                    disabled={isVerifying}
                    className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all border-b-4 border-indigo-800"
                >
                    {isVerifying ? 'SEARCHING ARCHIVE...' : 'LOGIN & UNLOCK VAULT'}
                </button>
            </div>

            <div className="pt-6 border-t border-slate-800/50 flex flex-col gap-4">
                <p className="text-slate-600 text-[8px] font-black uppercase tracking-[0.2em]">Don't have access yet?</p>
                <Link to="/premium" className="bg-[#49f2b3] text-black px-6 py-4 rounded-xl font-black text-[9px] uppercase tracking-widest hover:scale-105 transition-all">
                    Unlock Solved Archive @ ₹19
                </Link>
            </div>
        </div>
    </div>
  );

  if (viewState === 'granted') return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0c14] text-white p-10 text-center space-y-8 overflow-x-hidden">
      <BackButton />
      <div className="space-y-4 animate-in fade-in zoom-in duration-1000">
         <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(16,185,129,0.3)] border-2 border-emerald-300 mb-6">
            <span className="text-4xl">💎</span>
         </div>
         <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-tight">
           Vault Sync <br/> <span className="text-emerald-500">Active ✅</span>
         </h1>
         <p className="text-base font-bold text-slate-400 uppercase tracking-widest max-w-sm mx-auto">
           Welcome back! Your lifetime access to {subject?.name} is verified.
         </p>
      </div>
      
      <button 
        onClick={handleRevealVault}
        className="bg-white text-black px-12 py-6 rounded-[1.5rem] font-black text-xl uppercase tracking-[0.15em] shadow-2xl hover:scale-105 active:scale-95 transition-all border-b-4 border-slate-300"
      >
        Reveal Solved Archive
      </button>

      <div className="text-[9px] font-black uppercase text-slate-600 tracking-[0.3em]">
        LIFETIME CLOUD-LINKED ARCHIVE • 2025 SERIES
      </div>
    </div>
  );

  if (viewState === 'loading') return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0c14] text-white p-10">
       <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
       <h2 className="text-4xl font-black uppercase mt-8 tracking-tighter animate-pulse">Decrypting Archive...</h2>
    </div>
  );

  return (
    <div className="p-6 md:p-16 max-w-7xl mx-auto space-y-12 bg-white dark:bg-[#0a0c14] min-h-screen relative overflow-x-hidden">
       <BackButton />
       
       <header className="space-y-4 pt-12">
          <div className="flex flex-wrap gap-2">
             <div className="bg-rose-600 text-white px-6 py-2 rounded-full font-black text-[9px] uppercase tracking-widest shadow-lg">LIFETIME ACCESS SECURED 💎</div>
             <div className="bg-indigo-600 text-white px-6 py-2 rounded-full font-black text-[9px] uppercase tracking-widest shadow-lg">NCERT VERIFIED 2024-25</div>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-8xl font-black text-black dark:text-white uppercase tracking-tighter leading-tight">
            {subject?.name} <br/> <span className="text-indigo-600 italic">Solved Archive.</span>
          </h1>
       </header>

       <div className="grid gap-12 pb-24">
          {questions.map((q, idx) => (
             <div key={idx} className="bg-slate-50 dark:bg-[#141829] p-8 md:p-12 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl group transition-all">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex gap-2 flex-wrap items-center">
                    <span className={`text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md ${q.marks >= 5 ? 'bg-amber-600' : q.marks >= 3 ? 'bg-indigo-700' : 'bg-slate-600'}`}>
                      {q.qType} • {q.marks}M
                    </span>
                    {q.repeatedYears.map(year => (
                       <span key={year} className="bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-[8px] font-black px-3 py-1 rounded-full uppercase border border-indigo-600/30">BOARD {year}</span>
                    ))}
                  </div>
                  <span className="text-indigo-600 font-black text-6xl italic opacity-10 group-hover:opacity-20 select-none">#{idx+1}</span>
                </div>
                <div className="space-y-8">
                  <h3 className="text-xl md:text-3xl font-black text-black dark:text-white leading-tight">
                    <FormattedText text={q.question} />
                  </h3>
                  
                  {q.visualPrompt && (
                    <div className="my-6">
                      <DiagramImage prompt={q.visualPrompt} />
                      <p className="text-[10px] font-black uppercase text-indigo-600 mt-3 tracking-widest">Fig: Technical Visual Aid</p>
                    </div>
                  )}

                  <div className="bg-white dark:bg-black p-8 md:p-12 rounded-[2rem] border-2 border-indigo-600 shadow-xl relative mt-8">
                    <div className="absolute top-0 right-8 -translate-y-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">Official Step Marking</div>
                    <FormattedText text={q.solution} className="text-lg md:text-2xl font-bold text-black dark:text-white" />
                  </div>
                </div>
             </div>
          ))}
       </div>
    </div>
  );
};

const RestoreModal = ({ onRestore, onClose }: { onRestore: (u: UserProfile) => void, onClose: () => void }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSync = () => {
    const emailKey = email.toLowerCase().trim();
    if (!emailKey.includes('@')) return alert("Invalid email format.");
    setLoading(true);
    setTimeout(() => {
      const db = getGlobalArchive();
      const user = db[emailKey];
      if (user) {
        onRestore(user);
        onClose();
        alert("Welcome Back! Login Successful for: " + user.email);
      } else {
        alert("No purchase found for this email in our system archive.");
      }
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
      <div className="bg-[#141829] border border-indigo-500/20 w-full max-w-sm p-10 rounded-[2rem] text-center space-y-6 animate-in zoom-in duration-300">
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Re-Login</h2>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">Enter your registered email to restore your permanent access.</p>
        <input 
          type="email" 
          placeholder="REGISTERED EMAIL" 
          className="w-full bg-black/40 border border-slate-700 p-4 rounded-xl font-black text-white outline-none focus:border-indigo-500 uppercase tracking-widest text-[10px]" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          onKeyDown={(e) => e.key === 'Enter' && handleSync()}
        />
        <button disabled={loading} onClick={handleSync} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-2xl border-b-4 border-indigo-800">
          {loading ? 'SEARCHING ARCHIVE...' : 'CONFIRM LOGIN'}
        </button>
        <button onClick={onClose} className="text-slate-500 text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors">Go Back</button>
      </div>
    </div>
  );
};

const Sidebar = ({ isDark, setIsDark, user, onRestore, onLogout }: { isDark: boolean, setIsDark: (v: boolean) => void, user: UserProfile | null, onRestore: () => void, onLogout: () => void }) => (
  <aside className="no-print w-72 bg-white dark:bg-[#0a0c14] border-r-2 border-slate-100 dark:border-slate-900 h-screen sticky top-0 hidden lg:flex flex-col shadow-2xl z-50 transition-colors">
    <div className="p-8 mb-4 flex flex-col items-center">
      <Link to="/" className="flex items-center space-x-3 mb-8 group transition-transform hover:scale-105">
        <div className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black rounded-xl flex items-center justify-center font-black text-xl shadow-2xl group-hover:rotate-6 transition-all">A12</div>
        <span className="text-lg font-black tracking-tighter leading-none text-black dark:text-white">Ace12thGRADE<br/><span className="text-indigo-600 uppercase text-xs">Grade AI Master</span></span>
      </Link>
      
      {user ? (
        <div className="w-full bg-slate-50 dark:bg-[#141829] p-6 rounded-[1.5rem] border border-indigo-600/10 mb-6 text-center shadow-lg">
           <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl font-black mx-auto mb-3 uppercase shadow-xl">{user.email[0]}</div>
           <div className="text-[9px] font-black truncate px-2 uppercase tracking-widest text-indigo-600 mb-1">{user.email}</div>
           <p className="text-[7px] font-black text-emerald-500 uppercase tracking-widest mb-3">Login Active ✅</p>
           <button onClick={onLogout} className="text-rose-500 font-black text-[8px] uppercase tracking-widest hover:underline">LOGOUT SESSION</button>
        </div>
      ) : (
        <button 
          onClick={onRestore}
          className="w-full mb-6 py-4 bg-[#49f2b3] text-black rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 border-b-4 border-emerald-700"
        >
          <span>🔄</span>
          <span>RE-LOGIN / SYNC</span>
        </button>
      )}

      <button onClick={() => setIsDark(!isDark)} className="w-full py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[9px] font-black uppercase tracking-widest text-black dark:text-white hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
        {isDark ? '☀️ DAY MODE' : '🌙 NIGHT MODE'}
      </button>
    </div>
    
    <nav className="flex-1 overflow-y-auto px-6 space-y-3 no-scrollbar pb-10">
      <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 mb-3">Master Curriculum</div>
      {SUBJECTS.map(s => (
        <Link key={s.id} to={`/subject/${s.id}`} className="flex items-center space-x-3 p-4 rounded-xl hover:bg-slate-100 dark:hover:bg-[#141829] font-black transition-all group text-black dark:text-white">
          <span className="text-2xl group-hover:rotate-12 transition-transform drop-shadow-md">{s.icon}</span>
          <span className="text-[9px] uppercase tracking-widest leading-none">{s.name}</span>
        </Link>
      ))}
      <div className="pt-8 border-t border-slate-100 dark:border-slate-900 mt-6">
         <Link to="/premium" className="flex items-center justify-between p-5 rounded-2xl bg-rose-600 text-white font-black border-2 border-rose-700 shadow-xl hover:scale-105 transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 p-3 opacity-10 text-4xl group-hover:scale-125 transition-transform">💎</div>
            <div className="flex items-center space-x-3 relative z-10">
              <span className="text-xl">💎</span>
              <span className="text-[9px] uppercase tracking-widest leading-none">SOLVED PYQs</span>
            </div>
         </Link>
      </div>
    </nav>
  </aside>
);

const App = () => {
  const [isDark, setIsDark] = useState(true); 
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [showRestore, setShowRestore] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const activeEmail = localStorage.getItem(ACTIVE_USER_KEY);
        if (activeEmail) {
          const db = getGlobalArchive();
          const storedUser = db[activeEmail.toLowerCase().trim()];
          if (storedUser) {
            setCurrentUser(storedUser);
          } else {
            localStorage.removeItem(ACTIVE_USER_KEY);
          }
        }
      } catch (err) {
        console.error("Initialization Error:", err);
      } finally {
        setLoading(false);
      }
    };
    initializeApp();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(ACTIVE_USER_KEY);
    setCurrentUser(null);
  };

  const handleRestoreSync = (user: UserProfile) => {
    const emailKey = user.email.toLowerCase().trim();
    setCurrentUser(user);
    localStorage.setItem(ACTIVE_USER_KEY, emailKey);
  };

  // Prevent "black screen" by showing a skeleton or subtle background during load
  if (loading) return (
    <div className="min-h-screen bg-[#0a0c14] flex items-center justify-center">
       <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-[#0a0c14] dark:bg-[#0a0c14] flex font-sans transition-colors duration-500 overflow-x-hidden relative">
        <HashRouter>
          <Sidebar 
            isDark={isDark} 
            setIsDark={setIsDark} 
            user={currentUser} 
            onRestore={() => setShowRestore(true)}
            onLogout={handleLogout} 
          />
          <main className="flex-1 h-screen overflow-y-auto no-scrollbar relative bg-[#0a0c14]">
            <Routes>
              <Route path="/" element={<Home user={currentUser} />} />
              <Route path="/subject/:id" element={<SubjectPage user={currentUser} />} />
              <Route path="/chapter/:subjectId/:title/:part/:total" element={<ChapterView />} />
              <Route path="/premium" element={<PremiumPortal user={currentUser} onUpdateUser={handleRestoreSync} openLogin={() => setShowRestore(true)} />} />
              <Route path="/premium-vault/:subjectId" element={<PremiumVaultView user={currentUser} onUpdateUser={handleRestoreSync} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            <PriceAlertFOMO />
          </main>
          {showRestore && <RestoreModal onClose={() => setShowRestore(false)} onRestore={handleRestoreSync} />}
        </HashRouter>
      </div>
    </div>
  );
};

export default App;
