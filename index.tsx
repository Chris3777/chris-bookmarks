
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Plus, 
  Trash2, 
  ExternalLink, 
  Search, 
  Grid, 
  LayoutList, 
  Sparkles,
  Link as LinkIcon,
  Music,
  Code,
  Video,
  Image as ImageIcon,
  Cpu,
  Globe,
  RefreshCcw,
  Undo2,
  Redo2,
  Newspaper,
  ChevronRight,
  TrendingUp,
  Mail,
  Share2,
  Upload,
  FileCode,
  Check,
  Edit2,
  ImagePlus,
  X,
  Save,
  Wand2,
  MoreVertical,
  FolderSync,
  Download,
  Menu,
  BrainCircuit,
  XCircle,
  Play,
  Square,
  Globe2,
  BookOpen,
  ListFilter,
  ArrowDownAZ,
  ArrowUpAZ,
  Calendar,
  Layers,
  Clock,
  Layout,
  BarChart3,
  Zap,
  MessageSquare,
  Send,
  Bot,
  Lightbulb,
  Settings,
  ShieldCheck,
  Server,
  LogOut,
  User,
  Palette,
  Languages,
  UserCircle2,
  Ghost,
  FileText
} from 'lucide-react';
import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";

// --- Configuration & Constants ---

const LANGUAGES = {
  en: { label: 'English', flag: '🇺🇸' },
  es: { label: 'Español', flag: '🇪🇸' },
  fr: { label: 'Français', flag: '🇫🇷' },
};

const THEMES = {
  default: { 
    id: 'default', 
    label: 'Cyberpunk', 
    accent: '#10b981', 
    accentDim: 'rgba(16, 185, 129, 0.15)', 
    bg: '#050505', 
    text: '#ffffff',
    font: 'font-sans'
  },
  reggae: { 
    id: 'reggae', 
    label: 'Reggae Roots', 
    accent: '#22c55e', // Green
    accentDim: 'rgba(239, 68, 68, 0.2)', // Red hint in background
    bg: '#1a0500', // Dark brown
    text: '#fbbf24', // Gold text
    font: 'font-mono'
  },
  rap: { 
    id: 'rap', 
    label: 'Hip Hop Gold', 
    accent: '#fbbf24', // Gold
    accentDim: 'rgba(251, 191, 36, 0.15)', 
    bg: '#000000', // Deep Black
    text: '#e5e5e5',
    font: 'font-sans'
  },
  classic: { 
    id: 'classic', 
    label: 'Classical', 
    accent: '#38bdf8', // Light Blue
    accentDim: 'rgba(56, 189, 248, 0.1)', 
    bg: '#0f172a', // Navy
    text: '#f1f5f9',
    font: 'font-serif'
  },
  pop: { 
    id: 'pop', 
    label: 'Pop Art', 
    accent: '#d946ef', // Fuchsia
    accentDim: 'rgba(217, 70, 239, 0.15)', 
    bg: '#2e022d', // Dark Purple
    text: '#ffffff',
    font: 'font-sans'
  },
};

const TRANSLATIONS = {
  en: {
    searchPlaceholder: "Search knowledge base...",
    importData: "Import Data",
    backup: "Backup",
    autoGenerate: "Auto-Generate Assets",
    addResource: "Add Resource",
    collections: "Collections",
    newCollection: "New Collection",
    strategicAssessment: "Strategic Assessment",
    knowledgeBaseEmpty: "Knowledge Base Empty",
    startTracking: "Import bookmarks or paste a URL to begin tracking.",
    login: "Login",
    logout: "Logout",
    settings: "Settings",
    theme: "Theme",
    language: "Language",
    profile: "Profile",
    signInWithGoogle: "Sign in with Google",
    signInWithEmail: "Sign in with Email",
    continueGuest: "Continue as Guest",
    guestModeDesc: "No data will be saved to the cloud. Session only.",
    welcomeBack: "Welcome back",
    smartDiscovery: "Smart Discovery",
    autoSort: "AUTO-SORT",
    discover: "DISCOVER"
  },
  es: {
    searchPlaceholder: "Buscar en la base de conocimientos...",
    importData: "Importar Datos",
    backup: "Copia de Seguridad",
    autoGenerate: "Generar Activos",
    addResource: "Añadir Recurso",
    collections: "Colecciones",
    newCollection: "Nueva Colección",
    strategicAssessment: "Evaluación Estratégica",
    knowledgeBaseEmpty: "Base de Conocimientos Vacía",
    startTracking: "Importa marcadores o pega una URL para comenzar.",
    login: "Iniciar Sesión",
    logout: "Cerrar Sesión",
    settings: "Configuración",
    theme: "Tema",
    language: "Idioma",
    profile: "Perfil",
    signInWithGoogle: "Acceder con Google",
    signInWithEmail: "Acceder con Email",
    continueGuest: "Continuar como Invitado",
    guestModeDesc: "No se guardarán datos. Solo sesión actual.",
    welcomeBack: "Bienvenido de nuevo",
    smartDiscovery: "Descubrimiento Inteligente",
    autoSort: "AUTO-ORDENAR",
    discover: "DESCUBRIR"
  },
  fr: {
    searchPlaceholder: "Rechercher dans la base...",
    importData: "Importer Données",
    backup: "Sauvegarde",
    autoGenerate: "Générer des Actifs",
    addResource: "Ajouter Ressource",
    collections: "Collections",
    newCollection: "Nouvelle Collection",
    strategicAssessment: "Évaluation Stratégique",
    knowledgeBaseEmpty: "Base de Connaissances Vide",
    startTracking: "Importez des favoris ou collez une URL pour commencer.",
    login: "Connexion",
    logout: "Déconnexion",
    settings: "Paramètres",
    theme: "Thème",
    language: "Langue",
    profile: "Profil",
    signInWithGoogle: "Se connecter avec Google",
    signInWithEmail: "Se connecter avec Email",
    continueGuest: "Continuer en Invité",
    guestModeDesc: "Aucune sauvegarde cloud. Session uniquement.",
    welcomeBack: "Bon retour",
    smartDiscovery: "Découverte Intelligente",
    autoSort: "AUTO-TRI",
    discover: "DÉCOUVRIR"
  }
};

// --- Types ---
interface LinkItem {
  id: string;
  url: string;
  title: string;
  description: string;
  theme: string;
  iconEmoji: string;
  favicon: string;
  previewImageUrl?: string;
  timestamp: number;
  aiSummary?: string;
}

interface GeminiResponse {
  title: string;
  theme: string;
  description: string;
  iconEmoji: string;
}

interface SuggestionItem {
  title: string;
  url: string;
  description: string;
  theme: string;
  reason: string;
}

interface SuggestionResponse {
  suggestions: SuggestionItem[];
}

interface RelatedLink {
  title: string;
  url: string;
}

interface SortConfig {
  key: 'date' | 'title' | 'theme';
  direction: 'asc' | 'desc' | 'creation';
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
}

type ViewMode = 'grid' | 'detailed';
type ThemeKey = keyof typeof THEMES;
type LangKey = keyof typeof LANGUAGES;

// --- Components ---

const ThemeIcon = ({ theme, size = 18, className = "" }: { theme: string; size?: number; className?: string }) => {
  const t = theme.toLowerCase();
  if (t.includes('music')) return <Music size={size} className={`${className} text-pink-400`} />;
  if (t.includes('code') || t.includes('dev')) return <Code size={size} className={`${className} text-blue-400`} />;
  if (t.includes('video')) return <Video size={size} className={`${className} text-purple-400`} />;
  if (t.includes('image') || t.includes('art')) return <ImageIcon size={size} className={`${className} text-orange-400`} />;
  if (t.includes('ai') || t.includes('intelligence')) return <Cpu size={size} className={`${className} text-[var(--theme-accent)]`} />;
  return <Globe size={size} className={`${className} text-neutral-400`} />;
};

const AuthLanding = ({ onLogin, onGuest }: { onLogin: (user: UserProfile) => void, onGuest: () => void }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    onLogin({
      name: 'Chris User',
      email: 'chris@example.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'
    });
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    onLogin({
      name: email.split('@')[0],
      email: email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
    });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?q=80&w=2832&auto=format&fit=crop')] opacity-20 pointer-events-none bg-cover bg-center"></div>
      
      <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-8 relative animate-in zoom-in-95 duration-500">
        
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-500 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <BookOpen size={32} />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">CHRIS BOOKMARKS</h1>
            <p className="text-neutral-500 text-sm mt-2 font-medium">Secure Knowledge Base & Intelligence Suite</p>
        </div>

        <div className="space-y-4">
            <button 
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-white text-black py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors shadow-lg"
            >
                {loading ? <RefreshCcw size={18} className="animate-spin" /> : (
                    <>
                        <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S14.89 2 12.16 2C6.4 2 2 6.25 2 12c0 5.75 4.4 10 10 10c5.97 0 10.06-4.12 10.06-10c0-.52-.05-1.02-.1-1.51l.29.35z"/></svg>
                        Sign in with Google
                    </>
                )}
            </button>

            <form onSubmit={handleEmailLogin} className="space-y-3">
                <input 
                    type="email" 
                    placeholder="name@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-neutral-600 focus:border-emerald-500 outline-none transition-colors"
                />
                <button 
                    type="submit"
                    disabled={loading || !email}
                    className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-emerald-500 transition-colors disabled:opacity-50 shadow-lg shadow-emerald-900/20"
                >
                    {loading ? 'Signing in...' : 'Sign in with Email'}
                </button>
            </form>

            <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest"><span className="bg-[#0a0a0a] px-2 text-neutral-600">No Account?</span></div>
            </div>

            <button 
                onClick={onGuest}
                className="w-full border border-white/10 bg-white/5 text-neutral-300 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/10 hover:text-white transition-colors group"
            >
                <Ghost size={16} className="text-neutral-500 group-hover:text-white transition-colors" />
                Continue as Guest
            </button>
             <p className="text-[10px] text-center text-neutral-600">Guest data is local-only and clears on session end.</p>
        </div>
      </div>
    </div>
  );
};

const CategorizeMenu = ({ 
  currentTheme, 
  themes, 
  onSelect, 
  onClose 
}: { 
  currentTheme: string; 
  themes: string[]; 
  onSelect: (theme: string) => void; 
  onClose: () => void;
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div 
      ref={menuRef}
      className="absolute right-0 top-full mt-2 z-[60] w-56 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl py-2 animate-in fade-in zoom-in-95 duration-200"
    >
      <div className="px-4 py-2 border-b border-white/5 mb-1">
        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Move to Collection</p>
      </div>
      <div className="max-h-60 overflow-y-auto custom-scrollbar">
        {themes.filter(t => t !== 'All Tools').map(theme => (
          <button
            key={theme}
            onClick={() => { onSelect(theme); onClose(); }}
            className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium transition-all hover:bg-[var(--theme-accent-dim)] group ${currentTheme === theme ? 'text-[var(--theme-accent)]' : 'text-neutral-400 hover:text-white'}`}
          >
            <div className="flex items-center gap-3">
              <ThemeIcon theme={theme} size={14} className={currentTheme === theme ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'} />
              {theme}
            </div>
            {currentTheme === theme && <Check size={12} />}
          </button>
        ))}
      </div>
    </div>
  );
};

const SettingsModal = ({ 
    onClose, 
    currentTheme, 
    setTheme, 
    currentLang, 
    setLang,
    t
}: { 
    onClose: () => void, 
    currentTheme: ThemeKey, 
    setTheme: (t: ThemeKey) => void,
    currentLang: LangKey,
    setLang: (l: LangKey) => void,
    t: (k: keyof typeof TRANSLATIONS.en) => string
}) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-lg bg-[#0a0a0a]/95 border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-8 relative">
                 <button onClick={onClose} className="absolute top-6 right-6 p-2 text-neutral-500 hover:text-white transition-colors">
                    <X size={20} />
                </button>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[var(--theme-accent-dim)] rounded-xl flex items-center justify-center text-[var(--theme-accent)] border border-[var(--theme-accent)]/20">
                        <Settings size={20} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">{t('settings')}</h3>
                        <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest">System Preferences</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Theme Selector */}
                    <div className="space-y-3">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                            <Palette size={12} /> {t('theme')}
                         </label>
                         <div className="grid grid-cols-3 gap-2">
                            {Object.values(THEMES).map((theme) => (
                                <button 
                                    key={theme.id}
                                    onClick={() => setTheme(theme.id as ThemeKey)}
                                    className={`relative p-3 rounded-xl border transition-all overflow-hidden ${currentTheme === theme.id ? 'border-[var(--theme-accent)] bg-[var(--theme-accent-dim)]' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
                                >
                                    <div className="flex flex-col gap-2 relative z-10">
                                        <div className="flex gap-1">
                                            <div className="w-3 h-3 rounded-full" style={{ background: theme.accent }}></div>
                                            <div className="w-3 h-3 rounded-full" style={{ background: theme.bg, border: '1px solid rgba(255,255,255,0.2)' }}></div>
                                        </div>
                                        <span className={`text-xs font-medium ${currentTheme === theme.id ? 'text-white' : 'text-neutral-400'}`}>{theme.label}</span>
                                    </div>
                                    {/* Abstract bg hint */}
                                    <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full opacity-20 blur-xl" style={{ background: theme.accent }} />
                                </button>
                            ))}
                         </div>
                    </div>

                    {/* Language Selector */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                            <Languages size={12} /> {t('language')}
                         </label>
                        <div className="grid grid-cols-3 gap-2">
                            {Object.entries(LANGUAGES).map(([code, lang]) => (
                                <button 
                                    key={code}
                                    onClick={() => setLang(code as LangKey)}
                                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${currentLang === code ? 'border-[var(--theme-accent)] bg-[var(--theme-accent-dim)] text-white' : 'border-white/10 bg-white/5 text-neutral-400 hover:text-white'}`}
                                >
                                    <span className="mr-2">{lang.flag}</span>
                                    {lang.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* System Info */}
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex items-center justify-between mb-2">
                             <span className="text-sm font-bold text-white flex items-center gap-2"><Server size={14} className="text-[var(--theme-accent)]"/> API Gateway</span>
                             <span className="text-[10px] font-black uppercase tracking-widest bg-[var(--theme-accent-dim)] text-[var(--theme-accent)] px-2 py-0.5 rounded-full flex items-center gap-1"><ShieldCheck size={10} /> Secure</span>
                        </div>
                        <p className="text-xs text-neutral-500 leading-relaxed">
                            System is connected via secure environment variables. All requests are routed through Google Gemini's enterprise infrastructure.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

const SuggestionsModal = ({ 
    links,
    onAdd,
    onClose 
}: { 
    links: LinkItem[];
    onAdd: (url: string, title?: string) => void;
    onClose: () => void;
}) => {
    const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const context = links.slice(0, 15).map(l => l.title).join(', ');
                const response = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: `Based on this user's collection: [${context}], recommend 3 NEW, high-quality, distinct web tools or resources. Do not duplicate existing ones. Return JSON: { suggestions: [{ title, url, description, theme, reason }] }`,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                suggestions: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            title: { type: Type.STRING },
                                            url: { type: Type.STRING },
                                            description: { type: Type.STRING },
                                            theme: { type: Type.STRING },
                                            reason: { type: Type.STRING }
                                        }
                                    }
                                }
                            }
                        }
                    }
                });
                
                const data = JSON.parse(response.text || '{"suggestions": []}') as SuggestionResponse;
                setSuggestions(data.suggestions);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchSuggestions();
    }, [links]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
                 <button onClick={onClose} className="absolute top-6 right-6 p-2 text-neutral-500 hover:text-white transition-colors z-10">
                    <X size={20} />
                </button>
                
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Sparkles className="text-[var(--theme-accent)]" size={24} />
                        <h3 className="text-2xl font-bold text-white">Smart Discovery</h3>
                    </div>
                    <p className="text-neutral-500 text-sm mb-8">AI-curated recommendations based on your library.</p>

                    {loading ? (
                         <div className="py-20 flex flex-col items-center justify-center gap-4">
                            <RefreshCcw size={32} className="text-[var(--theme-accent)] animate-spin" />
                            <p className="text-xs font-bold uppercase tracking-widest text-neutral-600 animate-pulse">Analyzing Pattern Matches...</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {suggestions.map((s, i) => (
                                <div key={i} className="p-5 bg-white/5 border border-white/5 rounded-2xl hover:border-[var(--theme-accent)] transition-all group">
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold text-white text-lg">{s.title}</h4>
                                                <span className="text-[9px] font-bold uppercase tracking-widest bg-[var(--theme-accent-dim)] text-[var(--theme-accent)] px-2 py-0.5 rounded">{s.theme}</span>
                                            </div>
                                            <p className="text-sm text-neutral-400 mb-2">{s.description}</p>
                                            <p className="text-xs text-neutral-600 italic"><span className="font-bold text-[var(--theme-accent)]/70">Why:</span> {s.reason}</p>
                                        </div>
                                        <button 
                                            onClick={() => { onAdd(s.url, s.title); onClose(); }}
                                            className="p-3 bg-white text-black rounded-xl hover:bg-[var(--theme-accent)] transition-colors shadow-lg shrink-0"
                                            title="Add to Collection"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ChatAssistant = ({ 
    links, 
    onClose 
}: { 
    links: LinkItem[]; 
    onClose: () => void 
}) => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', text: 'Hello Chris. I have access to your knowledge base. What are you looking for?', timestamp: Date.now() }
    ]);
    const [thinking, setThinking] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setThinking(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            // Simplified context for token efficiency
            const context = links.map(l => `- ${l.title} (${l.theme}): ${l.description}`).join('\n');
            const prompt = `System: You are an intelligent assistant for a bookmark manager app. 
            Context (User's Bookmarks):\n${context}\n
            User Query: ${userMsg.text}
            Instruction: Answer based on the bookmarks provided. If relevant, mention specific bookmark titles. Be concise and professional.`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt
            });

            const aiMsg: ChatMessage = { role: 'model', text: response.text || "I couldn't process that.", timestamp: Date.now() };
            setMessages(prev => [...prev, aiMsg]);
        } catch (e) {
            setMessages(prev => [...prev, { role: 'model', text: "Connection error. Please try again.", timestamp: Date.now() }]);
        } finally {
            setThinking(false);
        }
    };

    return (
        <div className="fixed inset-y-0 right-0 z-[100] w-full md:w-[400px] bg-[#0a0a0a] border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[var(--theme-accent)] rounded-lg flex items-center justify-center text-black">
                        <Bot size={18} />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm">Neural Assistant</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 bg-[var(--theme-accent)] rounded-full animate-pulse" />
                            <span className="text-[10px] text-[var(--theme-accent)] font-bold uppercase tracking-widest">Online</span>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 text-neutral-500 hover:text-white"><X size={18}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" ref={scrollRef}>
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-white text-black rounded-tr-sm' : 'bg-white/10 text-neutral-200 rounded-tl-sm'}`}>
                            {m.text}
                        </div>
                    </div>
                ))}
                {thinking && (
                    <div className="flex justify-start">
                        <div className="bg-white/5 px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1">
                            <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '0ms'}} />
                            <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '150ms'}} />
                            <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '300ms'}} />
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-white/10 bg-black/40 backdrop-blur-md">
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Ask about your knowledge base..." 
                        className="w-full bg-neutral-900 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:border-[var(--theme-accent)] outline-none"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!input.trim() || thinking}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[var(--theme-accent)] text-black rounded-lg hover:opacity-90 disabled:opacity-50 disabled:bg-neutral-800 disabled:text-neutral-500 transition-all"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

const DeepDiveModal = ({ 
  link, 
  onClose 
}: { 
  link: LinkItem; 
  onClose: () => void; 
}) => {
  const [relatedLinks, setRelatedLinks] = useState<RelatedLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeepDive = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Find 3 recent, high-quality, relevant web articles or resources related to: "${link.title}". Return ONLY the search grounding chunks.`,
          config: {
            tools: [{googleSearch: {}}],
          },
        });
        
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        const foundLinks: RelatedLink[] = [];
        
        if (chunks) {
            chunks.forEach(chunk => {
                if (chunk.web) {
                    foundLinks.push({ title: chunk.web.title || 'Related Resource', url: chunk.web.uri || '#' });
                }
            });
        }
        
        setRelatedLinks(foundLinks.slice(0, 4));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDeepDive();
  }, [link]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-[#0a0a0a]/90 border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative backdrop-blur-xl">
         <button onClick={onClose} className="absolute top-6 right-6 p-2 text-neutral-500 hover:text-white transition-colors z-10">
            <X size={20} />
          </button>

        <div className="p-8 md:p-10">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-[var(--theme-accent-dim)] rounded-xl flex items-center justify-center text-[var(--theme-accent)] border border-[var(--theme-accent)]/20">
                    <Globe2 size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">Global Context Search</h3>
                    <p className="text-xs text-neutral-500 font-medium uppercase tracking-widest mt-0.5">Automated Research Agent</p>
                </div>
            </div>
            
            <div className="mb-8 pl-4 border-l-2 border-[var(--theme-accent)]/30">
               <p className="text-sm text-neutral-400">Target Entity</p>
               <p className="text-lg font-semibold text-white">{link.title}</p>
            </div>

            {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-4">
                    <RefreshCcw size={24} className="text-[var(--theme-accent)] animate-spin" />
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-600 animate-pulse">Analyzing Web Data...</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {relatedLinks.length > 0 ? relatedLinks.map((r, i) => (
                        <a 
                            key={i} 
                            href={r.url} 
                            target="_blank"
                            className="block p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-[var(--theme-accent)] transition-all group"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h4 className="font-medium text-neutral-200 group-hover:text-[var(--theme-accent)] transition-colors mb-1">{r.title}</h4>
                                    <p className="text-xs text-neutral-500 truncate max-w-md font-mono">{new URL(r.url).hostname}</p>
                                </div>
                                <ExternalLink size={16} className="text-neutral-600 group-hover:text-white transition-colors shrink-0" />
                            </div>
                        </a>
                    )) : (
                        <div className="text-center py-8 text-neutral-500 italic">No external context found.</div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

const EditLinkModal = ({ 
  link, 
  themes,
  onClose, 
  onSave, 
  onGenerateImage 
}: { 
  link: LinkItem; 
  themes: string[];
  onClose: () => void; 
  onSave: (id: string, updates: Partial<LinkItem>) => void;
  onGenerateImage: (title: string, description: string) => Promise<string | undefined>;
}) => {
  const [title, setTitle] = useState(link.title);
  const [description, setDescription] = useState(link.description);
  const [theme, setTheme] = useState(link.theme);
  const [urlInput, setUrlInput] = useState(link.previewImageUrl || '');
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    const newUrl = await onGenerateImage(title, description);
    if (newUrl) {
        setUrlInput(newUrl);
    }
    setIsRegenerating(false);
  };

  const handleSave = () => {
      onSave(link.id, {
          title,
          description,
          theme,
          previewImageUrl: urlInput
      });
      onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-xl bg-[#0a0a0a]/95 border border-white/10 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col backdrop-blur-xl">
        <div className="p-8 border-b border-white/5 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-white">Edit Resource</h3>
            <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest mt-1">Metadata Configuration</p>
          </div>
          <button onClick={onClose} className="p-2 text-neutral-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
          {/* Image Section */}
          <div className="aspect-video w-full rounded-2xl bg-neutral-900 overflow-hidden border border-white/5 relative group">
            {urlInput ? (
              <img src={urlInput} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-neutral-700 text-sm font-medium">No Asset Available</div>
            )}
             <button 
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-2 bg-[var(--theme-accent)] text-black rounded-lg font-bold text-[10px] uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50 shadow-lg"
            >
              {isRegenerating ? <RefreshCcw size={12} className="animate-spin" /> : <Wand2 size={12} />}
              Generate Asset
            </button>
          </div>

          <div className="space-y-5">
             <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Resource Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-sm font-medium text-white outline-none focus:border-[var(--theme-accent)] transition-all placeholder:text-neutral-700"
                  placeholder="Resource Title"
                />
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Context / Summary</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-sm font-light text-neutral-300 outline-none focus:border-[var(--theme-accent)] transition-all placeholder:text-neutral-700 resize-none leading-relaxed"
                  placeholder="Brief summary..."
                />
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Collection</label>
                    <div className="relative">
                        <select 
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-[var(--theme-accent)] transition-all appearance-none cursor-pointer"
                        >
                            {themes.filter(t => t !== 'All Tools').map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">
                            <Layers size={14} />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Image URL</label>
                    <input 
                    type="text" 
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-sm outline-none focus:border-[var(--theme-accent)] transition-all text-neutral-400 font-mono"
                    />
                </div>
             </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-white/5 bg-white/5">
            <button 
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 py-4 bg-white text-black rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all shadow-xl"
            >
              <Save size={16} />
              Save Configuration
            </button>
        </div>
      </div>
    </div>
  );
};

// --- Helper for Audio ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// --- Main App ---

const App = () => {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [customThemes, setCustomThemes] = useState<string[]>(['All Tools', 'AI Video', 'Image Creation', 'Coding', 'Music', 'News']);
  const [historyPast, setHistoryPast] = useState<LinkItem[][]>([]);
  const [historyFuture, setHistoryFuture] = useState<LinkItem[][]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [taskProgress, setTaskProgress] = useState<{current: number, total: number, label: string} | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTheme, setActiveTheme] = useState('All Tools');
  const [viewMode, setViewMode] = useState<ViewMode>('detailed');
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [deepDiveLink, setDeepDiveLink] = useState<LinkItem | null>(null);
  const [activeCategorizeMenu, setActiveCategorizeMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newThemeName, setNewThemeName] = useState('');
  const [executiveSummary, setExecutiveSummary] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' });
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  
  // --- Auth & State ---
  const [user, setUser] = useState<UserProfile | null>(() => {
      try {
          const saved = localStorage.getItem('chris_active_session');
          return saved ? JSON.parse(saved) : null;
      } catch(e) { return null; }
  });
  const [isGuest, setIsGuest] = useState(false);
  
  const isAuthenticated = !!user || isGuest;

  const [chatOpen, setChatOpen] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [appTheme, setAppTheme] = useState<ThemeKey>('default');
  const [language, setLanguage] = useState<LangKey>('en');
  
  // New Toast State
  const [toast, setToast] = useState<{ message: string, undo?: () => void } | null>(null);
  
  // State for tracking which cards are currently generating summaries
  const [summarizingIds, setSummarizingIds] = useState<Set<string>>(new Set());

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Translation Helper
  const t = (key: keyof typeof TRANSLATIONS.en) => {
    return TRANSLATIONS[language][key] || TRANSLATIONS['en'][key];
  };

  // --- Storage Helpers ---
  const getStorageKey = useCallback((key: string) => {
      if (user) return `chris_user_${user.email}_${key}`;
      if (isGuest) return `chris_guest_${key}`;
      return `chris_temp_${key}`;
  }, [user, isGuest]);

  const getStorage = useCallback(() => {
      if (user) return localStorage;
      if (isGuest) return sessionStorage; // Ephemeral for guest
      return sessionStorage;
  }, [user, isGuest]);


  const pushToHistory = useCallback(() => {
    setHistoryPast(prev => [...prev.slice(-49), links]);
    setHistoryFuture([]); 
  }, [links]);

  const undo = useCallback(() => {
    if (historyPast.length === 0) return;
    const previous = historyPast[historyPast.length - 1];
    setHistoryFuture(prev => [links, ...prev]); 
    setLinks(previous || []);
    setHistoryPast(prev => prev.slice(0, prev.length - 1));
  }, [historyPast, links]);

  const redo = useCallback(() => {
    if (historyFuture.length === 0) return;
    const next = historyFuture[0];
    setHistoryPast(prev => [...prev, links]); 
    setLinks(next);
    setHistoryFuture(prev => prev.slice(1));
  }, [historyFuture, links]);

  // Keep ref up to date for toast closures
  const undoRef = useRef(undo);
  useEffect(() => { undoRef.current = undo; }, [undo]);

  // Toast Timer
  useEffect(() => {
    if (toast) {
        const timer = setTimeout(() => setToast(null), 4000);
        return () => clearTimeout(timer);
    }
  }, [toast]);

  const loadDemoCollection = useCallback(() => {
    const demoData: LinkItem[] = [
      {
        id: 'demo1',
        url: 'https://openai.com/sora',
        title: 'OpenAI Sora',
        description: 'Generating realistic and imaginative scenes from text instructions. A leap forward in high-fidelity AI cinematography.',
        theme: 'AI Video',
        iconEmoji: '🎬',
        favicon: `https://www.google.com/s2/favicons?sz=128&domain=openai.com`,
        previewImageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800',
        timestamp: Date.now() - 500,
      },
      {
        id: 'demo2',
        url: 'https://github.com/features/copilot',
        title: 'GitHub Copilot',
        description: 'An AI-powered developer tool that helps you write code faster. It transforms natural language prompts into coding suggestions.',
        theme: 'Coding',
        iconEmoji: '💻',
        favicon: `https://www.google.com/s2/favicons?sz=128&domain=github.com`,
        previewImageUrl: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&q=80&w=800',
        timestamp: Date.now() - 1000,
      }
    ];
    setLinks(demoData);
  }, []);

  // --- Persist / Load Data ---
  useEffect(() => {
      if (!isAuthenticated) return;

      const storage = getStorage();
      const linkKey = getStorageKey('links');
      
      const savedLinks = storage.getItem(linkKey);
      if (savedLinks) {
          try {
              const parsed = JSON.parse(savedLinks);
              if (Array.isArray(parsed) && parsed.length > 0) setLinks(parsed);
              else loadDemoCollection();
          } catch(e) { loadDemoCollection(); }
      } else {
          loadDemoCollection();
      }
      
      // Load Prefs
      const prefKey = getStorageKey('pref');
      const savedPref = storage.getItem(prefKey);
      if (savedPref) {
          try {
              const p = JSON.parse(savedPref);
              if (p.theme) setAppTheme(p.theme);
              if (p.lang) setLanguage(p.lang);
          } catch(e) {
              // Defaults if error
          }
      } else {
          setAppTheme('default');
          setLanguage('en');
      }

  }, [user, isGuest, isAuthenticated, getStorage, getStorageKey, loadDemoCollection]);

  // Save changes
  useEffect(() => {
      if (!isAuthenticated) return;
      const storage = getStorage();
      if (links.length > 0) {
          storage.setItem(getStorageKey('links'), JSON.stringify(links));
      }
      storage.setItem(getStorageKey('themes'), JSON.stringify(customThemes));
      storage.setItem(getStorageKey('view'), viewMode);
      storage.setItem(getStorageKey('pref'), JSON.stringify({ theme: appTheme, lang: language }));
      
      if (user) {
          localStorage.setItem('chris_active_session', JSON.stringify(user));
      }
  }, [links, customThemes, viewMode, appTheme, language, user, isGuest, isAuthenticated, getStorage, getStorageKey]);

  const handleLogout = () => {
    setUser(null);
    setIsGuest(false);
    localStorage.removeItem('chris_active_session');
    setLinks([]);
    setAppTheme('default');
    setLanguage('en');
  };

  const generatePreviewImage = async (title: string, description: string): Promise<string | undefined> => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      let styleDescription = 'Cyberpunk aesthetic, neon green accents, deep black background, futuristic, digital glitch effects, high-tech';
      
      if (appTheme === 'reggae') {
          styleDescription = 'Reggae Roots style: Rasta colors (green, gold, red), organic wood textures, warm lighting, smoke effects, artistic';
      } else if (appTheme === 'rap') {
          styleDescription = 'Hip Hop Gold style: Black and gold luxury, urban aesthetic, sharp contrast, spotlighting, metallic textures';
      } else if (appTheme === 'classic') {
          styleDescription = 'Classical style: Deep navy blue and marble textures, sophisticated, minimalist, serene, editorial, greek statues';
      } else if (appTheme === 'pop') {
          styleDescription = 'Pop Art style: Vibrant neon pinks and purples, bold outlines, halftone patterns, retro-futuristic, energetic';
      }

      const prompt = `Minimalist editorial illustration for "${title}". ${description}. Style: ${styleDescription}. No text in image.`;

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: "16:9" } }
      });
      
      const firstCandidate = response.candidates?.[0];
      if (firstCandidate?.content?.parts) {
        for (const part of firstCandidate.content.parts) {
          if (part.inlineData) {
            return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
          }
        }
      }
    } catch (err) { console.error(err); }
    return undefined;
  };

  const analyzeLinkWithAI = async (url: string, manualTitle?: string): Promise<LinkItem | null> => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const themeOptions = customThemes.filter(t => t !== 'All Tools').join(', ');
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze this link: ${url}. (Title provided: ${manualTitle || 'unknown'}). Output a refined title, summary, one theme from [${themeOptions}], and one emoji. JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              theme: { type: Type.STRING },
              description: { type: Type.STRING },
              iconEmoji: { type: Type.STRING },
            },
            required: ["title", "theme", "description", "iconEmoji"],
          },
        },
      });

      const responseText = response.text || '{}';
      const data = JSON.parse(responseText.trim()) as GeminiResponse;
      const previewImg = await generatePreviewImage(data.title, data.description);

      return {
        id: Math.random().toString(36).substr(2, 9),
        url,
        title: data.title || manualTitle || url,
        description: data.description,
        theme: data.theme || "News",
        iconEmoji: data.iconEmoji || "🔗",
        favicon: `https://www.google.com/s2/favicons?sz=128&domain=${new URL(url).hostname}`,
        previewImageUrl: previewImg,
        timestamp: Date.now(),
      };
    } catch (e) {
      console.error("AI Analysis failed for", url, e);
      return null;
    }
  };

  const processLink = async (url: string) => {
    if (!url) return;
    let normalizedUrl = url.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) normalizedUrl = 'https://' + normalizedUrl;
    
    setIsProcessing(true);
    const newLink = await analyzeLinkWithAI(normalizedUrl);
    if (newLink) {
      pushToHistory();
      setLinks(prev => [newLink, ...prev]);
      setInputValue('');
    }
    setIsProcessing(false);
  };

  const handleSmartOrganize = async () => {
    if (links.length === 0) return;
    setIsOrganizing(true);
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Process in batches of 20 to avoid context limits
        const batches = [];
        const batchSize = 20;
        for (let i = 0; i < links.length; i += batchSize) {
            batches.push(links.slice(i, i + batchSize));
        }

        let updatedLinks = [...links];
        let changesCount = 0;
        
        // Get themes excluding 'All Tools'
        const themesList = customThemes.filter(t => t !== 'All Tools').join(', ');

        for (const batch of batches) {
            const batchContext = batch.map(l => `ID: ${l.id} | Title: ${l.title} | Description: ${l.description} | CurrentTheme: ${l.theme}`).join('\n');
            
            const prompt = `
            You are a meticulous librarian. I have a list of resources and a list of categories.
            Categories: [${themesList}]
            
            Resources:
            ${batchContext}
            
            Task: Assign the SINGLE best category from the provided list to each resource based on its title and description.
            If the CurrentTheme is already the best fit, keep it.
            Return a JSON object: { "assignments": [ { "id": "...", "theme": "..." } ] }
            Only return assignments where the category strictly matches one from the Categories list.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            assignments: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        id: { type: Type.STRING },
                                        theme: { type: Type.STRING }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            const result = JSON.parse(response.text || '{"assignments": []}');
            
            if (result.assignments) {
                result.assignments.forEach((assignment: any) => {
                    const index = updatedLinks.findIndex(l => l.id === assignment.id);
                    if (index !== -1 && customThemes.includes(assignment.theme)) {
                        if (updatedLinks[index].theme !== assignment.theme) {
                            updatedLinks[index] = { ...updatedLinks[index], theme: assignment.theme };
                            changesCount++;
                        }
                    }
                });
            }
        }
        
        if (changesCount > 0) {
            pushToHistory();
            setLinks(updatedLinks);
            console.log(`Smart Organization Complete: ${changesCount} resources re-categorized.`);
        }

    } catch (e) {
        console.error("Auto-organize failed", e);
    } finally {
        setIsOrganizing(false);
    }
  };

  const handleGenerateMissingImages = async () => {
    const missing = links.filter(l => !l.previewImageUrl);
    if (missing.length === 0) return;

    pushToHistory();
    setTaskProgress({ current: 0, total: missing.length, label: 'Generating Assets' });

    // Process in batches of 3 to avoid rate limits but speed up process
    const BATCH_SIZE = 3;
    for (let i = 0; i < missing.length; i += BATCH_SIZE) {
        const batch = missing.slice(i, i + BATCH_SIZE);
        
        const results = await Promise.all(batch.map(async (link) => {
             const newUrl = await generatePreviewImage(link.title, link.description);
             return { id: link.id, newUrl };
        }));

        setLinks(prev => {
            let next = [...prev];
            results.forEach(r => {
                if (r.newUrl) {
                    next = next.map(l => l.id === r.id ? { ...l, previewImageUrl: r.newUrl } : l);
                }
            });
            return next;
        });

        setTaskProgress({ current: Math.min(i + BATCH_SIZE, missing.length), total: missing.length, label: 'Generating Assets' });
    }
    setTaskProgress(null);
  };

  const handleAutoGenerateSummaries = async () => {
    const missing = links.filter(l => !l.aiSummary);
    if (missing.length === 0) return;

    pushToHistory();
    setTaskProgress({ current: 0, total: missing.length, label: 'Generating Summaries' });

    // Batch process to avoid rate limits
    const BATCH_SIZE = 5;
    for (let i = 0; i < missing.length; i += BATCH_SIZE) {
        const batch = missing.slice(i, i + BATCH_SIZE);
        
        await Promise.all(batch.map(async (link) => {
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const response = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: `Summarize this in max 20 words. Focus on main value.
                    Title: ${link.title}
                    Desc: ${link.description}`
                });
                const summary = response.text?.trim();
                if (summary) {
                    setLinks(prev => prev.map(l => l.id === link.id ? { ...l, aiSummary: summary } : l));
                }
            } catch (e) {
                console.error(e);
            }
        }));
        
        setTaskProgress({ current: Math.min(i + BATCH_SIZE, missing.length), total: missing.length, label: 'Generating Summaries' });
    }
    setTaskProgress(null);
  };

  const synthesizeIntel = async () => {
    if (links.length === 0) return;
    setIsSynthesizing(true);
    setExecutiveSummary(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const visibleLinks = activeTheme === 'All Tools' ? links : links.filter(l => l.theme === activeTheme);
      const context = visibleLinks.slice(0, 10).map(l => `${l.title}: ${l.description}`).join('\n');
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are a strategic intelligence analyst. Provide a high-level strategic assessment (max 3 sentences) of the following collected resources. Identify the core technological or creative pattern emerging from this collection. Address the user professionally.\n\nData:\n${context}`
      });
      setExecutiveSummary(response.text || "Unable to generate assessment.");
    } catch (e) {
      setExecutiveSummary("Analysis failed. Please try again.");
    }
    setIsSynthesizing(false);
  };

  const stopAudio = () => {
    if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current = null;
    }
    setIsPlayingAudio(false);
  };

  const playBriefing = async () => {
    if (isPlayingAudio) {
        stopAudio();
        return;
    }
    if (!executiveSummary) return;

    try {
        setIsPlayingAudio(true);
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: executiveSummary }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error("No audio data");

        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
        }
        
        const audioBuffer = await audioContextRef.current.decodeAudioData(decode(base64Audio).buffer);
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => setIsPlayingAudio(false);
        source.start();
        audioSourceRef.current = source;

    } catch (e) {
        console.error("TTS Failed", e);
        setIsPlayingAudio(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const html = event.target?.result as string;
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const anchorTags = Array.from(doc.querySelectorAll('a'));
      
      if (anchorTags.length === 0) {
        alert("No links found in this file. Please ensure it is a valid Chrome Bookmarks HTML export.");
        return;
      }

      setTaskProgress({ current: 0, total: anchorTags.length, label: t('importData') });
      pushToHistory();
      
      for (let i = 0; i < anchorTags.length; i++) {
        const a = anchorTags[i];
        const url = a.href;
        const title = a.textContent || '';
        
        if (url && url.startsWith('http')) {
          setTaskProgress({ current: i + 1, total: anchorTags.length, label: t('importData') });
          const processed = await analyzeLinkWithAI(url, title);
          if (processed) {
            setLinks(prev => [processed, ...prev]);
          }
        }
      }
      setTaskProgress(null);
    };
    reader.readAsText(file);
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ links, themes: customThemes }));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "chris_bookmarks_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleUpdateLink = (id: string, updates: Partial<LinkItem>) => {
    pushToHistory();
    setLinks(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    setEditingLink(null);
  };

  const handleMoveTheme = (id: string, newTheme: string) => {
    pushToHistory();
    setLinks(prev => prev.map(l => l.id === id ? { ...l, theme: newTheme } : l));
    
    // Trigger undo toast
    setToast({
        message: `Moved to ${newTheme}`,
        undo: () => {
            undoRef.current(); // Use ref to call fresh undo closure
            setToast(null);
        }
    });
  };

  // AI Summary Logic
  const handleGenerateSummary = async (id: string, title: string, description: string) => {
    setSummarizingIds(prev => new Set(prev).add(id));
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Summarize the following resource in a single, high-impact sentence (max 20 words). Focus on the value proposition.
            Title: ${title}
            Description: ${description}`
        });
        const summary = response.text?.trim();
        if (summary) {
            handleUpdateLink(id, { aiSummary: summary });
        }
    } catch (e) {
        console.error('Summary generation failed', e);
    } finally {
        setSummarizingIds(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    }
  };

  const handleAddTheme = () => {
    if (newThemeName && !customThemes.includes(newThemeName)) {
      setCustomThemes(prev => [...prev, newThemeName]);
      setNewThemeName('');
    }
  };

  const deleteTheme = (themeToDelete: string) => {
    if (themeToDelete === 'All Tools') return;
    if (confirm(`Delete category "${themeToDelete}"? Links will be moved to "News".`)) {
      setCustomThemes(prev => prev.filter(t => t !== themeToDelete));
      setLinks(prev => prev.map(l => l.theme === themeToDelete ? { ...l, theme: 'News' } : l));
      if (activeTheme === themeToDelete) setActiveTheme('All Tools');
    }
  };

  const filteredLinks = useMemo<LinkItem[]>(() => {
    let results = links.filter(l => {
      const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            l.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTheme = activeTheme === 'All Tools' || l.theme === activeTheme;
      return matchesSearch && matchesTheme;
    });

    return results.sort((a, b) => {
      if (sortConfig.key === 'title') {
         return sortConfig.direction === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
      }
      if (sortConfig.key === 'date') {
         return sortConfig.direction === 'asc' ? a.timestamp - b.timestamp : b.timestamp - a.timestamp;
      }
      if (sortConfig.key === 'theme') {
         if (sortConfig.direction === 'creation') {
             return customThemes.indexOf(a.theme) - customThemes.indexOf(b.theme);
         }
         return sortConfig.direction === 'asc' ? a.theme.localeCompare(b.theme) : b.theme.localeCompare(a.theme);
      }
      return 0;
    });
  }, [links, searchQuery, activeTheme, sortConfig, customThemes]);

  const currentTheme = THEMES[appTheme];

  if (!isAuthenticated) {
      return <AuthLanding onLogin={setUser} onGuest={() => setIsGuest(true)} />
  }

  return (
    <div 
        className={`min-h-screen transition-colors duration-500 font-sans selection:bg-[var(--theme-accent-dim)] selection:text-white relative ${currentTheme.font}`}
        style={{
            '--theme-accent': currentTheme.accent,
            '--theme-accent-dim': currentTheme.accentDim,
            '--theme-bg': currentTheme.bg,
            '--theme-text': currentTheme.text,
            backgroundColor: 'var(--theme-bg)',
            color: 'var(--theme-text)'
        } as React.CSSProperties}
    >
      {/* Dynamic Background Image based on Theme */}
      <div 
        className="fixed inset-0 z-0 opacity-20 pointer-events-none transition-opacity duration-1000"
        style={{
            backgroundImage: appTheme === 'reggae' 
                ? `url('https://images.unsplash.com/photo-1596707474472-e35f9919f20e?q=80&w=2000&auto=format&fit=crop')` // Texture
                : appTheme === 'rap'
                ? `url('https://images.unsplash.com/photo-1614680376408-81e91ffe3db7?q=80&w=2000&auto=format&fit=crop')` // Dark/Gold
                : appTheme === 'classic'
                ? `url('https://images.unsplash.com/photo-1507838153414-b4b713384ebd?q=80&w=2000&auto=format&fit=crop')` // Abstract classical
                : appTheme === 'pop'
                ? `url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2000&auto=format&fit=crop')` // Neon
                : `url('https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?q=80&w=2832&auto=format&fit=crop')`, // Cyberpunk
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Overlay */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-[var(--theme-bg)]/90 via-[var(--theme-bg)]/80 to-[var(--theme-bg)] pointer-events-none" />

      <header className="sticky top-0 z-50 border-b border-white/5 bg-[var(--theme-bg)]/70 backdrop-blur-xl transition-colors duration-500">
        <div className="max-w-screen-2xl mx-auto px-6 h-20 flex items-center justify-between gap-4 md:gap-8">
          <div className="flex items-center gap-4 shrink-0">
            <button className="lg:hidden p-2 text-neutral-400" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu size={20} />
            </button>
            <div className="w-9 h-9 bg-[var(--theme-accent)] rounded-lg flex items-center justify-center text-black shadow-[0_0_20px_var(--theme-accent-dim)]">
              <BookOpen size={20} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold tracking-tight leading-none text-[var(--theme-text)]">CHRIS BOOKMARKS</h1>
              <p className="text-[9px] text-[var(--theme-accent)] font-bold tracking-[0.2em] mt-0.5">KNOWLEDGE BASE</p>
            </div>
          </div>

          <div className="flex-1 max-w-xl relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
            <input 
              type="text" 
              placeholder={t('searchPlaceholder')}
              className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pl-11 pr-4 focus:border-[var(--theme-accent)] focus:bg-white/10 transition-all text-sm outline-none placeholder:text-neutral-600 font-medium text-[var(--theme-text)]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
             <div className="hidden md:flex bg-white/5 p-1 rounded-lg border border-white/5 gap-1">
               <button 
                  onClick={() => setSortMenuOpen(!sortMenuOpen)}
                  className={`p-2 rounded-md transition-all relative ${sortMenuOpen ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-white'}`}
                >
                  <ListFilter size={18} />
                  {sortMenuOpen && (
                  <div className="absolute right-0 top-full mt-3 w-56 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl p-1.5 z-[60] animate-in fade-in zoom-in-95 backdrop-blur-xl">
                    <div className="px-3 py-2 border-b border-white/5 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Sort Collection</span>
                    </div>
                    
                    <button onClick={() => { setSortConfig({ key: 'date', direction: 'desc' }); setSortMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all ${sortConfig.key === 'date' && sortConfig.direction === 'desc' ? 'bg-[var(--theme-accent-dim)] text-[var(--theme-accent)]' : 'text-neutral-400 hover:bg-white/5'}`}>
                      <Clock size={14} /> Date: Newest
                    </button>
                    <button onClick={() => { setSortConfig({ key: 'date', direction: 'asc' }); setSortMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all ${sortConfig.key === 'date' && sortConfig.direction === 'asc' ? 'bg-[var(--theme-accent-dim)] text-[var(--theme-accent)]' : 'text-neutral-400 hover:bg-white/5'}`}>
                      <Calendar size={14} /> Date: Oldest
                    </button>
                    <button onClick={() => { setSortConfig({ key: 'title', direction: 'asc' }); setSortMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all ${sortConfig.key === 'title' && sortConfig.direction === 'asc' ? 'bg-[var(--theme-accent-dim)] text-[var(--theme-accent)]' : 'text-neutral-400 hover:bg-white/5'}`}>
                      <ArrowDownAZ size={14} /> Title: A-Z
                    </button>
                  </div>
                )}
               </button>
               <div className="w-[1px] bg-white/10 mx-0.5 h-5 self-center" />
               <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white shadow-sm' : 'text-neutral-500 hover:text-white'}`}><Layout size={18} /></button>
               <button onClick={() => setViewMode('detailed')} className={`p-2 rounded-md transition-all ${viewMode === 'detailed' ? 'bg-white/10 text-white shadow-sm' : 'text-neutral-500 hover:text-white'}`}><LayoutList size={18} /></button>
             </div>
             
             <button onClick={undo} disabled={historyPast.length === 0} className="p-2.5 text-neutral-600 hover:text-white disabled:opacity-20 transition-colors" title="Undo"><Undo2 size={18} /></button>
             <button onClick={redo} disabled={historyFuture.length === 0} className="p-2.5 text-neutral-600 hover:text-white disabled:opacity-20 transition-colors" title="Redo"><Redo2 size={18} /></button>

             <button 
                onClick={() => setChatOpen(!chatOpen)}
                className={`p-2.5 rounded-lg transition-all ${chatOpen ? 'bg-[var(--theme-accent)] text-black' : 'text-neutral-500 hover:text-white hover:bg-white/5'}`}
             >
                <MessageSquare size={18} />
             </button>
             
             {/* User Profile - Always visible here since we are Authenticated/Guest */}
             <div className="relative group/profile ml-2">
                 <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all">
                    <span className="text-xs font-bold text-white hidden md:block max-w-[80px] truncate">{user ? user.name : 'Guest'}</span>
                    {user ? (
                        <img src={user.avatar} className="w-8 h-8 rounded-full bg-black" alt="" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center"><Ghost size={16} /></div>
                    )}
                 </button>
                 <div className="absolute right-0 top-full mt-2 w-48 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl p-1.5 z-[60] opacity-0 group-hover/profile:opacity-100 invisible group-hover/profile:visible transition-all">
                    <div className="px-3 py-2 border-b border-white/5 mb-1">
                        <p className="text-[10px] text-neutral-500 font-bold uppercase">{user ? 'Account' : 'Session'}</p>
                        <p className="text-xs text-white truncate">{user ? user.email : 'Local Only'}</p>
                    </div>
                    <button onClick={() => setSettingsOpen(true)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/5 text-left">
                        <Settings size={14} /> {t('settings')}
                    </button>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 text-left">
                        <LogOut size={14} /> {t('logout')}
                    </button>
                 </div>
             </div>
          </div>
        </div>
      </header>

      {deepDiveLink && (
        <DeepDiveModal link={deepDiveLink} onClose={() => setDeepDiveLink(null)} />
      )}

      {editingLink && (
        <EditLinkModal 
          link={editingLink} 
          themes={customThemes}
          onClose={() => setEditingLink(null)} 
          onSave={handleUpdateLink}
          onGenerateImage={generatePreviewImage}
        />
      )}

      {suggestionsOpen && (
        <SuggestionsModal 
            links={links}
            onClose={() => setSuggestionsOpen(false)}
            onAdd={(url, title) => processLink(url)}
        />
      )}

      {settingsOpen && <SettingsModal 
          onClose={() => setSettingsOpen(false)} 
          currentTheme={appTheme}
          setTheme={setAppTheme}
          currentLang={language}
          setLang={setLanguage}
          t={t}
      />}

      {chatOpen && <ChatAssistant links={links} onClose={() => setChatOpen(false)} />}
      
      {taskProgress && (
        <div className="fixed bottom-10 right-10 z-[60] bg-neutral-900 border border-white/10 p-6 rounded-3xl shadow-2xl min-w-[300px] animate-in slide-in-from-right-10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black uppercase tracking-widest text-[var(--theme-accent)]">{taskProgress.label}</span>
            <span className="text-xs font-bold text-neutral-500">{taskProgress.current} / {taskProgress.total}</span>
          </div>
          <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[var(--theme-accent)] transition-all duration-300" 
              style={{ width: `${(taskProgress.current / taskProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Undo/Redo Toast for Theme Changes */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[80] flex items-center gap-4 px-5 py-3 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[var(--theme-accent)] animate-pulse" />
                <span className="text-sm font-medium text-white">{toast.message}</span>
            </div>
            {toast.undo && (
                <div className="flex items-center gap-2 pl-4 border-l border-white/10">
                    <button 
                        onClick={toast.undo}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-[var(--theme-accent)] rounded-lg text-xs font-bold uppercase tracking-widest transition-all"
                    >
                        <Undo2 size={12} />
                        Undo
                    </button>
                </div>
            )}
            <button onClick={() => setToast(null)} className="ml-2 text-neutral-500 hover:text-white transition-colors">
                <X size={16} />
            </button>
        </div>
      )}

      <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-8 px-6 py-8 relative z-10">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-[var(--theme-bg)] border-r border-white/10 p-6 lg:static lg:w-64 lg:bg-transparent lg:border-none lg:p-0 transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="h-full overflow-y-auto custom-scrollbar space-y-8 pb-20">
            <div className="lg:hidden flex justify-end mb-4">
               <button onClick={() => setMobileMenuOpen(false)}><X size={24} className="text-neutral-500" /></button>
            </div>

            <div>
               <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-white/5 text-[var(--theme-text)] border border-white/5 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all group"
                >
                  <Upload size={14} className="group-hover:-translate-y-0.5 transition-transform" /> {t('importData')}
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept=".html" onChange={handleFileUpload} />
                
                <button 
                  onClick={handleExportData}
                  className="w-full mt-3 bg-transparent text-neutral-500 border border-white/5 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all"
                >
                  <Download size={14} /> {t('backup')}
                </button>

                <button 
                  onClick={handleGenerateMissingImages}
                  disabled={!!taskProgress}
                  className="w-full mt-3 bg-[var(--theme-accent-dim)] text-[var(--theme-accent)] border border-[var(--theme-accent)]/20 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest hover:bg-[var(--theme-accent)] hover:text-black transition-all disabled:opacity-50"
                >
                  <ImagePlus size={14} /> {t('autoGenerate')}
                </button>
                
                 <button 
                  onClick={handleAutoGenerateSummaries}
                  disabled={!!taskProgress}
                  className="w-full mt-3 bg-transparent text-[var(--theme-accent)] border border-[var(--theme-accent)]/20 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest hover:bg-[var(--theme-accent)] hover:text-black transition-all disabled:opacity-50"
                >
                  <FileText size={14} /> Summarize All
                </button>
            </div>

            <div className="p-5 bg-gradient-to-br from-white/5 to-transparent border border-white/5 rounded-2xl relative overflow-hidden group">
              <h3 className="text-xs font-bold mb-3 text-white">{t('addResource')}</h3>
              <div className="relative">
                <input 
                  type="text" placeholder="URL..." 
                  className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-3 pr-10 text-xs focus:border-[var(--theme-accent)] outline-none text-white font-mono"
                  value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && processLink(inputValue)}
                />
                <button 
                  onClick={() => processLink(inputValue)} disabled={isProcessing}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 bg-white text-black rounded-md flex items-center justify-center hover:bg-[var(--theme-accent)] transition-all disabled:opacity-20"
                >
                  {isProcessing ? <RefreshCcw size={12} className="animate-spin" /> : <Plus size={14} />}
                </button>
              </div>
            </div>

            <nav className="space-y-1">
              <div className="flex items-center justify-between mb-3 px-2">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">{t('collections')}</h2>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleSmartOrganize} 
                        disabled={isOrganizing}
                        className={`text-[10px] font-bold flex items-center gap-1 transition-colors ${isOrganizing ? 'text-[var(--theme-accent)] animate-pulse' : 'text-neutral-500 hover:text-white'}`}
                        title="Auto-Assign Themes to All Links"
                    >
                        {isOrganizing ? <RefreshCcw size={10} className="animate-spin" /> : <Wand2 size={10} />}
                        {t('autoSort')}
                    </button>
                    <button onClick={() => setSuggestionsOpen(true)} className="text-[10px] font-bold text-[var(--theme-accent)] flex items-center gap-1 hover:opacity-80 transition-colors">
                        <Lightbulb size={10} /> {t('discover')}
                    </button>
                </div>
              </div>
              
              <div className="px-2 mb-3 flex gap-2">
                <input 
                   type="text" 
                   placeholder={t('newCollection')} 
                   className="w-full bg-transparent border-b border-white/10 py-1 text-[10px] font-medium text-neutral-400 outline-none focus:border-[var(--theme-accent)] focus:text-white transition-colors"
                   value={newThemeName}
                   onChange={(e) => setNewThemeName(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleAddTheme()}
                />
                <button onClick={handleAddTheme} className="text-neutral-600 hover:text-[var(--theme-accent)] transition-colors">
                  <Plus size={14} />
                </button>
              </div>

              {customThemes.map(theme => (
                <div key={theme} className="group/item relative">
                  <button
                    onClick={() => { setActiveTheme(theme); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group ${activeTheme === theme ? 'bg-[var(--theme-accent-dim)] text-[var(--theme-accent)] font-semibold' : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5'}`}
                  >
                    <div className="flex items-center gap-3">
                      <ThemeIcon theme={theme} size={14} className={activeTheme === theme ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'} />
                      <span className="text-xs truncate">{theme}</span>
                    </div>
                  </button>
                  {theme !== 'All Tools' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteTheme(theme); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-neutral-700 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity"
                    >
                      <XCircle size={12} />
                    </button>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-h-screen">
            
            {/* Dashboard Header - Always Visible */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-3xl font-bold tracking-tight text-[var(--theme-text)]">{activeTheme}</h2>
                    <span className="text-xs font-mono text-neutral-500 bg-white/5 px-2 py-0.5 rounded-full">{filteredLinks.length}</span>
                  </div>
                  <p className="text-sm text-neutral-500 font-medium">
                     {activeTheme === 'All Tools' ? 'Complete resource inventory' : 'Curated specific collection'}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                    {/* Action Bar */}
                    <button 
                        onClick={synthesizeIntel}
                        disabled={isSynthesizing || links.length === 0}
                        className="flex items-center gap-2 bg-[var(--theme-accent-dim)] text-[var(--theme-accent)] border border-[var(--theme-accent)]/20 hover:bg-[var(--theme-accent)] hover:text-black px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                    >
                        {isSynthesizing ? <RefreshCcw size={14} className="animate-spin" /> : <BarChart3 size={16} />}
                        {t('strategicAssessment')}
                    </button>
                    
                    {executiveSummary && (
                       <button 
                         onClick={playBriefing}
                         className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border border-white/10 ${isPlayingAudio ? 'bg-[var(--theme-accent)] text-black shadow-[0_0_15px_var(--theme-accent-dim)]' : 'bg-white/5 text-white hover:bg-white/10'}`}
                       >
                         {isPlayingAudio ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                         Play Audio
                       </button>
                   )}
                </div>
            </div>

            {/* Strategic Analysis Output */}
            {executiveSummary && (
                <div className="mb-10 bg-gradient-to-r from-[var(--theme-accent-dim)] to-transparent border border-[var(--theme-accent)]/20 p-6 rounded-2xl animate-in fade-in slide-in-from-top-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-[var(--theme-accent)] pointer-events-none"><Zap size={80} /></div>
                    <div className="flex items-center gap-3 mb-3 text-[var(--theme-accent)]">
                    <BrainCircuit size={18} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{t('strategicAssessment')}</span>
                    </div>
                    <p className="text-sm font-light text-[var(--theme-text)] leading-relaxed max-w-4xl relative z-10">
                    "{executiveSummary}"
                    </p>
                </div>
            )}

            {links.length === 0 ? (
                <div className="py-32 text-center space-y-6 border border-dashed border-white/10 rounded-3xl bg-white/5">
                  <div className="w-16 h-16 bg-[var(--theme-bg)] rounded-2xl flex items-center justify-center mx-auto border border-white/5 shadow-inner">
                    <FileCode size={24} className="text-neutral-600" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white">{t('knowledgeBaseEmpty')}</h3>
                    <p className="text-neutral-500 text-sm">{t('startTracking')}</p>
                  </div>
                </div>
            ) : (
                <>
                {viewMode === 'detailed' ? (
                     <div className="space-y-4 animate-in fade-in">
                        {filteredLinks.map(link => (
                            <div key={link.id} className="group flex flex-col md:flex-row gap-6 p-5 bg-[#0a0a0a]/60 hover:bg-[#0a0a0a] border border-white/5 hover:border-[var(--theme-accent)]/50 rounded-2xl transition-all backdrop-blur-sm">
                                {/* Small Thumbnail */}
                                <div className="md:w-48 h-32 shrink-0 rounded-xl overflow-hidden bg-black/50 border border-white/5 relative">
                                    {link.previewImageUrl ? (
                                        <img src={link.previewImageUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl grayscale opacity-20">{link.iconEmoji}</div>
                                    )}
                                    <div className="absolute top-2 right-2">
                                        <button 
                                          onClick={() => setEditingLink(link)}
                                          className="p-1.5 bg-black/60 rounded-lg text-white/50 hover:text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Edit2 size={12} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col justify-between py-1">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-bold text-[var(--theme-accent)] uppercase tracking-widest bg-[var(--theme-accent-dim)] px-2 py-0.5 rounded">{link.theme}</span>
                                                <span className="text-[10px] text-neutral-600 font-mono">{new URL(link.url).hostname}</span>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                 <button onClick={() => setDeepDiveLink(link)} className="p-2 text-neutral-500 hover:text-[var(--theme-accent)] hover:bg-white/5 rounded-lg transition-colors" title="Deep Dive Analysis"><Globe2 size={16} /></button>
                                                 <div className="relative">
                                                    <button onClick={(e) => { e.stopPropagation(); setActiveCategorizeMenu(activeCategorizeMenu === link.id ? null : link.id); }} className="p-2 text-neutral-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"><FolderSync size={16} /></button>
                                                    {activeCategorizeMenu === link.id && (
                                                        <CategorizeMenu currentTheme={link.theme} themes={customThemes} onSelect={(t) => handleMoveTheme(link.id, t)} onClose={() => setActiveCategorizeMenu(null)} />
                                                    )}
                                                 </div>
                                                 <button onClick={() => setLinks(prev => prev.filter(l => l.id !== link.id))} className="p-2 text-neutral-500 hover:text-red-500 hover:bg-white/5 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[var(--theme-accent)] transition-colors leading-tight">
                                            <a href={link.url} target="_blank" className="hover:underline decoration-[var(--theme-accent)]/50 underline-offset-4">{link.title}</a>
                                        </h3>
                                        
                                        {link.aiSummary ? (
                                            <div className="mb-3 p-3 rounded-xl bg-[var(--theme-accent-dim)] border border-[var(--theme-accent)]/10 animate-in fade-in slide-in-from-top-2 group/summary relative">
                                                <div className="flex items-center justify-between mb-1 text-[var(--theme-accent)]">
                                                    <div className="flex items-center gap-2">
                                                        <Sparkles size={12} />
                                                        <span className="text-[9px] font-bold uppercase tracking-widest">AI Insight</span>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleGenerateSummary(link.id, link.title, link.description)}
                                                        className="opacity-0 group-hover/summary:opacity-100 text-[var(--theme-accent)] hover:text-white transition-all"
                                                        title="Regenerate"
                                                    >
                                                        <RefreshCcw size={12} className={summarizingIds.has(link.id) ? "animate-spin" : ""} />
                                                    </button>
                                                </div>
                                                <p className="text-sm font-medium text-white/90 leading-relaxed">{link.aiSummary}</p>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => handleGenerateSummary(link.id, link.title, link.description)}
                                                className="mb-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-[var(--theme-accent)] text-[10px] font-bold uppercase tracking-widest text-[var(--theme-accent)] hover:text-white transition-all w-fit"
                                            >
                                                {summarizingIds.has(link.id) ? <RefreshCcw size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                                Generate AI Summary
                                            </button>
                                        )}

                                        <p className="text-sm text-neutral-400 leading-relaxed line-clamp-2">{link.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                     </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in">
                        {filteredLinks.map(link => (
                            <div key={link.id} className="group flex flex-col bg-[#0a0a0a]/60 border border-white/5 hover:border-[var(--theme-accent)]/50 rounded-3xl overflow-hidden transition-all hover:shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-sm">
                                <div className="h-40 bg-black relative overflow-hidden">
                                     {link.previewImageUrl ? (
                                        <img src={link.previewImageUrl} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" alt="" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-5xl grayscale opacity-10">{link.iconEmoji}</div>
                                    )}
                                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => setEditingLink(link)} className="p-2 bg-black/60 backdrop-blur-md text-white rounded-xl hover:bg-[var(--theme-accent)] hover:text-black transition-colors"><Edit2 size={14} /></button>
                                    </div>
                                    <div className="absolute bottom-3 left-3">
                                         <img src={link.favicon} className="w-6 h-6 bg-black/50 rounded-full p-0.5" alt="" />
                                    </div>
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="mb-3">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[9px] font-bold text-[var(--theme-accent)] uppercase tracking-widest">{link.theme}</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-white mt-1 leading-tight line-clamp-2 group-hover:text-[var(--theme-accent)] transition-colors">
                                            <a href={link.url} target="_blank">{link.title}</a>
                                        </h3>
                                    </div>

                                    {link.aiSummary ? (
                                        <div className="mb-4 p-3 rounded-xl bg-[var(--theme-accent-dim)] border border-[var(--theme-accent)]/10 animate-in fade-in group/summary relative">
                                            <p className="text-xs font-medium text-white/90 leading-relaxed italic pr-4">"{link.aiSummary}"</p>
                                            <button 
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleGenerateSummary(link.id, link.title, link.description);
                                                }}
                                                className="absolute top-2 right-2 opacity-0 group-hover/summary:opacity-100 text-[var(--theme-accent)] hover:text-white transition-all"
                                                title="Regenerate"
                                            >
                                                <RefreshCcw size={12} className={summarizingIds.has(link.id) ? "animate-spin" : ""} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col flex-1 mb-4">
                                            <p className="text-xs text-neutral-500 line-clamp-3 mb-2">{link.description}</p>
                                            <button 
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleGenerateSummary(link.id, link.title, link.description);
                                                }}
                                                className="mt-auto w-full py-2 flex items-center justify-center gap-2 rounded-lg bg-[var(--theme-accent-dim)] border border-[var(--theme-accent)]/20 text-[var(--theme-accent)] hover:bg-[var(--theme-accent)] hover:text-black transition-all text-[10px] font-bold uppercase tracking-widest"
                                            >
                                                {summarizingIds.has(link.id) ? <RefreshCcw size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                                Generate Summary
                                            </button>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                                        <button onClick={() => setDeepDiveLink(link)} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-colors">
                                            <Globe2 size={12} /> Analysis
                                        </button>
                                        <div className="flex gap-1">
                                             <div className="relative">
                                                <button onClick={(e) => { e.stopPropagation(); setActiveCategorizeMenu(activeCategorizeMenu === link.id ? null : link.id); }} className="p-1.5 text-neutral-600 hover:text-white transition-colors"><FolderSync size={14} /></button>
                                                {activeCategorizeMenu === link.id && (
                                                    <CategorizeMenu currentTheme={link.theme} themes={customThemes} onSelect={(t) => handleMoveTheme(link.id, t)} onClose={() => setActiveCategorizeMenu(null)} />
                                                )}
                                             </div>
                                            <button onClick={() => setLinks(prev => prev.filter(l => l.id !== link.id))} className="p-1.5 text-neutral-600 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                </>
            )}
        </main>
      </div>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
