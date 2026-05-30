import React, { useState, useEffect } from 'react';
import { 
  User, 
  Settings, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Eye, 
  ArrowRight, 
  ArrowLeft, 
  Lock, 
  Camera, 
  Phone, 
  Mail, 
  Check, 
  X, 
  Edit3, 
  MapPin, 
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Package,
  Wrench,
  Sparkles,
  Info,
  Sliders,
  FileText,
  Hexagon,
  Menu,
  LayoutDashboard,
  ShoppingBag,
  LogOut,
  Maximize,
  Sun,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_PARTS, MOCK_SELLERS } from '../services/db';
import { Part, PartCondition, Seller, PARTS_FALLBACK_IMAGE } from '../types';
import SellerSecondaryNav from './SellerSecondaryNav';

interface SellerDashboardProps {
  userEmail: string | null;
  onBackToMarketplace: () => void;
  onSelectPart: (partId: string) => void;
  initialTab?: 'listings' | 'ai_drafts' | 'create' | 'settings' | 'snap';
  initialSnapImages?: string[];
  onSetSellerTab?: (tab: 'listings' | 'create' | 'settings' | 'snap') => void;
  onProfileUpdate?: (profile: any) => void;
  onLogout?: () => void;
}

// Preset gallery of beautiful mock parts images for the seller to choose from
const PHOTO_GALLERY = [
  { id: 'engine', name: 'Engine Bay V8', url: 'https://images.unsplash.com/photo-1551524559-8af4e6624178?auto=format&fit=crop&q=80&w=400' },
  { id: 'carburetor', name: 'OEM Carburetor', url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=400' },
  { id: 'alternator', name: 'Heavy Alternator', url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=400' },
  { id: 'steering_wheel', name: 'Steering Wheel', url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=400' },
  { id: 'springs', name: 'Coil Suspension Springs', url: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&q=80&w=400' },
  { id: 'door_shell', name: 'Vintage Panel Shell', url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=400' },
  { id: 'brakes', name: 'Performance Rotors', url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=400' },
];

const SELLER_ID = 'seller_sandbox';

export default function SellerDashboard({ userEmail, onBackToMarketplace, onSelectPart, initialTab, initialSnapImages, onSetSellerTab, onProfileUpdate, onLogout }: SellerDashboardProps) {
  // 1. Core Profile states, leveraging localStorage for actual persistence
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('parts_peddle_seller_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return {
      name: 'Unnamed Yard',
      email: userEmail || 'registrar@acmeyard.com',
      location: '',
      whatsapp: '',
      phone: '',
      useAccountEmail: true,
      businessEmail: '',
      streetAddress: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
      logoUrl: '',
      verificationStatus: 'unverified'
    };
  });

  // Keep email updated with user registration state
  useEffect(() => {
    if (userEmail && profile.email === 'registrar@acmeyard.com') {
      setProfile(p => ({ ...p, email: userEmail }));
    }
  }, [userEmail]);

  // Synchronize with database and localStorage
  useEffect(() => {
    localStorage.setItem('parts_peddle_seller_profile', JSON.stringify(profile));
    if (onProfileUpdate) {
      onProfileUpdate(profile);
    }

    // Upsert our seller details directly in the exported MOCK_SELLERS database so they integrate perfectly in listing/detail lookups!
    const existingSellerIndex = MOCK_SELLERS.findIndex(s => s.id === SELLER_ID);
    const sellerObject: Seller = {
      id: SELLER_ID,
      name: profile.name || 'Unnamed Yard',
      rating: 4.8,
      reviewCount: 34,
      location: profile.location || 'Location Not Configured',
      specialty: 'Chevy C10 & Truck Specialists',
      partCount: MOCK_PARTS.filter(p => p.sellerId === SELLER_ID).length,
      feedbackPercentage: 98,
      shipsWithin: '1 Business Day',
      returnPolicy: '30-Day Escrow Guardeded'
    };

    if (existingSellerIndex >= 0) {
      MOCK_SELLERS[existingSellerIndex] = sellerObject;
    } else {
      MOCK_SELLERS.push(sellerObject);
    }
  }, [profile]);

  // Check if required fields are satisfied
  const isProfileComplete = () => {
    return Boolean(profile.name && profile.name.trim() !== 'Unnamed Yard' && profile.email && profile.location && profile.location.trim() !== '');
  };

  // Determine completion percentage
  const getProfileCompletionStats = () => {
    let completedSteps = 0;
    const totalSteps = 5;
    const missing: string[] = [];

    if (profile.name && profile.name.trim() !== 'Unnamed Yard') completedSteps++; else missing.push('Business Name');
    if (profile.email) completedSteps++; else missing.push('Verified Email');
    if (profile.location && profile.location.trim() !== '') completedSteps++; else missing.push('Physical Location');
    if (profile.whatsapp) completedSteps++; else missing.push('WhatsApp Contact (Recommended)');
    if (profile.logoUrl) completedSteps++; else missing.push('Yard Logo Upload (Recommended)');

    return {
      percentage: Math.round((completedSteps / totalSteps) * 100),
      missingRequired: missing.filter(m => m !== 'WhatsApp Contact (Recommended)' && m !== 'Yard Logo Upload (Recommended)'),
      missingRecommended: missing.filter(m => m === 'WhatsApp Contact (Recommended)' || m === 'Yard Logo Upload (Recommended)'),
      currentCount: completedSteps,
      totalCount: totalSteps
    };
  };

  const completionStats = getProfileCompletionStats();

  // 2. Active Tab routing
  // 'listings' (main overview) | 'ai_drafts' | 'create' (form) | 'settings' (full edit mode) | 'snap'
  const [activeTab, setActiveTab] = useState<'listings' | 'ai_drafts' | 'create' | 'settings' | 'snap'>(
    initialTab === 'snap' ? 'listings' : (initialTab || 'listings')
  );

  const [expandedItems, setExpandedItems] = useState<string[]>(['dashboard', 'listings']);
  const [selectedSidebarItem, setSelectedSidebarItem] = useState<string>('dashboard');

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(initialTab === 'snap');
  const [uploadedImages, setUploadedImages] = useState<string[]>(initialSnapImages || []);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(false); // Simulated offline state
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [viewfinderStream, setViewfinderStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Manage camera viewfinder
  useEffect(() => {
    const initCamera = async () => {
      // RULE: Only request camera permission after user explicitly taps "Snap with AI" in BottomTabBar
      // which sets the 'parts_peddle_camera_vetted' flag.
      const isVetted = localStorage.getItem('parts_peddle_camera_vetted') === 'true';
      
      if (isAiModalOpen && uploadedImages.length === 0) {
        if (!isVetted) {
          // If we are mounting/loading WITHOUT the explicit user intent flag (e.g. refresh),
          // we do not call getUserMedia. We instead show the gallery fallback immediately.
          setCameraError('Camera check skipped (Page load). Use gallery upload or restart flow.');
          console.log('Skipping spontaneous camera request on mount per session rules.');
          return;
        }

        setCameraError(null);

        try {
          // Attempt 1: Ideal constraints (Rear-facing, 720p)
          let stream;
          try {
            stream = await navigator.mediaDevices.getUserMedia({ 
              video: { 
                facingMode: { ideal: 'environment' }, 
                width: { ideal: 1280 }, 
                height: { ideal: 720 } 
              } 
            });
          } catch (e) {
            // Attempt 2: Minimal constraints (Any available camera)
            console.warn('Ideal camera constraints failed, trying base video access...');
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
          }

          setViewfinderStream(stream);
          // Consume the flag only on success so we don't block retries on failure
          localStorage.removeItem('parts_peddle_camera_vetted');
        } catch (err: any) {
          // Instant fallback: If no camera is found at all, we trigger the gallery UI
          setCameraError('Camera not available — upload from gallery instead');
          setViewfinderStream(null);
        }
      }
    };

    if (isAiModalOpen && !viewfinderStream && uploadedImages.length === 0) {
      initCamera();
    }

    return () => {
      if (viewfinderStream) {
        viewfinderStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isAiModalOpen, uploadedImages.length, viewfinderStream]);

  // Ensure video element receives the stream when it mounts
  useEffect(() => {
    if (viewfinderStream && videoRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = viewfinderStream;
    }
  }, [viewfinderStream, isAiModalOpen, uploadedImages.length]);

  // Clean up when modal closes
  useEffect(() => {
    if (!isAiModalOpen && viewfinderStream) {
      viewfinderStream.getTracks().forEach(track => track.stop());
      setViewfinderStream(null);
    }
  }, [isAiModalOpen]);
  
  // Capture frame from video
  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setUploadedImages(prev => [...prev, dataUrl]);
      }
    }
  };

  // Mock AI result for test
  const [aiResult, setAiResult] = useState<any>(null);
  
  const OfflineModal = () => (
    <div className="fixed inset-0 z-[400] bg-white flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="space-y-6">
        <div className="flex justify-center">
            <div className="w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center">
                <div className="relative">
                    <div className="w-16 h-12 border-4 border-zinc-900 rounded-lg"></div>
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                       <div className="w-20 h-px bg-zinc-900 rotate-45"></div>
                    </div>
                </div>
            </div>
        </div>
        <h3 className="font-display font-black text-2xl text-zinc-900">NO CONNECTION DETECTED</h3>
        <p className="text-sm text-zinc-600">
          Your photos are saved locally. We'll identify the part when you're back in range.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-xs font-bold text-amber-900">Queued for AI: 3 parts</p>
        </div>
        <button 
          onClick={() => setIsOffline(false)}
          className="w-full bg-zinc-900 text-white font-bold py-4 rounded-lg hover:bg-zinc-800 transition-colors"
        >
          CONTINUE OFFLINE
        </button>
      </div>
    </div>
  );

  const ZoomModal = () => (
    <div className="fixed inset-0 z-[300] bg-black flex flex-col items-center justify-center p-4">
      <button onClick={() => setIsZoomOpen(false)} className="absolute top-4 left-4 text-white p-2"><X /></button>
      <div className="absolute top-4 right-4 text-white text-sm"> {selectedPhoto} / 3 </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="relative">
          <div className="bg-zinc-800 w-80 h-80 rounded-lg flex items-center justify-center mb-4">
            <Camera className="w-16 h-16 text-zinc-600" />
          </div>
          {/* Simulated OCR Overlay */}
          <div className="absolute top-1/2 left-1/4 bg-amber-500/30 border border-amber-500 p-2 text-white text-xs font-bold rounded">
            Detected: AC-DELCO 334-2110
          </div>
        </div>
      </div>
      <p className="text-white text-sm mb-4">"Part number visible: '334-2110'"</p>
      <button className="w-full bg-[#B87333] text-white py-4 rounded-lg font-bold">USE AS PRIMARY PHOTO</button>
    </div>
  );

  const AIReviewModal = () => aiResult ? (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" 
      id="ai-review-modal"
    >
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col"
      >
        <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white">
          <button 
            onClick={() => {
              setIsReviewOpen(false);
              setIsAiModalOpen(true);
            }}
            className="text-sm font-bold text-zinc-500 flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Re-scan
          </button>
          <h3 className="font-display font-black uppercase text-sm tracking-widest text-zinc-900">AI RESULTS</h3>
          <button 
            onClick={() => {
              setIsReviewOpen(false);
              setFormFeedback("Draft auto-saved to your AI Drafts queue.");
              setTimeout(() => setFormFeedback(null), 4000);
            }} 
            className="text-zinc-400 hover:text-zinc-600 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <motion.div 
          className="p-5 space-y-5"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          initial="hidden"
          animate="show"
        >
           {/* Low Confidence Warning */}
           {(aiResult.aiConfidence || 1) < 0.6 && (
             <motion.div variants={{ hidden: { scale: 0.95, opacity: 0 }, show: { scale: 1, opacity: 1 } }} className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3.5">
               <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
               <div className="space-y-1">
                 <h5 className="text-xs font-black text-amber-900 uppercase">
                   {aiResult.aiConfidence < 0.4 ? 'AI IS UNCERTAIN' : 'Review Required'}
                 </h5>
                 <p className="text-[10px] text-amber-800/80 leading-relaxed font-sans">
                   {aiResult.aiConfidence < 0.4 
                     ? 'The quality of the input is too low for a positive match. We recommend re-snapping the part or continuing to the manual form for full control.' 
                     : `AI confidence is moderately low (${Math.round(aiResult.aiConfidence * 100)}%). Please verify the suggested OEM part number carefully.`}
                 </p>
               </div>
             </motion.div>
           )}

           {/* Thumbs */}
           <motion.div variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }} className="flex gap-2 pb-2 border-b border-zinc-100">
             {aiResult.images.map((img, i) => (
               <button 
                 key={i} 
                 onClick={() => { setSelectedPhoto(i + 1); setIsZoomOpen(true); }} 
                 className="w-20 h-20 bg-zinc-100 rounded-lg flex items-center justify-center border border-zinc-200 overflow-hidden hover:border-rust-copper transition-colors"
                >
                  <img src={img} className="w-full h-full object-cover" alt={`AI Angle ${i+1}`} />
               </button>
             ))}
           </motion.div>

           {/* Confidence */}
           <motion.div variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }} className="space-y-1">
             <div className="flex justify-between font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                <span>Confidence Score</span>
                <span className="font-display font-black text-rust-copper text-[11px]">{Math.round((aiResult.aiConfidence || 0.87) * 100)}%</span>
             </div>
             <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-rust-copper transition-all duration-1000" 
                  style={{ width: `${Math.round((aiResult.aiConfidence || 0.87) * 100)}%` }}
                ></div>
             </div>
             <p className="text-sm font-bold text-zinc-900 pt-1 leading-tight">
               &ldquo;{aiResult.aiConfidence && aiResult.aiConfidence > 0.8 ? 'Excellent match' : 'Plausible identification'} detected across {aiResult.images.length} angles.&rdquo;
             </p>
           </motion.div>

           {/* Fields */}
           <motion.div variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }} className="space-y-3">
             <div className="flex items-center justify-between px-1">
               <h4 className="font-display font-bold text-xs uppercase text-zinc-400 tracking-wide">AI-SUGGESTED DETAILS</h4>
               <div className="flex items-center gap-1 text-[9px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 uppercase tracking-tighter">
                 <Sparkles className="w-2.5 h-2.5" />
                 AI Suggested
               </div>
             </div>
             
             <div className="relative pl-3 border-l-4 border-rust-copper bg-zinc-50 border-zinc-200 p-3 rounded-r-xl group border-y border-r transition-all hover:bg-zinc-100 cursor-pointer">
                 <label className="text-[10px] font-black uppercase text-zinc-400 block mb-0.5 tracking-tight">Title</label>
                 <div className="font-sans font-bold text-zinc-900 text-sm leading-snug">
                   {aiResult.title}
                 </div>
             </div>

             <div className="relative pl-3 border-l-4 border-rust-copper bg-zinc-50 border-zinc-200 p-3 rounded-r-xl group border-y border-r transition-all hover:bg-zinc-100 cursor-pointer">
                 <label className="text-[10px] font-black uppercase text-zinc-400 block mb-0.5 tracking-tight">Category</label>
                 <div className="flex flex-col">
                   <span className="font-sans font-bold text-zinc-900 text-sm">{aiResult.partType}</span>
                   <span className="text-[10px] text-zinc-500 font-sans italic">{aiResult.system} &rsaquo; {aiResult.category}</span>
                 </div>
             </div>

             <div className="relative pl-3 border-l-4 border-rust-copper bg-zinc-50 border-zinc-200 p-3 rounded-r-xl group border-y border-r transition-all hover:bg-zinc-100 cursor-pointer">
                 <label className="text-[10px] font-black uppercase text-zinc-400 block mb-0.5 tracking-tight">Condition</label>
                 <div className="font-sans font-bold text-zinc-900 text-sm">{aiResult.condition}</div>
             </div>

             <div className="relative pl-3 border-l-4 border-rust-copper bg-zinc-50 border-zinc-200 p-3 rounded-r-xl group border-y border-r transition-all hover:bg-zinc-100 cursor-pointer">
                 <label className="text-[10px] font-black uppercase text-zinc-400 block mb-0.5 tracking-tight">Fitment</label>
                 <div className="font-sans font-bold text-zinc-900 text-sm">
                   {aiResult.fitmentSummary || (previewPart?.compatibility?.[0] ? `${previewPart.compatibility[0].years} ${previewPart.compatibility[0].make} ${previewPart.compatibility[0].model}` : 'Generic Part Fitment')}
                 </div>
             </div>

             <div className="p-4 border rounded-xl bg-zinc-50 border-zinc-200">
               <div className="flex justify-between items-center mb-2">
                 <label className="text-[10px] font-bold uppercase text-zinc-500 font-black">Listing Price</label>
                 <div className="flex items-center gap-1 text-[8px] font-black text-rust-copper bg-rust-copper/5 px-1 rounded border border-rust-copper/20 uppercase tracking-tighter">
                   <Sparkles className="w-2 h-2" />
                   AI suggested
                 </div>
               </div>
               <div className="relative">
                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">$</span>
                 <input 
                   type="number" 
                   defaultValue={aiResult.price}
                   placeholder="Enter your price" 
                   className="w-full bg-white border border-zinc-200 rounded-lg py-2 pl-7 pr-3 text-sm font-bold focus:ring-2 focus:ring-rust-copper/20 outline-hidden" 
                 />
               </div>
             </div>
             
             <label className="flex items-start gap-3 p-3 bg-zinc-50 rounded-lg cursor-pointer hover:bg-zinc-100 transition-colors">
                <input type="checkbox" defaultChecked className="accent-rust-copper w-4 h-4 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-zinc-900">Final Verification</p>
                  <p className="text-[10px] text-zinc-500 font-sans">I confirm these details match the physical component.</p>
                </div>
             </label>
           </motion.div>
        </motion.div>

        <div className="p-5 border-t bg-white sticky bottom-0 space-y-3 z-30">
            <button 
              onClick={() => {
                handleReviewAndPublish(aiResult);
                setIsReviewOpen(false);
              }}
              className="w-full py-4 bg-rust-copper text-steel-black hover:brightness-110 font-display font-black text-sm uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-rust-copper/20 active:scale-[0.98]"
            >
              Use This Draft
            </button>
            
            <button 
              onClick={() => {
                setIsReviewOpen(false);
                setIsAiModalOpen(true);
                setUploadedImages([]);
              }}
              className="w-full py-3 text-zinc-400 hover:text-rust-copper font-display font-black text-[10px] uppercase tracking-[0.2em] transition-all"
            >
              Retake Photo
            </button>
        </div>
        <p className="text-[9px] text-zinc-400 text-center font-mono uppercase italic tracking-tighter mt-3">AI corrections can be made in the full form view.</p>
      </motion.div>
    </motion.div>
  ) : null;

  const [analysisStatus, setAnalysisStatus] = useState("Initializing scan...");
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // Auto-save draft logic (silently updates parts state)
  const saveDraftSilently = () => {
    if (!form.title && uploadedImages.length === 0) return;
    
    const draftId = editingPartId || `draft-${Date.now()}`;
    const newDraft: Part = {
      ...initialForm,
      ...form,
      id: draftId,
      trackingNumber: `PP-${Math.floor(Math.random() * 900000) + 100000}`,
      images: uploadedImages.length > 0 ? uploadedImages : (manualFormPhoto ? [manualFormPhoto] : []),
      sellerId: SELLER_ID,
      isAiDraft: true,
      price: Number(form.price) || 0
    };

    setParts(prev => {
      const idx = prev.findIndex(p => p.id === draftId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = newDraft;
        return updated;
      }
      return [newDraft, ...prev];
    });
    
    if (!editingPartId) setEditingPartId(draftId);
    
    // Show a tiny "Draft saved" toast (we'll implement this in the UI)
  };

  const calculateProgress = () => {
    let filled = 0;
    const requiredFields = [
      uploadedImages.length > 0 || manualFormPhoto,
      form.title,
      form.price,
      form.system,
      form.category,
      form.partType,
      form.condition,
      form.make,
      form.model
    ];
    
    filled = requiredFields.filter(Boolean).length;
    return Math.round((filled / requiredFields.length) * 100);
  };

  const handleNextStep = () => {
    // Basic validation per step
    if (currentStep === 1 && uploadedImages.length === 0 && !manualFormPhoto) {
      // Allow skip if user explicitly wants, but for now we follow the "disabled until" rule
      // unless specified. User said "disabled until at least one photo is uploaded... or skip with link"
      return;
    }
    if (currentStep === 2 && (!form.title || !form.price)) return;
    
    saveDraftSilently();
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Manual Creation Form custom photo select and dynamic pre-fill states
  const [manualFormPhoto, setManualFormPhoto] = useState<string | null>(null);
  const [isManualFormAnalyzing, setIsManualFormAnalyzing] = useState(false);
  const [manualFormStatus, setManualFormStatus] = useState("");
  const [manualFormError, setManualFormError] = useState<string | null>(null);

  // Active review identifier linkage
  const [editingPartId, setEditingPartId] = useState<string | null>(null);

  useEffect(() => {
    if (initialTab) {
      if (initialTab === 'snap') {
        setIsAiModalOpen(true);
        setActiveTab('listings');
        // Reset the parent tab state to allow re-triggering the snap modal
        if (onSetSellerTab) {
          onSetSellerTab('listings');
        }
      } else {
        setActiveTab(initialTab);
      }
    }
  }, [initialTab, onSetSellerTab]);

  // Interactive local states for inline-editing profile fields (Patterns 1 & 2)
  const [inlineFields, setInlineFields] = useState({
    name: profile.name,
    location: profile.location,
    whatsapp: profile.whatsapp,
    email: profile.email
  });
  
  const [editingField, setEditingField] = useState<string | null>(null);

  useEffect(() => {
    setInlineFields({
      name: profile.name,
      location: profile.location,
      whatsapp: profile.whatsapp,
      email: profile.email
    });
  }, [profile]);

  const handleInlineSave = (field: 'name' | 'location' | 'whatsapp' | 'email') => {
    setProfile(p => ({ ...p, [field]: inlineFields[field] }));
    setEditingField(null);
  };

  // 3. Setup core Seller listings with original and custom dynamic items
  const [parts, setParts] = useState<Part[]>(() => {
    // Collect parts belonging to seller_sandbox
    const initialParts = MOCK_PARTS.filter(p => p.sellerId === SELLER_ID);
    
    // If empty sandbox state, initialize with two elegant preloaded items to guide motivation!
    if (initialParts.length === 0) {
      const demoParts: Part[] = [
        {
          id: 'sandbox-1',
          trackingNumber: 'PP-08221975',
          title: '1972 Chevrolet C10 Power Brake Booster',
          subtitle: 'Chevy C10 1967-1972',
          system: 'Brake System',
          category: 'Brake Components',
          partType: 'Brake booster',
          oemPartNumber: 'OEM-GM-48229',
          interchangePartNumbers: ['BENDIX-499'],
          condition: 'Excellent',
          price: 135.00,
          originalPrice: 175.00,
          mileage: 62000,
          fits: 'All C10 Half-Ton Pickups',
          description: 'Factory original power drum vacuum brake booster removed from a garage-kept 1972 half ton. Wiped down and polished. Seal integrity benchmark tested and holds strict vacuum target.',
          images: ['https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=400'],
          sellerId: SELLER_ID,
          compatibility: [
            { make: 'Chevrolet', model: 'C10 Pickup', years: '1967-1972', engine: '5.0L, 5.7L V8' }
          ],
          featured: false
        },
        {
          id: 'sandbox-2',
          trackingNumber: 'PP-08231976',
          title: '1985 Chevy Blazer Front Grill Assembly - Chrome',
          subtitle: 'Chevy K5 / Blazer 1981-1988',
          system: 'Body & Exterior',
          category: 'Doors & Glass',
          partType: 'Grill shell',
          oemPartNumber: 'GM-14030612',
          interchangePartNumbers: [],
          condition: 'OEM Original',
          price: 210.00,
          mileage: 'Unknown',
          fits: 'K5 Blazer, Suburban, C10/C20 Work Trucks',
          description: 'Authentic pristine chrome centerpiece with original golden Chevrolet emblem insert. Zero pitted surfaces. Side tab clips are 100% solid, no plastic fatigue. Saved in indoor dry rack storage.',
          images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=400'],
          sellerId: SELLER_ID,
          compatibility: [
            { make: 'Chevrolet', model: 'K5 Blazer', years: '1981-1988', engine: 'All Engines' }
          ],
          featured: true
        },
        {
          id: 'sandbox-ai-1',
          trackingNumber: 'PP-08242026',
          title: '1987 Chevrolet C10 Alternator Prime',
          subtitle: 'Chevy C10 1981-1987',
          system: 'Electrical System',
          category: 'Charging & Starting',
          partType: 'Alternator',
          oemPartNumber: 'OEM-GM-1100428-AI',
          interchangePartNumbers: [],
          condition: 'Good',
          price: 85.00,
          mileage: 'Unknown',
          fits: 'Fits Chevy C10, GMC K1500, K5 Blazer V8 5.7L SB',
          description: 'Auto-drafted by Snap-to-List on 2026-05-29. High output stator, standard GM 3-pin hookups, spins perfectly without any friction noise.',
          images: ['https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=400'],
          sellerId: SELLER_ID,
          compatibility: [
            { make: 'Chevrolet', model: 'C10 Pickup', years: '1981-1987', engine: '5.7L V8' }
          ],
          featured: false,
          isAiDraft: true
        }
      ];

      // Save demos both locally and inject into global marketplace catalog!
      demoParts.forEach(dp => {
        // Only append if it's not already in there to support hot reloads cleanly
        if (!MOCK_PARTS.some(gp => gp.id === dp.id)) {
          // Initialize demoParts inside our private meta state
          MOCK_PARTS.unshift(dp);
        }
      });

      // Maintain status dictionary in local storage
      const statusDict = JSON.parse(localStorage.getItem('parts_peddle_seller_part_statuses') || '{}');
      if (!statusDict['sandbox-1']) statusDict['sandbox-1'] = 'Draft';
      if (!statusDict['sandbox-2']) statusDict['sandbox-2'] = 'Published';
      if (!statusDict['sandbox-ai-1']) statusDict['sandbox-ai-1'] = 'Draft';
      localStorage.setItem('parts_peddle_seller_part_statuses', JSON.stringify(statusDict));

      return demoParts;
    }
    return initialParts;
  });

  // Track part status dictionaries separately (since Part schema has no status field directly)
  const [partStatuses, setPartStatuses] = useState<Record<string, 'Draft' | 'Pending Verification' | 'Published'>>(() => {
    const saved = localStorage.getItem('parts_peddle_seller_part_statuses');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      'sandbox-1': 'Draft',
      'sandbox-2': 'Published',
      'sandbox-ai-1': 'Draft'
    };
  });

  const sidebarNavItems = [
    { 
      id: 'dashboard', 
      name: 'Dashboard', 
      icon: LayoutDashboard,
      children: [
        { id: 'overview', name: 'Overview' },
        { id: 'analytics', name: 'Analytics' }
      ]
    },
    { id: 'inventory', name: 'Inventory', icon: Package },
    { id: 'orders', name: 'Orders', icon: ShoppingBag },
    { 
      id: 'listings', 
      name: 'Listings', 
      icon: FileText,
      children: [
        { id: 'listings', name: 'Manage Listings' },
        { 
          id: 'ai_drafts', 
          name: 'AI Drafts',
          badge: parts.filter(p => p.isAiDraft).length 
        },
        { id: 'create', name: 'Create Listing' }
      ]
    },
  ];

  // Sync statuses dictionary
  useEffect(() => {
    localStorage.setItem('parts_peddle_seller_part_statuses', JSON.stringify(partStatuses));
  }, [partStatuses]);

  // 4. Listing Form Data State
  const initialForm = {
    title: '',
    system: 'Powertrain',
    category: 'Engine System',
    partType: 'Carburetor',
    oemPartNumber: '',
    condition: 'Excellent' as PartCondition,
    price: '',
    mileage: '',
    fits: 'Chevy C10 / Truck Accessories',
    description: '',
    make: 'Chevrolet',
    model: 'C10 Pickup',
    years: '1981-1987',
    engine: '5.7L V8',
    selectedUrl: PHOTO_GALLERY[1].url // Default carburetor
  };

  const [form, setForm] = useState(initialForm);

  // Dependent dropdown lookup: update category when system updates
  const systemCategories = () => {
    const systemsMap: Record<string, string[]> = {
      'Powertrain': ['Engine System', 'Transmission System', 'Drivetrain'],
      'Suspension & Steering': ['Front Suspension', 'Rear Suspension', 'Steering'],
      'Brake System': ['Brake Components'],
      'Electrical System': ['Charging & Starting', 'Electronics'],
      'Body & Exterior': ['Doors & Glass'],
      'Interior': ['Dashboard & Controls']
    };
    return systemsMap[form.system] || [];
  };

  // Populate dynamic default category
  useEffect(() => {
    const cats = systemCategories();
    if (cats.length > 0 && !cats.includes(form.category)) {
      setForm(prev => ({ ...prev, category: cats[0] }));
    }
  }, [form.system]);

  // Dependent type items
  const categoryTypes = () => {
    const typesMap: Record<string, string[]> = {
      'Engine System': ['Cylinder Head', 'Carburetor', 'Intake Manifold'],
      'Transmission System': ['Transmission'],
      'Drivetrain': ['Rear Axle Housing'],
      'Front Suspension': ['Suspension Springs', 'Struts'],
      'Rear Suspension': ['Leaf Spring'],
      'Steering': ['Steering Wheel', 'Power Steering Pump', 'Steering Gear Box'],
      'Brake Components': ['Brake Caliper', 'Brake Rotors', 'Master Cylinder'],
      'Charging & Starting': ['Alternator'],
      'Electronics': ['Ignition Box'],
      'Doors & Glass': ['Door Shell'],
      'Dashboard & Controls': ['Dashboard', 'Gauge Cluster', 'Radio', 'Switches', 'Steering Wheel']
    };
    return typesMap[form.category] || ['Vintage Component'];
  };

  useEffect(() => {
    const pts = categoryTypes();
    if (pts.length > 0 && !pts.includes(form.partType)) {
      setForm(prev => ({ ...prev, partType: pts[0] }));
    }
  }, [form.category]);

  // Form notifications
  const [formFeedback, setFormFeedback] = useState<string | null>(null);

  // 5. Publish Gate States
  const [showGate, setShowGate] = useState(false);
  const [gatedPart, setGatedPart] = useState<Part | null>(null);

  // 6. Preview State ("Buyer Preview" Modal)
  const [previewPart, setPreviewPart] = useState<Part | null>(null);

  // 7. Core Action Functions


  // File Upload Handlers (Usability Pattern: Drag-and-drop & Manual select)
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    // Limit to 5 images
    const filesToProcess = files.slice(0, 5);
    const newImages: string[] = [];

    filesToProcess.forEach(file => {
      const f = file as File;
      if (f.size > 12 * 1024 * 1024) {
        setAnalysisError("Some images were too large. Max size allowed is 12MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImages(prev => [...prev, reader.result as string].slice(0, 5));
        setAnalysisError(null);
      };
      reader.onerror = () => {
        setAnalysisError("Failed to convert image binary into base-64 string.");
      };
      reader.readAsDataURL(f);
    });
  };

  const handleDropImage = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length === 0) return;

    const filesToProcess = files.slice(0, 5);

    filesToProcess.forEach(file => {
      const f = file as File;
      if (f.size > 12 * 1024 * 1024) {
        setAnalysisError("Some images were too large. Max size allowed is 12MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImages(prev => [...prev, reader.result as string].slice(0, 5));
        setAnalysisError(null);
      };
      reader.onerror = () => {
        setAnalysisError("Failed to parse dropped image.");
      };
      reader.readAsDataURL(f);
    });
  };

  const handleIdentifyWithAi = async () => {
    if (isOffline) {
        setIsAnalyzing(false);
        return;
    }
    if (uploadedImages.length === 0) {
      setAnalysisError("Please select or drop at least one photo of the part first.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisStatus("Initializing Gemini 3.5 connection...");
    setAnalysisProgress(0);

    const messages = [
      "Establishing link with Gemini Vision API...",
      "Analyzing component shape and design characteristics...",
      "Detecting mechanical wearing signatures & text stamp markings...",
      "Consulting OEM salvage specifications data schema...",
      "Cross-referencing compatible auto making registries...",
      "Estimating recommended salvage listing price...",
      "Extrapolating exact fitment years and engines...",
      "Drafting professional marketplace summaries...",
      "Finalizing responsive draft form variables..."
    ];

    let msgIndex = 0;
    const msgInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % messages.length;
      setAnalysisStatus(messages[msgIndex]);
      
      // Simulate progress based on number of images
      setAnalysisProgress(prev => {
        const next = prev + (1 / uploadedImages.length) * 20;
        return next > 95 ? 95 : next;
      });
    }, 2000);

    try {
      const response = await fetch("/api/gemini/identify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ images: uploadedImages }),
      });

      clearInterval(msgInterval);

      if (!response.ok) {
        let errMsg = "AI Photo identification has failed.";
        try {
          const errData = await response.json();
          errMsg = errData.error || errMsg;
        } catch (_) {}
        throw new Error(errMsg);
      }

      const parsedResult = await response.json();

      // Successfully generated!
      const tracking = `PP-${Math.floor(10000000 + Math.random() * 90000000)}`;
      const newAiDraftPart: Part = {
        id: `ai-${Date.now()}`,
        trackingNumber: tracking,
        title: parsedResult.suggested_title || parsedResult.title || `${parsedResult.years} ${parsedResult.make} ${parsedResult.model} ${parsedResult.part_type || parsedResult.partType}`,
        subtitle: `${parsedResult.make} ${parsedResult.model} ${parsedResult.years}`,
        system: parsedResult.system || 'Powertrain',
        category: parsedResult.subassembly || parsedResult.subsystem || parsedResult.category || 'Engine System',
        partType: parsedResult.part_type || parsedResult.partType || 'Carburetor',
        oemPartNumber: parsedResult.visible_part_number || parsedResult.oemPartNumber || `OEM-${Math.floor(10000 + Math.random() * 90000)}`,
        interchangePartNumbers: parsedResult.interchangePartNumbers || [],
        condition: (parsedResult.condition || 'Good') as PartCondition,
        price: Array.isArray(parsedResult.estimated_price_range) ? parsedResult.estimated_price_range[0] : (parseFloat(parsedResult.price) || 85.00),
        mileage: parsedResult.mileage || 'Unknown',
        fits: parsedResult.fitment_notes || parsedResult.fits || 'General fitment specifications',
        description: parsedResult.suggested_description || parsedResult.description || 'Auto-vetted in yard via automated visual search node.',
        images: uploadedImages,
        sellerId: SELLER_ID,
        compatibility: [
          { 
            make: parsedResult.make || 'Chevrolet', 
            model: parsedResult.model || 'C10 Pickup', 
            years: parsedResult.years || '1981-1987', 
            engine: parsedResult.engine || '5.7L V8' 
          }
        ],
        featured: false,
        isAiDraft: true,
        aiConfidence: parsedResult.confidence_score || parsedResult.aiConfidence || 0.85,
        aiPriceRange: Array.isArray(parsedResult.estimated_price_range) ? [parsedResult.estimated_price_range[0], parsedResult.estimated_price_range[1]] : undefined,
        aiFitmentNotes: parsedResult.fitment_notes,
        aiSuggestedDescription: parsedResult.suggested_description
      };

      // Add to MOCK_PARTS and local state parts
      MOCK_PARTS.unshift(newAiDraftPart);
      setParts(prev => [newAiDraftPart, ...prev]);

      // Map status
      setPartStatuses(prev => ({ ...prev, [newAiDraftPart.id]: 'Draft' }));

      setIsAnalyzing(false);
      setUploadedImages([]);
      setIsAiModalOpen(false);
      setAiResult(newAiDraftPart);
      setIsReviewOpen(true);
      
      // Persistence confirmation
      setFormFeedback(`AI Identification Complete. Draft auto-saved for "${newAiDraftPart.title}".`);
      setTimeout(() => setFormFeedback(null), 5000);

      setActiveTab('ai_drafts');

      // Scroll to top cleanly
      setTimeout(() => {
        const rootEl = document.getElementById('seller-dashboard-root');
        if (rootEl) rootEl.scrollIntoView({ behavior: 'smooth' });
      }, 300);

    } catch (e: any) {
      clearInterval(msgInterval);
      console.error("AI Scan Error:", e);
      setAnalysisError(e.message || "Failed to contact Gemini engine.");
      setIsAnalyzing(false);
    }
  };

  const [manualFormDragging, setManualFormDragging] = useState(false);

  const handleManualFormPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setManualFormError("Image is too large. Max size allowed is 5MB.");
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setManualFormError("Invalid file type. Only JPEG, PNG, and WEBP supported.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setManualFormPhoto(reader.result as string);
      setForm(p => ({ ...p, selectedUrl: reader.result as string }));
      setManualFormError(null);
    };
    reader.onerror = () => {
      setManualFormError("Failed to convert image binary.");
    };
    reader.readAsDataURL(file);
  };

  const handleManualFormDropImage = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setManualFormDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.size > 12 * 1024 * 1024) {
      setManualFormError("Image is too large. Max size allowed is 12MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setManualFormPhoto(reader.result as string);
      setForm(p => ({ ...p, selectedUrl: reader.result as string }));
      setManualFormError(null);
    };
    reader.onerror = () => {
      setManualFormError("Failed to convert image binary.");
    };
    reader.readAsDataURL(file);
  };

  const handleIdentifyManualFormWithAi = async () => {
    if (!manualFormPhoto) {
      setManualFormError("Please upload or drop a photo of the part first.");
      return;
    }

    setIsManualFormAnalyzing(true);
    setManualFormError(null);
    setManualFormStatus("Consulting Gemini 3.5 model specs...");

    const messages = [
      "Analyzing component shape and design characteristics...",
      "Cross-referencing compatible auto making registries...",
      "Estimating recommended salvage listing price...",
      "Extrapolating exact fitment years and engines...",
      "Finalizing responsive draft form variables..."
    ];

    let msgIndex = 0;
    const msgInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % messages.length;
      setManualFormStatus(messages[msgIndex]);
    }, 2000);

    try {
      const response = await fetch("/api/gemini/identify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: manualFormPhoto }),
      });

      clearInterval(msgInterval);

      if (!response.ok) {
        let errMsg = "AI Photo identification has failed.";
        try {
          const errData = await response.json();
          errMsg = errData.error || errMsg;
        } catch (_) {}
        throw new Error(errMsg);
      }

      const parsedResult = await response.json();

      setForm({
        title: parsedResult.title || '',
        system: parsedResult.system || 'Powertrain',
        category: parsedResult.category || 'Engine System',
        partType: parsedResult.partType || 'Carburetor',
        oemPartNumber: parsedResult.oemPartNumber || '',
        condition: (parsedResult.condition || 'Good') as PartCondition,
        price: String(parsedResult.price || ''),
        mileage: String(parsedResult.mileage || 'Unknown'),
        fits: parsedResult.fits || '',
        description: parsedResult.description || '',
        make: parsedResult.make || '',
        model: parsedResult.model || '',
        years: parsedResult.years || '',
        engine: parsedResult.engine || '',
        selectedUrl: manualFormPhoto
      });

      setIsManualFormAnalyzing(false);
      
      // Flash temporary feedback
      setFormFeedback(`AI Identification Complete! Backfilled specifications for "${parsedResult.title}".`);
      setTimeout(() => setFormFeedback(null), 4000);

    } catch (e: any) {
      clearInterval(msgInterval);
      console.error("Manual Form AI Error:", e);
      setManualFormError(e.message || "Failed to contact Gemini 3.5 engine.");
      setIsManualFormAnalyzing(false);
    }
  };

  // Helper to build a validated `Part` object from form inputs
  const createPartObject = (forceId?: string): Part => {
    const tracking = `PP-${Math.floor(10000000 + Math.random() * 90000000)}`;
    return {
      id: forceId || `custom-${Date.now()}`,
      trackingNumber: tracking,
      title: form.title || `${form.years} ${form.make} ${form.model} ${form.partType}`,
      subtitle: `${form.make} ${form.model} ${form.years}`,
      system: form.system,
      category: form.category,
      partType: form.partType,
      oemPartNumber: form.oemPartNumber || `OEM-${Math.floor(10000 + Math.random() * 90000)}`,
      interchangePartNumbers: [],
      condition: form.condition,
      price: parseFloat(form.price) || 0,
      mileage: form.mileage ? (isNaN(Number(form.mileage)) ? form.mileage : Number(form.mileage)) : 'Unknown',
      fits: form.fits,
      description: form.description || `Excellent OEM ${form.partType} carefully disassembled and vetted. Ready for high restoration projects.`,
      images: [form.selectedUrl],
      sellerId: SELLER_ID,
      compatibility: [
        { make: form.make, model: form.model, years: form.years, engine: form.engine }
      ],
      featured: false
    };
  };

  // Free drafting helper
  const handleSaveDraft = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.title) {
      setFormFeedback('Please enter at least a Listing Title to save a draft.');
      return;
    }

    if (editingPartId) {
      const payload = {
        ...createPartObject(editingPartId),
        isAiDraft: false
      };

      const idx = MOCK_PARTS.findIndex(p => p.id === editingPartId);
      if (idx !== -1) {
        MOCK_PARTS[idx] = payload;
      } else {
        MOCK_PARTS.unshift(payload);
      }

      setParts(prev => prev.map(p => p.id === editingPartId ? payload : p));
      setPartStatuses(prev => ({ ...prev, [editingPartId]: 'Draft' }));
      setEditingPartId(null);
      setManualFormPhoto(null);
      setFormFeedback('Draft successfully reviewed and updated!');
      setForm(initialForm);

      setTimeout(() => {
        setActiveTab('listings');
        setFormFeedback(null);
      }, 1500);
      return;
    }

    const payload = createPartObject();
    
    // Save draft status
    setPartStatuses(prev => ({ ...prev, [payload.id]: 'Draft' }));

    // Inject inside global and local listings
    MOCK_PARTS.unshift(payload);
    setParts(prev => [payload, ...prev]);

    setFormFeedback('Draft saved successfully! You can access this anytime under your Listings tab.');
    setForm(initialForm);
    setManualFormPhoto(null);
    
    setTimeout(() => {
      setActiveTab('listings');
      setFormFeedback(null);
    }, 1500);
  };

  // General publication router initiating the soft publish gate
  const handlePublishListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.price) {
      setFormFeedback('Listing Title and Price are required for marketplace listing.');
      return;
    }

    if (editingPartId) {
      const payload = {
        ...createPartObject(editingPartId),
        isAiDraft: false
      };

      const idx = MOCK_PARTS.findIndex(p => p.id === editingPartId);
      if (idx !== -1) {
        MOCK_PARTS[idx] = payload;
      } else {
        MOCK_PARTS.unshift(payload);
      }

      setParts(prev => prev.map(p => p.id === editingPartId ? payload : p));
      setEditingPartId(null);
      setManualFormPhoto(null);

      if (!isProfileComplete()) {
        setGatedPart(payload);
        setShowGate(true);
      } else {
        publishDirectly(payload);
      }
      return;
    }

    const payload = createPartObject();

    if (!isProfileComplete()) {
      // Set gated part and render visual gate Option A
      setGatedPart(payload);
      setShowGate(true);
    } else {
      // Register directly to Pending Verification (Simulate soft approval engine 3s back-check)
      publishDirectly(payload);
    }
  };

  const publishDirectly = (partObj: Part) => {
    setPartStatuses(prev => ({ ...prev, [partObj.id]: 'Pending Verification' }));

    // Inject if doesn't exist
    if (!MOCK_PARTS.some(p => p.id === partObj.id)) {
      MOCK_PARTS.unshift(partObj);
      setParts(prev => [partObj, ...prev]);
    } else {
      setParts(prev => prev.map(p => p.id === partObj.id ? partObj : p));
    }

    setFormFeedback('Success! Listing submitted to the Marketplace queue.');
    setForm(initialForm);

    // Auto-escalator simulation to auto-verified after 5 seconds to showcase "Live" transition!
    setTimeout(() => {
      setPartStatuses(prev => {
        if (prev[partObj.id] === 'Pending Verification') {
          return { ...prev, [partObj.id]: 'Published' };
        }
        return prev;
      });
    }, 5000);

    setActiveTab('listings');
    setTimeout(() => setFormFeedback(null), 3000);
  };

  // Handles clicking check-publish from a listing in the dashboard list
  const triggerPublishForExistingPart = (partObj: Part) => {
    if (!isProfileComplete()) {
      setGatedPart(partObj);
      setShowGate(true);
    } else {
      publishDirectly(partObj);
    }
  };

  const handleReviewAndPublish = (draft: Part) => {
    // Prefill form
    setForm({
      title: draft.title,
      system: draft.system,
      category: draft.category,
      partType: draft.partType,
      oemPartNumber: draft.oemPartNumber,
      condition: draft.condition,
      price: String(draft.price || ''),
      mileage: String(draft.mileage || ''),
      fits: draft.fits,
      description: draft.aiSuggestedDescription || draft.description,
      make: draft.compatibility[0]?.make || 'Chevrolet',
      model: draft.compatibility[0]?.model || 'C10 Pickup',
      years: draft.compatibility[0]?.years || '1981-1987',
      engine: draft.compatibility[0]?.engine || '5.7L V8',
      selectedUrl: draft.images[0] || PHOTO_GALLERY[1].url
    });
    setEditingPartId(draft.id);
    if (draft.images.length > 0) {
      setUploadedImages(draft.images);
      setManualFormPhoto(draft.images[0]);
    } else {
      setUploadedImages([]);
      setManualFormPhoto(null);
    }
    setCurrentStep(5); // Jump directly to Review & Publish
    setActiveTab('create');
  };

  // Auto-save confirm if navigating away from review
  useEffect(() => {
    if (isReviewOpen && activeTab !== 'listings' && activeTab !== 'ai_drafts') {
      setIsReviewOpen(false);
      setFormFeedback("Gemini draft successfully auto-saved to your queue.");
      setTimeout(() => setFormFeedback(null), 4000);
    }
  }, [activeTab, isReviewOpen]);

  // Combined Complete and Publish trigger within Option A Modal Gate
  const handleCompleteGateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineFields.name || !inlineFields.email || !inlineFields.location) {
      alert('Must fill out required fields: Yard Name, Yard Email, and Yard Location.');
      return;
    }

    // Save profile change
    setProfile({
      name: inlineFields.name,
      email: inlineFields.email,
      location: inlineFields.location,
      whatsapp: inlineFields.whatsapp,
      logoUrl: profile.logoUrl,
      verificationStatus: 'verified' // transition to verified seller!
    });

    if (gatedPart) {
      publishDirectly(gatedPart);
      setGatedPart(null);
    }

    setShowGate(false);
  };

  // Preview listing trigger
  const handleOpenPreview = () => {
    if (!form.title) {
      alert('Fill listing details first to preview Buyer Layout.');
      return;
    }
    const payload = createPartObject();
    setPreviewPart(payload);
  };

  // Delete handler
  const handleDeleteListing = (partId: string) => {
    if (confirm('Permanently remove this listing draft?')) {
      // Clear from state
      setParts(prev => prev.filter(p => p.id !== partId));
      
      // Clear from database MOCK_PARTS
      const idx = MOCK_PARTS.findIndex(p => p.id === partId);
      if (idx >= 0) {
        MOCK_PARTS.splice(idx, 1);
      }

      // Cleanup status diction
      setPartStatuses(prev => {
        const copy = { ...prev };
        delete copy[partId];
        return copy;
      });
    }
  };

  // Pre-filter parts array by major Tab (Manage Listings vs AI Drafts)
  const activeTabParts = parts.filter(p => {
    if (activeTab === 'ai_drafts') return !!p.isAiDraft;
    return !p.isAiDraft;
  });

  // Tab Filtering numbers helper
  const getStatusCount = (status: 'All' | 'Draft' | 'Pending Verification' | 'Published') => {
    if (status === 'All') return activeTabParts.length;
    return activeTabParts.filter(p => partStatuses[p.id] === status).length;
  };

  const [listingsFilter, setListingsFilter] = useState<'All' | 'Draft' | 'Pending Verification' | 'Published'>('All');

  const filteredParts = activeTabParts.filter(p => {
    if (listingsFilter === 'All') return true;
    return partStatuses[p.id] === listingsFilter;
  });

  return (
    <div className="bg-[#FAF8F5] min-h-screen font-sans flex flex-col md:flex-row relative" id="seller-dashboard-root">
      
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-steel-black text-base-cream border-b border-oil-dark w-full select-none shrink-0">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1 hover:bg-charcoal rounded text-white cursor-pointer"
          >
            <Menu className="w-5 h-5 text-rust-copper" />
          </button>
          <span className="font-display font-bold text-warm-sand tracking-wider text-xs uppercase">Salvage Yard Desk</span>
        </div>
        <button 
          onClick={onBackToMarketplace}
          className="text-xs uppercase font-mono tracking-wider text-rust-copper font-bold"
        >
          Buyer View &rarr;
        </button>
      </div>

      {/* Sidebar navigation underneath global nav (64px / top-16) on desktop, full height and wide on mobile */}
      <div className={`
        fixed inset-y-0 left-0 bg-charcoal text-base-cream border-r border-oil-dark w-full min-[480px]:w-[85vw] md:w-[280px] z-[250] flex flex-col transition-transform duration-300
        md:sticky md:top-16 md:h-[calc(100vh-64px)] md:flex md:translate-x-0
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `} id="seller-sidebar-nav">
        {/* Top compact profile segment */}
        <div className="p-4 border-b border-oil-dark flex items-center gap-3 relative">
          <div className="relative group w-10 h-10 rounded-lg overflow-hidden border border-oil-dark bg-steel-black flex items-center justify-center shrink-0">
            {profile.logoUrl ? (
              <img src={profile.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-lg" />
            ) : (
              <span className="text-warm-sand font-display font-black text-lg">P</span>
            )}
            {/* Tiny camera edit action */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                const url = prompt('Enter a direct URL of your logo photo:', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150');
                if (url) {
                  setProfile(p => ({ ...p, logoUrl: url }));
                }
              }}
              className="absolute inset-0 bg-rust-copper/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer duration-150"
              title="Upload Logo"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col min-w-0 flex-1 animate-fade-in">
            <div className="flex items-center gap-1 text-white">
              <span className="font-sans font-bold text-sm truncate max-w-[150px]">
                {profile.name && profile.name.trim() !== 'Unnamed Yard' ? profile.name : 'Your Profile'}
              </span>
              <button 
                onClick={() => {
                  const val = prompt('Enter your business yard name:', profile.name);
                  if (val) setProfile(prev => ({ ...prev, name: val }));
                }}
                className="text-warm-gray hover:text-warm-sand transition-colors cursor-pointer"
                title="Edit business name"
              >
                <Edit3 className="w-3 h-3 text-warm-gray" />
              </button>
            </div>
            <span className="text-[10px] text-warm-gray font-mono block truncate">
              {parts.length} active parts • {completionStats.percentage}% ready
            </span>
          </div>
        </div>

        {/* Middle Navigation Section */}
        <div className="py-4 flex-1 space-y-1 overflow-y-auto select-none">
          {sidebarNavItems.map((item) => {
            const isParentActive = selectedSidebarItem === item.id;
            const isExpanded = expandedItems.includes(item.id);
            const hasChildren = item.children && item.children.length > 0;

            return (
              <div key={item.id}>
                <button
                  onClick={() => {
                    if (hasChildren) {
                        setExpandedItems(prev => prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id]);
                        if (!hasChildren) setSelectedSidebarItem(item.id as any);
                    } else {
                        setSelectedSidebarItem(item.id as any);
                        setMobileSidebarOpen(false);
                        setEditingField(null);
                        if (item.id === 'orders') {
                          alert('Orders Queue: No escrow transaction requests are pending. Real-time direct buyers\' purchases will appear here instantly.');
                        } else {
                          setActiveTab('listings');
                        }
                    }
                  }}
                  className={`w-full flex items-center justify-between py-2.5 px-4 font-display text-sm tracking-wider border-l-2 transition-all text-left cursor-pointer ${
                    isParentActive 
                      ? 'border-rust-copper text-rust-copper font-bold bg-[#B87333]/5' 
                      : 'border-transparent text-warm-gray hover:text-base-cream hover:bg-steel-black/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-4 h-4 ${isParentActive ? 'text-rust-copper' : 'text-warm-gray'}`} />
                    <span>{item.name}</span>
                  </div>
                  {hasChildren && (
                    <ChevronRight className={`w-4 h-4 text-warm-gray transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  )}
                </button>

                {hasChildren && isExpanded && (
                  <div className="bg-steel-black/30">
                    {item.children!.map(child => {
                      const isChildActive = activeTab === child.id;
                      return (
                        <button
                          key={child.id}
                          onClick={() => {
                            setActiveTab(child.id as any);
                            setSelectedSidebarItem(item.id as any);
                            setMobileSidebarOpen(false);
                            setEditingField(null);
                          }}
                          className={`w-full py-2 pl-12 pr-4 text-xs tracking-wider text-left transition-all cursor-pointer border-l-2 flex items-center justify-between ${
                            isChildActive
                              ? 'border-rust-copper text-rust-copper font-bold'
                              : 'border-transparent text-warm-gray hover:text-base-cream'
                          }`}
                        >
                          <span>{child.name}</span>
                          {(child as any).badge > 0 && (
                            <span className="bg-rust-copper text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                              {(child as any).badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom utility section */}
        <div className="p-4 border-t border-oil-dark space-y-2 select-none">
          <button 
            onClick={() => {
              setActiveTab('settings');
              setSelectedSidebarItem('dashboard'); 
              setMobileSidebarOpen(false);
            }} 
            className="block w-full text-left text-xs text-warm-gray hover:text-base-cream transition-colors cursor-pointer"
          >
            Settings
          </button>
          <button 
            onClick={() => alert('Support dispatch sent. A regional salvage registry coordinator will contact you shortly.')} 
            className="block w-full text-left text-xs text-warm-gray hover:text-base-cream transition-colors cursor-pointer"
          >
            Support Center
          </button>
          <button 
            onClick={onBackToMarketplace} 
            className="block w-full text-left text-xs text-warm-gray hover:text-base-cream transition-colors cursor-pointer"
          >
            Switch to Buyer View &larr;
          </button>
          {onLogout && (
            <button 
              onClick={() => {
                if (confirm('Are you sure you want to log out of Salvage Desk?')) {
                  onLogout();
                }
              }} 
              className="block w-full text-left text-xs text-rose-400 hover:text-rose-300 transition-colors cursor-pointer pt-1"
            >
              Log Out
            </button>
          )}
        </div>
      </div>

      {/* Backdrop for mobile active menu overlay */}
      {mobileSidebarOpen && (
        <div 
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-steel-black/90 backdrop-blur-sm z-[240] md:hidden animate-fade-in"
        />
      )}

      {/* Floating close button in top-right of the screen on mobile, outside the sidebar */}
      {mobileSidebarOpen && (
        <button 
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed top-4 right-4 z-[260] p-2.5 bg-charcoal text-base-cream rounded-full border border-oil-dark md:hidden hover:bg-steel-black transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-rust-copper/30 animate-fade-in"
          title="Close Menu"
        >
          <X className="w-5 h-5 text-rust-copper" />
        </button>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 p-4 md:p-8 space-y-6 overflow-y-auto">
        
        {/* Navigation Breadcrumb Indicator */}
        <div className="flex items-center justify-between border-b border-[#EADECE]/80 pb-4 select-none">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="hover:text-zinc-800 cursor-pointer transition-colors" onClick={onBackToMarketplace}>PartsPeddle Marketplace</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-bold text-[#5C2314] uppercase tracking-wide">Salvage Yard Portal</span>
          </div>

          <button 
            onClick={onBackToMarketplace}
            className="text-xs font-bold text-zinc-500 hover:text-[#5C2314] transition-colors flex items-center gap-1 cursor-pointer"
          >
            &larr; Switch to Buyer View
          </button>
        </div>

        {/* Dynamic Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EADECE]/50 pb-4 select-none">
          <div>
            <h1 className="font-display font-black text-2xl text-[#1E1E1E] uppercase tracking-tight">
              {activeTab === 'listings' && "Dashboard & Inventory"}
              {activeTab === 'ai_drafts' && "AI Drafts Queue"}
              {activeTab === 'create' && "Create New Listing"}
              {activeTab === 'settings' && "Yard Profile Settings"}
            </h1>
            <p className="text-xs text-zinc-500 font-mono mt-1">
              {activeTab === 'listings' && "Monitor active inventory, buyer messages, and live parts search visibility."}
              {activeTab === 'ai_drafts' && "Review and vet parts automatically processed from photographs via Gemini."}
              {activeTab === 'create' && "Add, detail, and list auto salvage parts manually or generate using computer vision."}
              {activeTab === 'settings' && "Manage your salvage yard coordinates, contact detail, and logo configuration."}
            </p>
          </div>
          
          {activeTab !== 'create' && (
            <div className="relative flex shrink-0 self-start sm:self-auto">
              <button
                onClick={() => setActiveTab('create')}
                className="bg-rust-copper text-white hover:bg-zinc-800 font-sans font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-l-lg flex items-center gap-1.5 transition-all shadow cursor-pointer border-r border-white/20"
                id="btn-desktop-create-listing"
              >
                <Plus className="w-4 h-4" />
                <span>Create Listing</span>
              </button>
              <button
                onClick={() => setIsCreateDropdownOpen(!isCreateDropdownOpen)}
                className="bg-rust-copper text-white hover:bg-zinc-800 px-2 rounded-r-lg flex items-center justify-center transition-all shadow cursor-pointer"
                id="btn-desktop-create-dropdown"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${isCreateDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
              </button>

              <AnimatePresence>
                {isCreateDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsCreateDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full right-0 mt-2 w-64 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                      <button
                        onClick={() => {
                          setActiveTab('create');
                          setIsCreateDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-zinc-50 flex items-center gap-4 transition-colors group"
                      >
                        <div className="p-2 bg-zinc-100 text-zinc-500 rounded-lg group-hover:bg-zinc-200 group-hover:text-rust-copper transition-colors">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-zinc-900 group-hover:text-rust-copper">Create Manually</p>
                          <p className="text-[10px] text-zinc-500 font-sans">Full control, all fields</p>
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          setIsAiModalOpen(true);
                          setIsCreateDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-4 hover:bg-zinc-50 flex items-center gap-4 transition-colors group border-t border-zinc-100"
                      >
                        <div className="p-2 bg-rust-copper/10 text-rust-copper rounded-lg group-hover:bg-rust-copper/20 transition-colors">
                          <Camera className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-zinc-900 group-hover:text-rust-copper">Upload Photos for AI ID</p>
                            <Sparkles className="w-3 h-3 text-rust-copper" />
                          </div>
                          <p className="text-[10px] text-zinc-500 font-sans">Identify parts instantly with Gemini</p>
                        </div>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Ambient progress checklist banner directly below Header (Settings nudge Pattern 3) */}
        {!isProfileComplete() && (
          <div className="bg-amber-100/40 border border-amber-300/65 rounded-md p-4 text-left font-sans">
            <h4 className="text-xs uppercase font-mono tracking-wider text-amber-800 font-black mb-2 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              PORTAL CONFIGURATION CHECKLIST ({completionStats.currentCount}/{completionStats.totalCount} STEPS COMPLETION)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5 pt-1.5 text-xs">
              <div className="flex items-center gap-2 bg-white/70 p-2 rounded border border-zinc-200">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 stroke-[2.2]" />
                <span className="text-zinc-500 line-through">Verified email account</span>
              </div>
              <div className="flex items-center gap-2 bg-white/70 p-2 rounded border border-zinc-200">
                {profile.name && profile.name !== 'Unnamed Yard' ? (
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 stroke-[2.2]" />
                ) : (
                  <div className="w-4.5 h-4.5 rounded-full border-2 border-zinc-300 flex-shrink-0" />
                )}
                <span className={profile.name && profile.name !== 'Unnamed Yard' ? 'text-zinc-500 line-through' : 'text-zinc-700 font-bold'}>
                  Yard Business Name
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/70 p-2 rounded border border-zinc-200">
                {profile.location ? (
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 stroke-[2.2]" />
                ) : (
                  <div className="w-4.5 h-4.5 rounded-full border-2 border-zinc-300 flex-shrink-0" />
                )}
                <span className={profile.location ? 'text-zinc-500 line-through' : 'text-zinc-700 font-bold'}>
                  Yard Physical Address
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/70 p-2 rounded border border-zinc-200">
                {profile.whatsapp ? (
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 stroke-[2.2]" />
                ) : (
                  <div className="w-4.5 h-4.5 rounded-full border border-dashed border-zinc-350 flex-shrink-0" />
                )}
                <span className={`text-zinc-500 ${profile.whatsapp ? 'line-through' : ''}`}>
                  WhatsApp Contact (Opt)
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/70 p-2 rounded border border-zinc-200">
                {profile.logoUrl ? (
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 stroke-[2.2]" />
                ) : (
                  <div className="w-4.5 h-4.5 rounded-full border border-dashed border-zinc-350 flex-shrink-0" />
                )}
                <span className={`text-zinc-500 ${profile.logoUrl ? 'line-through' : ''}`}>
                  Yard Logo Upload (Opt)
                </span>
              </div>
            </div>
            
            <div className="mt-2 text-[11px] text-amber-800/80 font-mono flex items-center justify-between">
              <span>* Notice: Business Name and Location are required to set your listings &quot;Live&quot; on search.</span>
              <button onClick={() => setActiveTab('settings')} className="underline font-bold hover:text-[#5C2314] transition-all">Configure Profile Details &rarr;</button>
            </div>
          </div>
        )}

        {/* Form state / success toast feedback */}
        {formFeedback && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-md text-xs font-semibold flex items-center gap-2.5 animate-scale-up text-left">
            <CheckCircle2 className="w-5 h-5 text-[#7A8B6F] stroke-[2.3] flex-shrink-0" />
            <span>{formFeedback}</span>
          </div>
        )}

        {/* Inner Tabs navigation (My Listings vs AI Drafts vs Create Listing) -> REMOVED */}


        {/* ==========================================
            VIEW 1: MANAGE LISTINGS LIST & FILTERS
            ========================================== */}
        {(activeTab === 'listings' || activeTab === 'ai_drafts') && (
          <div className="space-y-4 animate-fade-in text-left">
            
            {/* AI Draft Welcome Banner */}
            {activeTab === 'ai_drafts' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 flex items-start gap-3.5 text-xs mb-4">
                <Sparkles className="w-5 h-5 text-[#B87333] flex-shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <h4 className="font-display font-bold uppercase tracking-wider text-[#5C2314] flex items-center gap-1.5">
                    Snap-to-List AI Drafts Queue
                    <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wide font-mono">
                      VETTED IN YARD
                    </span>
                  </h4>
                  <p className="text-zinc-600 mt-1 font-sans leading-relaxed">
                    These listings were drafted using high-accuracy custom vision with Gemini 3.5. Click <strong>Review &amp; Publish</strong> on any item to correct parameters or prices before setting them active on the live buyer search index.
                  </p>
                </div>
              </div>
            )}
            
            {/* Status counts subtabs */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button 
                onClick={() => setListingsFilter('All')}
                className={`py-1.5 px-3 rounded font-semibold transition-all ${
                  listingsFilter === 'All' ? 'bg-[#5C2314] text-white shadow-2xs' : 'bg-white hover:bg-zinc-200/50 text-zinc-700 border border-[#EADECE]'
                }`}
              >
                All Statuses ({getStatusCount('All')})
              </button>
              <button 
                onClick={() => setListingsFilter('Draft')}
                className={`py-1.5 px-3 rounded font-semibold transition-all flex items-center gap-1.5 ${
                  listingsFilter === 'Draft' ? 'bg-zinc-200 text-zinc-800 font-bold border border-zinc-350' : 'bg-white hover:bg-zinc-200/50 text-zinc-700 border border-[#EADECE]'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-zinc-400" />
                Drafts ({getStatusCount('Draft')})
              </button>
              <button 
                onClick={() => setListingsFilter('Pending Verification')}
                className={`py-1.5 px-3 rounded font-semibold transition-all flex items-center gap-1.5 ${
                  listingsFilter === 'Pending Verification' ? 'bg-amber-100 text-amber-800 font-bold border border-amber-200' : 'bg-white hover:bg-zinc-200/50 text-zinc-700 border border-[#EADECE]'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Pending Verification ({getStatusCount('Pending Verification')})
              </button>
              <button 
                onClick={() => setListingsFilter('Published')}
                className={`py-1.5 px-3 rounded font-semibold transition-all flex items-center gap-1.5 ${
                  listingsFilter === 'Published' ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200' : 'bg-white hover:bg-zinc-200/50 text-zinc-700 border border-[#EADECE]'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                Published Live ({getStatusCount('Published')})
              </button>
            </div>

            {/* Part listings card listings */}
            {filteredParts.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredParts.map((part) => {
                  const status = partStatuses[part.id] || 'Draft';
                  let statusColorText = '';
                  let statusBg = '';
                  
                  if (status === 'Draft') {
                    statusColorText = 'text-zinc-650 bg-zinc-200/80 border-zinc-300';
                    statusBg = 'bg-zinc-400';
                  } else if (status === 'Pending Verification') {
                    statusColorText = 'text-amber-800 bg-amber-50 border-amber-200';
                    statusBg = 'bg-amber-400';
                  } else {
                    statusColorText = 'text-emerald-800 bg-emerald-50 border-emerald-200';
                    statusBg = 'bg-emerald-500';
                  }

                  return (
                    <div 
                      key={part.id} 
                      className="bg-white border border-[#EADECE] hover:border-zinc-350 rounded-md p-4 transition-all hover:bg-[#FCFAF7] flex flex-col md:flex-row gap-5 items-start justify-between relative shadow-2xs"
                      id={`seller-part-card-${part.id}`}
                    >
                      {/* Image + Title block */}
                      <div className="flex gap-4 items-start w-full md:w-3/4 min-w-0">
                        <div className="w-24 h-20 bg-zinc-850 rounded border border-zinc-200 overflow-hidden flex-shrink-0 shadow-2xs">
                          <img 
                            src={part.images[0] || PARTS_FALLBACK_IMAGE} 
                            alt={part.title} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = PARTS_FALLBACK_IMAGE;
                            }}
                          />
                        </div>

                        <div className="space-y-1 w-full min-w-0">
                          {/* Core Badge list */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            {/* Static status display */}
                            <span className={`text-[9.5px] uppercase font-mono tracking-widest font-black px-2 py-0.5 rounded border leading-none ${statusColorText}`}>
                              {status === 'Pending Verification' ? 'PENDING VERIFICATION' : status.toUpperCase()}
                            </span>

                            <span className="text-[9.5px] bg-zinc-100 text-zinc-500 font-mono px-2 py-0.5 rounded border border-zinc-200 font-bold leading-none uppercase">
                              {part.condition}
                            </span>

                            <span className="text-[9.5px] bg-[#FAF8F5] text-zinc-400 font-mono px-2 py-0.5 rounded border border-zinc-150 leading-none">
                              SKU: {part.trackingNumber}
                            </span>
                          </div>

                          <h3 
                            onClick={() => onSelectPart(part.id)}
                            className="font-display font-black text-sm md:text-base text-zinc-900 group-hover:text-[#5C2314] cursor-pointer hover:underline truncate uppercase"
                          >
                            {part.title}
                          </h3>

                          <p className="text-xs text-zinc-500 line-clamp-2 md:block leading-relaxed max-w-xl">
                            {part.description}
                          </p>

                          {/* Technical list row */}
                          <div className="text-[10.5px] text-zinc-400 font-sans flex flex-wrap gap-4 pt-1">
                            <span>System: <strong className="font-semibold text-zinc-700">{part.system}</strong></span>
                            <span>Category: <strong className="font-semibold text-zinc-700">{part.category}</strong></span>
                            <span>Year Compatibility: <strong className="font-semibold text-zinc-700">{part.compatibility[0]?.years || 'N/A'}</strong></span>
                            <span>Mileage: <strong className="font-semibold text-zinc-705">{part.mileage.toLocaleString()} mi</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Price details + action workflows */}
                      <div className="flex flex-row md:flex-col items-end justify-between w-full md:w-auto md:h-20 min-h-[5rem] border-t md:border-t-0 border-[#EADECE] pt-3 md:pt-0">
                        {/* Price rendering */}
                        <div className="text-right">
                          <span className="block text-[10px] text-zinc-400 uppercase font-mono font-bold">asking price</span>
                          <span className="font-mono text-xl font-black text-[#5C2314]">${part.price.toFixed(2)}</span>
                        </div>

                        {/* Actions lists */}
                        <div className="flex items-center gap-2 mt-auto">
                          {/* Publish/Review button shown if saved as Draft */}
                          {status === 'Draft' && (
                            part.isAiDraft ? (
                              <button
                                onClick={() => handleReviewAndPublish(part)}
                                className="px-3 py-1.5 bg-gradient-to-r from-[#B87333] to-[#5C2314] hover:from-[#A05C28] hover:to-[#4C190D] text-white font-display font-medium text-[11px] uppercase tracking-wider rounded transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 border border-[#5C2314]/30"
                                title="Review and edit draft specifications before publishing"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                                <span>Review &amp; Publish</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => triggerPublishForExistingPart(part)}
                                className="px-3 py-1.5 bg-[#B87333] hover:bg-[#8B6239] text-white font-display font-bold text-[11px] uppercase tracking-wider rounded transition-all flex items-center gap-1 cursor-pointer ease-out duration-100"
                                title="Go live on marketplace"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                                <span>Publish</span>
                              </button>
                            )
                          )}

                          {status === 'Pending Verification' && (
                            <div className="mr-2 text-xs text-amber-600 font-semibold animate-pulse flex items-center gap-1 select-none font-mono">
                              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                              Pending verification...
                            </div>
                          )}

                          {/* Buyer Preview exactly how it looks */}
                          <button
                            onClick={() => setPreviewPart(part)}
                            className="p-1.5 bg-white border border-[#EADECE] hover:border-zinc-400 rounded text-zinc-500 hover:text-zinc-900 shadow-2xs hover:scale-105 transition-all cursor-pointer"
                            title="See Buyer Preview Representation"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Delete action */}
                          <button
                            onClick={() => handleDeleteListing(part.id)}
                            className="p-1.5 bg-white border border-[#EADECE] hover:border-rose-400 rounded text-zinc-400 hover:text-rose-500 shadow-2xs hover:scale-105 transition-all cursor-pointer"
                            title="Delete draft listing permanently"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border border-[#EADECE] rounded-md p-16 text-center text-zinc-400 space-y-4 max-w-2xl mx-auto shadow-2xs">
                <Package className="w-12 h-12 mx-auto text-zinc-300 stroke-[1.2]" />
                <div className="space-y-1">
                  <h4 className="font-display font-bold uppercase text-zinc-500 text-sm">No listings found</h4>
                  <p className="text-xs max-w-xs mx-auto text-zinc-400 leading-relaxed">
                    You don&apos;t have any parts listed in the <span className="font-semibold uppercase tracking-wider">{listingsFilter}</span> category status. Let&apos;s build a new draft!
                  </p>
                </div>
                <button 
                  onClick={() => setActiveTab('create')}
                  className="bg-[#B87333] hover:bg-[#8B6239] text-white px-4 py-2.5 rounded font-display text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                >
                  Create Your First Listing
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            VIEW 2: DYNAMIC LISTING CREATOR FORM
            ========================================== */}
        {activeTab === 'create' && (
          <div className="bg-[#FAF8F5] max-md:fixed max-md:inset-0 max-md:z-[50] max-md:flex max-md:flex-col md:border md:border-[#EADECE] md:rounded-xl md:max-w-4xl md:mx-auto md:shadow-xl md:overflow-hidden md:h-[85vh] animate-fade-in text-left">
            
            {/* Header (Fixed) */}
            <div className="bg-white border-b border-zinc-100 p-4 md:p-6 shrink-0 z-20">
              <div className="flex items-center justify-between mb-4">
                <button 
                  onClick={() => {
                    if (currentStep > 1) {
                      handlePrevStep();
                    } else {
                      setEditingPartId(null);
                      setManualFormPhoto(null);
                      setForm(initialForm);
                      setActiveTab('listings');
                    }
                  }}
                  className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-rust-copper transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{currentStep === 1 ? 'Back to Listings' : 'Previous Step'}</span>
                </button>
                
                <div className="flex items-center gap-1.5 md:gap-3">
                  {[1, 2, 3, 4, 5].map(step => (
                    <button
                      key={step}
                      disabled={step > currentStep && !parts.some(p => p.id === editingPartId)}
                      onClick={() => {
                        if (step <= currentStep || parts.some(p => p.id === editingPartId)) {
                          setCurrentStep(step);
                        }
                      }}
                      className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold transition-all ${
                        currentStep === step 
                          ? 'bg-rust-copper text-white shadow-lg shadow-rust-copper/30 scale-110' 
                          : step < currentStep 
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                            : 'bg-zinc-100 text-zinc-400 border border-zinc-200 opacity-50'
                      }`}
                    >
                      {step < currentStep ? <Check className="w-3 h-3 md:w-4 md:h-4 stroke-[3]" /> : step}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-zinc-900 uppercase tracking-tight">
                    Step {currentStep}: {
                      currentStep === 1 ? 'Upload Photos' : 
                      currentStep === 2 ? 'The Basics' : 
                      currentStep === 3 ? 'Part Details' : 
                      currentStep === 4 ? 'Vehicle Fitment' : 
                      'Description & Publish'
                    }
                  </h3>
                  <span className="text-[10px] font-mono font-bold text-rust-copper bg-rust-copper/5 px-2 py-0.5 rounded">
                    Listing {calculateProgress()}% complete
                  </span>
                </div>
                <div className="h-1 bg-zinc-100 rounded-full w-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${calculateProgress()}%` }}
                    className="h-full bg-rust-copper"
                  />
                </div>
              </div>
            </div>

            {/* Step Content Area (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-white/50 custom-scrollbar">
              
              {/* Step 1: Photos */}
              {currentStep === 1 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="space-y-4">
                    <div 
                      className={`relative border-2 border-dashed rounded-2xl p-8 transition-all group ${
                        manualFormDragging ? 'border-rust-copper bg-rust-copper/5 scale-[0.99]' : 'border-zinc-200 hover:border-zinc-300 bg-white'
                      }`}
                      onDragOver={(e) => { e.preventDefault(); setManualFormDragging(true); }}
                      onDragLeave={() => setManualFormDragging(false)}
                      onDrop={handleManualFormDropImage}
                    >
                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple
                        onChange={handleManualFormPhotoSelect}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />
                      
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-zinc-50 text-zinc-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Camera className="w-8 h-8" />
                        </div>
                        <h4 className="text-sm font-bold text-zinc-900 mb-1">Click to upload or drag photos</h4>
                        <p className="text-xs text-zinc-500 font-sans max-w-xs">Center the part in frame. Include part numbers if visible. Max 12MB per image.</p>
                      </div>
                    </div>

                    {(uploadedImages.length > 0 || manualFormPhoto) && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {(uploadedImages.length > 0 ? uploadedImages : [manualFormPhoto]).filter(Boolean).map((img, idx) => (
                          <div key={idx} className="relative aspect-square rounded-xl border border-zinc-200 overflow-hidden group">
                            <img src={img!} className="w-full h-full object-cover" alt="Part capture" />
                            <button 
                              onClick={() => {
                                if (uploadedImages.length > 1) {
                                  setUploadedImages(prev => prev.filter((_, i) => i !== idx));
                                } else if (uploadedImages.length === 1) {
                                  setUploadedImages([]);
                                  if (manualFormPhoto === uploadedImages[0]) setManualFormPhoto(null);
                                } else {
                                  setManualFormPhoto(null);
                                }
                              }}
                              className="absolute top-1 right-1 bg-black/60 hover:bg-red-500 text-white p-1.5 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all z-20 cursor-pointer"
                              title="Remove photo"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <details className="group border border-zinc-200 rounded-xl bg-white overflow-hidden">
                      <summary className="flex items-center justify-between p-4 cursor-pointer text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-colors uppercase tracking-wider">
                        <span>No photo? Browse our verified image library</span>
                        <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                      </summary>
                      <div className="p-4 pt-0 grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {PHOTO_GALLERY.map(img => (
                          <button 
                            key={img.id}
                            type="button"
                            onClick={() => {
                              setUploadedImages(prev => [...prev, img.url].slice(0, 5));
                            }}
                            className="aspect-square rounded-lg border border-zinc-100 overflow-hidden hover:border-rust-copper transition-colors"
                          >
                            <img src={img.url} className="w-full h-full object-cover" alt="Gallery" />
                          </button>
                        ))}
                      </div>
                    </details>
                  </div>

                  {!uploadedImages.length && !manualFormPhoto && (
                    <button 
                      onClick={() => setCurrentStep(2)}
                      className="text-xs font-bold text-zinc-400 hover:text-rust-copper underline transition-colors block text-center w-full"
                    >
                      Skip for now &rarr;
                    </button>
                  )}
                </motion.div>
              )}

              {/* Step 2: The Basics */}
              {currentStep === 2 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-zinc-900 uppercase tracking-tight">Listing Title <span className="text-rust-copper">*</span></label>
                      <input 
                        type="text"
                        placeholder="e.g. 1987 Chevy K5 Alternator Prime"
                        value={form.title}
                        onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                        className="w-full h-12 px-4 bg-white border border-zinc-200 rounded-xl focus:border-rust-copper focus:ring-4 focus:ring-rust-copper/5 outline-none text-sm font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-zinc-900 uppercase tracking-tight">Price (USD) <span className="text-rust-copper">*</span></label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-zinc-400">$</span>
                          <input 
                            type="number"
                            placeholder="0"
                            value={form.price}
                            onChange={(e) => setForm(p => ({ ...p, price: e.target.value }))}
                            className="w-full h-12 pl-8 pr-4 bg-white border border-zinc-200 rounded-xl focus:border-rust-copper focus:ring-4 focus:ring-rust-copper/5 outline-none text-sm font-bold"
                          />
                        </div>
                        <p className="text-[10px] text-zinc-400 font-mono italic">Market avg for similar parts: $145.00</p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-zinc-900 uppercase tracking-tight">Part Mileage</label>
                        <input 
                          type="text"
                          placeholder="e.g. 72,500"
                          value={form.mileage}
                          onChange={(e) => setForm(p => ({ ...p, mileage: e.target.value }))}
                          className="w-full h-12 px-4 bg-white border border-zinc-200 rounded-xl focus:border-rust-copper focus:ring-4 focus:ring-rust-copper/5 outline-none text-sm font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Part Details */}
              {currentStep === 3 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-zinc-900 uppercase tracking-tight">System Segment</label>
                      <select 
                        value={form.system}
                        onChange={(e) => setForm(p => ({ ...p, system: e.target.value }))}
                        className="w-full h-12 px-4 bg-white border border-zinc-200 rounded-xl focus:border-rust-copper focus:ring-4 focus:ring-rust-copper/5 outline-none text-sm font-bold"
                      >
                        <option value="Powertrain">Powertrain</option>
                        <option value="Suspension & Steering">Suspension & Steering</option>
                        <option value="Brake System">Brake System</option>
                        <option value="Electrical System">Electrical System</option>
                        <option value="Body & Exterior">Body & Exterior</option>
                        <option value="Interior">Interior</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-zinc-900 uppercase tracking-tight">Subassembly Category</label>
                      <select 
                        value={form.category}
                        onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))}
                        className="w-full h-12 px-4 bg-white border border-zinc-200 rounded-xl focus:border-rust-copper focus:ring-4 focus:ring-rust-copper/5 outline-none text-sm font-bold"
                      >
                        {systemCategories().map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-zinc-900 uppercase tracking-tight">Part Type</label>
                      <select 
                        value={form.partType}
                        onChange={(e) => setForm(p => ({ ...p, partType: e.target.value }))}
                        className="w-full h-12 px-4 bg-white border border-zinc-200 rounded-xl focus:border-rust-copper focus:ring-4 focus:ring-rust-copper/5 outline-none text-sm font-bold"
                      >
                        {categoryTypes().map(pt => (
                          <option key={pt} value={pt}>{pt}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-zinc-900 uppercase tracking-tight">Condition</label>
                      <select 
                        value={form.condition}
                        onChange={(e) => setForm(p => ({ ...p, condition: e.target.value as PartCondition }))}
                        className="w-full h-12 px-4 bg-white border border-zinc-200 rounded-xl focus:border-rust-copper focus:ring-4 focus:ring-rust-copper/5 outline-none text-sm font-bold"
                      >
                        <option value="Excellent">Excellent</option>
                        <option value="OEM Original">OEM Original</option>
                        <option value="Good">Good</option>
                        <option value="Used OEM">Used OEM</option>
                        <option value="For Parts">For Parts</option>
                      </select>
                    </div>
                  </div>

                  <details className="group border border-zinc-200 rounded-xl bg-white overflow-hidden">
                    <summary className="flex items-center justify-between p-4 cursor-pointer text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-colors uppercase tracking-wider">
                      <span>Advanced Details</span>
                      <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="p-4 pt-0 space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-zinc-900 uppercase tracking-tight">OEM Part Number</label>
                        <input 
                          type="text"
                          placeholder="e.g. GM-14030612"
                          value={form.oemPartNumber}
                          onChange={(e) => setForm(p => ({ ...p, oemPartNumber: e.target.value }))}
                          className="w-full h-12 px-4 bg-white border border-zinc-200 rounded-xl focus:border-rust-copper focus:ring-4 focus:ring-rust-copper/5 outline-none text-sm font-bold"
                        />
                      </div>
                    </div>
                  </details>
                </motion.div>
              )}

              {/* Step 4: Vehicle Fitment */}
              {currentStep === 4 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-zinc-900 uppercase tracking-tight">Make</label>
                      <input 
                        type="text"
                        placeholder="e.g. Chevrolet"
                        value={form.make}
                        onChange={(e) => setForm(p => ({ ...p, make: e.target.value }))}
                        className="w-full h-12 px-4 bg-white border border-zinc-200 rounded-xl focus:border-rust-copper focus:ring-4 focus:ring-rust-copper/5 outline-none text-sm font-bold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-zinc-900 uppercase tracking-tight">Model</label>
                      <input 
                        type="text"
                        placeholder="e.g. C10 Pickup"
                        value={form.model}
                        onChange={(e) => setForm(p => ({ ...p, model: e.target.value }))}
                        className="w-full h-12 px-4 bg-white border border-zinc-200 rounded-xl focus:border-rust-copper focus:ring-4 focus:ring-rust-copper/5 outline-none text-sm font-bold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-zinc-900 uppercase tracking-tight">Years</label>
                      <input 
                        type="text"
                        placeholder="e.g. 1973-1987"
                        value={form.years}
                        onChange={(e) => setForm(p => ({ ...p, years: e.target.value }))}
                        className="w-full h-12 px-4 bg-white border border-zinc-200 rounded-xl focus:border-rust-copper focus:ring-4 focus:ring-rust-copper/5 outline-none text-sm font-bold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-zinc-900 uppercase tracking-tight">Engine</label>
                      <input 
                        type="text"
                        placeholder="e.g. 5.7L V8"
                        value={form.engine}
                        onChange={(e) => setForm(p => ({ ...p, engine: e.target.value }))}
                        className="w-full h-12 px-4 bg-white border border-zinc-200 rounded-xl focus:border-rust-copper focus:ring-4 focus:ring-rust-copper/5 outline-none text-sm font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-zinc-900 uppercase tracking-tight">Additional Fitment Notes</label>
                    <textarea 
                      rows={4}
                      placeholder="e.g. Fits 2WD models only. Does not fit GMC Sierra equivalents due to different grille architecture."
                      value={form.fits}
                      onChange={(e) => setForm(p => ({ ...p, fits: e.target.value }))}
                      className="w-full p-4 bg-white border border-zinc-200 rounded-xl focus:border-rust-copper focus:ring-4 focus:ring-rust-copper/5 outline-none text-sm font-bold transition-all min-h-[120px]"
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 5: Description & Publish */}
              {currentStep === 5 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  {/* Summary Card */}
                  <div className="bg-zinc-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Package className="w-24 h-24 rotate-12" />
                    </div>
                    <div className="relative z-10 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400">Review Listing Details</span>
                        <span className="text-xs font-bold text-rust-copper">${form.price}</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-black uppercase tracking-tight leading-tight mb-1">{form.title || 'Untitled Listing'}</h4>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-[9px] font-black uppercase tracking-tighter bg-white/10 px-1.5 py-0.5 rounded">{form.condition}</span>
                          <span className="text-[9px] font-black uppercase tracking-tighter bg-white/10 px-1.5 py-0.5 rounded">{form.make} {form.model}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-xs font-black text-zinc-900 uppercase tracking-tight">Description & Condition Notes <span className="text-rust-copper">*</span></label>
                      <button 
                        type="button" 
                        onClick={() => {
                          const aiDesc = `Authentic ${form.condition} ${form.partType} removed from a ${form.years} ${form.make} ${form.model}. Part is verified and ready for shipment. OEM Part Number: ${form.oemPartNumber || 'N/A'}.`;
                          setForm(p => ({ ...p, description: aiDesc }));
                        }}
                        className="text-[10px] font-black text-rust-copper flex items-center gap-1 hover:underline uppercase tracking-tight"
                      >
                        <Sparkles className="w-3 h-3" />
                        Generate with AI
                      </button>
                    </div>
                    <textarea 
                      rows={6}
                      placeholder="Describe the condition, usage history, and any special notes..."
                      value={form.description}
                      onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                      className="w-full p-4 bg-white border border-zinc-200 rounded-xl focus:border-rust-copper focus:ring-4 focus:ring-rust-copper/5 outline-none text-sm font-bold transition-all min-h-[160px]"
                    />
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-mono text-zinc-400 italic">Be honest about defects to avoid returns.</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${form.description.length > 900 ? 'text-red-500' : 'text-zinc-500'}`}>
                        {form.description.length} / 1000
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <button 
                      onClick={handleOpenPreview}
                      className="flex-1 py-4 bg-white border border-zinc-200 rounded-xl text-xs font-black uppercase tracking-widest text-zinc-600 hover:bg-zinc-50 transition-all flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer (Fixed) */}
            <div className="bg-zinc-50 border-t border-zinc-200 p-4 md:p-6 shrink-0 z-20">
              <div className="flex items-center justify-between gap-3">
                <button 
                  disabled={currentStep === 1}
                  onClick={handlePrevStep}
                  className={`flex-1 py-4 rounded-xl font-display font-black text-xs uppercase tracking-widest transition-all ${
                    currentStep === 1 
                      ? 'bg-zinc-100 text-zinc-300 cursor-not-allowed opacity-50' 
                      : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  Back
                </button>
                
                {currentStep < 5 ? (
                  <button 
                    onClick={handleNextStep}
                    disabled={
                      (currentStep === 1 && !uploadedImages.length && !manualFormPhoto) ||
                      (currentStep === 2 && (!form.title || !form.price))
                    }
                    className={`flex-1 py-4 rounded-xl font-display font-black text-xs uppercase tracking-widest transition-all shadow-lg hover:translate-y-[-2px] active:translate-y-0 ${
                      ((currentStep === 1 && !uploadedImages.length && !manualFormPhoto) || (currentStep === 2 && (!form.title || !form.price)))
                        ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none hover:translate-y-0'
                        : 'bg-rust-copper text-white hover:bg-oil-dark shadow-rust-copper/20'
                    }`}
                  >
                    Continue
                  </button>
                ) : (
                  <div className="flex-[2] flex gap-2">
                    <button 
                      onClick={() => handleSaveDraft()}
                      className="flex-1 py-4 bg-white border border-zinc-200 rounded-xl text-xs font-black uppercase tracking-widest text-[#B87333] hover:bg-zinc-50 transition-all shadow-sm"
                    >
                      Save Draft
                    </button>
                    <button 
                      onClick={handlePublishListing}
                      className="flex-[1.5] py-4 bg-zinc-900 border border-zinc-900 rounded-xl text-xs font-black uppercase tracking-widest text-white hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 active:scale-[0.98]"
                    >
                      Publish Listing
                    </button>
                  </div>
                )}
              </div>
              
              {/* Draft Saved Indicator */}
              <AnimatePresence>
                {editingPartId && (
                  <motion.p 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-[9px] text-emerald-600 font-mono uppercase font-black text-center mt-3 tracking-tighter flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Draft saved
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* ==========================================
            VIEW 3: PROFILE SETTINGS EDITOR TAB
            ========================================== */}
        {activeTab === 'settings' && (
          <div className="bg-white border border-[#EADECE] rounded-md p-6 max-w-2xl mx-auto shadow-xs text-left animate-fade-in relative z-10">
            <div className="border-b border-zinc-100 pb-3 mb-5">
              <h3 className="font-display font-black text-lg text-zinc-900 uppercase tracking-tight flex items-center gap-2">
                <Settings className="w-5.5 h-5.5 text-[#B87333]" />
                Business Profile
              </h3>
              <p className="text-xs text-zinc-500 font-sans mt-0.5">
                Complete your profile to start selling. Buyers see this information on your listings.
              </p>
            </div>

            <div className="space-y-4">
              
              {/* Profile completed summary */}
              <div className="bg-zinc-50 p-4 border border-zinc-250/60 rounded">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">Business Setup Progress Dashboard</span>
                  <span className="text-xs font-mono font-black text-[#5C2314]">{completionStats.percentage}% Complete</span>
                </div>
                <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#5C2314] transition-all duration-500" style={{ width: `${completionStats.percentage}%` }} />
                </div>
              </div>

              {/* Fields edit list */}
              <div className="space-y-4 pt-1">
                {/* 1. Yard Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 block uppercase font-mono tracking-wider">BUSINESS NAME *</label>
                  <input 
                    type="text" 
                    placeholder="Enter your yard name"
                    value={profile.name === 'Unnamed Yard' ? '' : profile.name}
                    onChange={(e) => setProfile(p => ({ ...p, name: e.target.value || 'Unnamed Yard' }))}
                    className="w-full bg-white border border-[#E3D8CE] focus:border-[#5C2314] rounded px-3 py-2 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-[#5C2314]/30 text-zinc-805"
                    style={{ color: (!profile.name || profile.name === 'Unnamed Yard') ? 'rgba(0,0,0,0.35)' : 'inherit' }}
                  />
                  <span className="text-[10px] text-zinc-400 block font-sans font-medium">This name is showcased to buyers on listing descriptors and search results.</span>
                </div>

                {/* 2. Location (Structured) */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-zinc-700 block uppercase font-mono tracking-wider">YARD ADDRESS *</label>
                  <input 
                    type="text" 
                    placeholder="Street Address"
                    value={profile.streetAddress}
                    onChange={(e) => setProfile(p => ({ ...p, streetAddress: e.target.value }))}
                    className="w-full bg-white border border-[#E3D8CE] rounded px-3 py-2 text-xs"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="City" value={profile.city} onChange={(e) => setProfile(p => ({ ...p, city: e.target.value }))} className="bg-white border rounded px-3 py-2 text-xs" />
                    <input type="text" placeholder="State" value={profile.state} onChange={(e) => setProfile(p => ({ ...p, state: e.target.value }))} className="bg-white border rounded px-3 py-2 text-xs" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="ZIP Code" value={profile.zipCode} onChange={(e) => setProfile(p => ({ ...p, zipCode: e.target.value }))} className="bg-white border rounded px-3 py-2 text-xs" />
                    <input type="text" placeholder="Country" value={profile.country} onChange={(e) => setProfile(p => ({ ...p, country: e.target.value }))} className="bg-white border rounded px-3 py-2 text-xs" />
                  </div>
                </div>

                {/* 3. WhatsApp and Phone */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 block uppercase font-mono tracking-wider">WHATSAPP (RECOMMENDED)</label>
                    <input type="text" value={profile.whatsapp} onChange={(e) => setProfile(p => ({ ...p, whatsapp: e.target.value }))} className="w-full bg-white border border-[#E3D8CE] rounded px-3 py-2 text-xs" placeholder="e.g. +1 (313) 555-0199" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 block uppercase font-mono tracking-wider">PHONE (OPTIONAL)</label>
                    <input type="text" value={profile.phone} onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))} className="w-full bg-white border border-[#E3D8CE] rounded px-3 py-2 text-xs" placeholder="e.g. +1 (313) 555-0199" />
                  </div>
                </div>

                {/* 4. Yard logo */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 block uppercase font-mono tracking-wider">YARD LOGO</label>
                  <div className="border-2 border-dashed border-amber-300 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-amber-500 transition-colors">
                    <Camera className="w-8 h-8 text-amber-500 mb-2" />
                    <span className="text-xs font-bold text-zinc-600">Upload logo or drag image here</span>
                  </div>
                </div>

                {/* 5. Business Email */}
                <div className="space-y-3">
                   <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 uppercase font-mono tracking-wider">
                     <input type="checkbox" checked={profile.useAccountEmail} onChange={(e) => setProfile(p => ({ ...p, useAccountEmail: e.target.checked }))} />
                     Use account email for inquiries
                   </label>
                   {!profile.useAccountEmail && (
                      <input 
                        type="email" 
                        value={profile.businessEmail} 
                        onChange={(e) => setProfile(p => ({ ...p, businessEmail: e.target.value }))} 
                        className="w-full bg-white border rounded px-3 py-2 text-xs" 
                        placeholder="business@yardaddress.com" 
                      />
                   )}
                </div>

              </div>

              {/* Actions footer */}
              <div className="pt-4 border-t border-zinc-150 flex items-center justify-between mt-6">
                <span className="text-xs text-zinc-400 select-none">Changes saved automatically.</span>
                
                <button 
                  onClick={() => {
                    setActiveTab('listings');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-[#5C2314] hover:bg-[#802D1A] text-white px-6 py-2.5 rounded font-display text-xs font-bold uppercase tracking-wider shadow cursor-pointer transition-all"
                >
                  Save Changes
                </button>
              </div>

            </div>
          </div>
        )}

      </div>


      {/* ========================================================
          PUBLISH GATE MODAL (The Incomplete Profile Soft Gate)
          ======================================================== */}
      {showGate && gatedPart && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-[9990] flex items-center justify-center p-4 animate-fade-in text-left">
          <div className="bg-[#FCFAF7] border border-[#E9DFD6] rounded-md shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up font-sans">
            
            {/* Modal Header */}
            <div className="bg-[#1E1E1E] text-[#FCFAF7] p-5 border-b border-[#3D3632] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-[#5C2314] flex items-center justify-center rounded">
                  <Lock className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-black text-sm uppercase tracking-wider">Publish Your First Listing</h3>
                  <p className="text-[10px] text-zinc-400 font-sans">Before going live, buyers need to know who they&apos;re buying from.</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowGate(false);
                  setGatedPart(null);
                }}
                className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Scroll area */}
            <div className="p-6 overflow-y-auto space-y-5">
              
              {/* Required inputs form */}
              <form onSubmit={handleCompleteGateSubmit} className="space-y-4">
                
                <div className="bg-amber-500/10 border border-amber-300/40 p-4 rounded text-xs text-amber-800 leading-relaxed space-y-1 mb-2">
                  <p className="font-bold uppercase tracking-wide flex items-center gap-1.5 select-none">
                    <Info className="w-4 h-4" />
                    INCOMPLETE SELLER BUSINESS PROFILE
                  </p>
                  <p>
                    Please provide your business coordinates below to instantly complete registration and publish your draft live onto PartsPeddle Search.
                  </p>
                </div>

                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[10.5px] uppercase font-mono font-bold text-zinc-500 tracking-wider flex justify-between select-none">
                    <span>Business Name *</span>
                    <span className="text-red-500 font-bold font-sans text-xs">Required</span>
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Acme Auto Salvage Co"
                    value={inlineFields.name === 'Unnamed Yard' ? '' : inlineFields.name}
                    onChange={(e) => setInlineFields(p => ({ ...p, name: e.target.value }))}
                    className="w-full text-xs p-3 bg-white border border-[#EADECE] outline-none rounded focus:border-[#5C2314] focus:ring-1 focus:ring-[#5C2314]/30 text-[#1E1E1E]"
                  />
                </div>

                {/* Email Verification */}
                <div className="space-y-1">
                  <label className="text-[10.5px] uppercase font-mono font-bold text-zinc-500 tracking-wider flex justify-between select-none">
                    <span>Business Contact Email *</span>
                    <span className="text-[#5C2314] font-bold">Automatic desk verified</span>
                  </label>
                  <input 
                    type="email"
                    required
                    readOnly
                    value={inlineFields.email}
                    className="w-full text-xs p-3 bg-zinc-100 border border-[#EADECE] outline-none rounded text-zinc-500 cursor-not-allowed select-none"
                  />
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <label className="text-[10.5px] uppercase font-mono font-bold text-zinc-500 tracking-wider flex justify-between select-none">
                    <span>Yard Physical Address *</span>
                    <span className="text-red-500 font-bold font-sans text-xs">Required for freight SLA</span>
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. 102 Mechanics Lane, Detroit, MI"
                    value={inlineFields.location}
                    onChange={(e) => setInlineFields(p => ({ ...p, location: e.target.value }))}
                    className="w-full text-xs p-3 bg-white border border-[#EADECE] outline-none rounded focus:border-[#5C2314] focus:ring-1 focus:ring-[#5C2314]/30 text-[#1E1E1E]"
                  />
                </div>

                {/* WhatsApp */}
                <div className="space-y-1">
                  <label className="text-[10.5px] uppercase font-mono font-bold text-zinc-500 tracking-wider flex justify-between select-none">
                    <span>WhatsApp Number (Optional)</span>
                    <span className="text-zinc-400">○ Recommended for direct offers</span>
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. +1 (313) 555-0199"
                    value={inlineFields.whatsapp}
                    onChange={(e) => setInlineFields(p => ({ ...p, whatsapp: e.target.value }))}
                    className="w-full text-xs p-3 bg-white border border-[#EADECE] outline-none rounded focus:border-[#5C2314] focus:ring-1 focus:ring-[#5C2314]/30 text-[#1E1E1E]"
                  />
                </div>

                {/* CHECKLIST PUBLISH ACTIONS */}
                <button 
                  type="submit"
                  className="w-full bg-[#5C2314] hover:bg-[#802D1A] text-white font-display font-bold uppercase py-3.5 rounded text-center tracking-wider text-xs transition-all shadow cursor-pointer mt-2"
                >
                  COMPLETE &amp; PUBLISH LIVE
                </button>
              </form>

              {/* ========================================================
                  OPTION A SPEC: DRAFT LISTING RENDER BELOW THE CHECKLIST
                  ======================================================== */}
              <div className="border-t border-[#EADECE] pt-4 mt-6 text-left">
                <span className="text-[9.5px] font-mono font-black uppercase text-[#5C2314] tracking-widest block mb-3 leading-none bg-[#EADECE]/30 p-2 border border-[#EADECE]/50 rounded text-center select-none">
                  Draft preview you are publishing
                </span>
                
                <div className="p-3 bg-white border border-[#EADECE] rounded flex gap-3.5 items-start">
                  <div className="w-16 h-14 bg-zinc-850 rounded border flex-shrink-0 overflow-hidden shadow-3xs">
                    <img 
                      src={gatedPart.images[0] || PARTS_FALLBACK_IMAGE} 
                      alt="Part" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = PARTS_FALLBACK_IMAGE;
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0 font-sans space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 select-none">
                      <span className="bg-zinc-100 text-zinc-500 font-mono text-[8px] px-1.5 py-0.2 rounded font-bold border border-zinc-200">
                        {gatedPart.condition}
                      </span>
                      <span className="bg-zinc-100 text-zinc-405 font-mono text-[8px] px-1.5 py-0.2 rounded leading-none">
                        Asking: ${gatedPart.price}
                      </span>
                    </div>
                    <h4 className="font-bold text-zinc-800 line-clamp-1 uppercase leading-snug">{gatedPart.title}</h4>
                    <p className="text-[10.5px] text-zinc-400 line-clamp-1 leading-normal">{gatedPart.description}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}


      {/* ========================================================
          BUYER PREVIEW RENDER MODAL (Trust Layer Preview)
          ======================================================== */}
      {previewPart && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-[9990] flex items-center justify-center p-4 overflow-y-auto animate-fade-in text-left">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-up font-sans my-8">
            
            {/* Top Preview notice matching "Buyer Preview" banner spec */}
            <div className="bg-[#5C2314] text-[#FCFAF7] py-3.5 px-5 font-mono text-[10.5px] font-black uppercase tracking-widest flex items-center justify-between border-b border-[#3D3632] select-none">
              <span className="flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-400 stroke-[2.3] flex-shrink-0" />
                BUYER PREVIEW (Your listing is preserved as a draft)
              </span>
              <button 
                onClick={() => setPreviewPart(null)}
                className="bg-white/10 hover:bg-white/20 text-white rounded px-2 py-0.5"
              >
                CLOSE PREVIEW [X]
              </button>
            </div>

            <div className="p-5 md:p-6 space-y-5">
              
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded text-xs text-yellow-805 leading-relaxed flex items-start gap-2.5">
                <AlertTriangle className="w-4.5 h-4.5 text-yellow-600 stroke-[2.5] flex-shrink-0 pt-0.5" />
                <div>
                  <strong className="text-yellow-900 block font-bold leading-none mb-1">What Buyers See (The Trust Layer)</strong>
                  This is exactly how buyers see your item once published. Unverified profiles show as drafts. Listings will be live and searchable once profile data is completed.
                </div>
              </div>

              {/* Dynamic Product Detail UI mirroring standard Buyer representation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                
                {/* Visual Image */}
                <div className="space-y-3">
                  <div className="aspect-video bg-zinc-900 rounded-lg overflow-hidden border border-zinc-200 shadow-sm relative">
                    <img 
                      src={previewPart.images[0] || PARTS_FALLBACK_IMAGE} 
                      alt="Part Preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = PARTS_FALLBACK_IMAGE;
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="aspect-video bg-zinc-100 rounded border border-[#5C2314] overflow-hidden">
                      <img 
                        src={previewPart.images[0] || PARTS_FALLBACK_IMAGE} 
                        alt="thumbnail" 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = PARTS_FALLBACK_IMAGE;
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Details Specifications pricing */}
                <div className="space-y-3.5 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] bg-zinc-150 text-zinc-500 font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded leading-none inline-block">
                      {previewPart.condition}
                    </span>
                    <h3 className="font-display font-black text-lg md:text-xl text-zinc-900 uppercase tracking-tight">
                      {previewPart.title}
                    </h3>
                    <p className="text-xs text-zinc-400 font-mono">Stock ID: {previewPart.trackingNumber}</p>
                  </div>

                  <div className="py-2.5 border-t border-b border-zinc-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-400 block font-mono uppercase font-semibold leading-none">guaranteed price</span>
                      <span className="text-2xl font-mono font-black text-[#5C2314]">${previewPart.price.toFixed(2)}</span>
                    </div>

                    <div className="bg-emerald-50 text-emerald-800 border border-emerald-150 rounded px-2.5 py-1 text-xs text-center">
                      <span className="block text-[8px] uppercase font-mono font-bold leading-none text-emerald-600 mb-0.5">freight shipping</span>
                      <span className="font-bold uppercase tracking-wider">calculated</span>
                    </div>
                  </div>

                  {/* Vetted seller trust stats banner requested by Buyer Preview Trust spec */}
                  <div className="bg-zinc-50 p-3.5 border border-[#EADECE]/60 rounded-md space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-700">
                      <span>Seller: {profile.name}</span>
                      <span className="text-[#C4A882] font-mono text-center">★ 4.8</span>
                    </div>
                    
                    <div className="text-[10.5px] text-zinc-455 font-sans leading-relaxed pt-1.5 border-t border-zinc-200 flex items-start gap-1">
                      <span className="text-zinc-400 font-bold font-mono">ⓘ</span>
                      <span>This seller is completing their profile. Listings will be visible once verified.</span>
                    </div>
                  </div>

                  {/* Mock buttons in buyer view (disabled) */}
                  <div className="grid grid-cols-2 gap-2 mt-2 select-none">
                    <div className="px-3 py-2.5 bg-zinc-155 border border-zinc-300 text-zinc-400 rounded text-center text-xs font-display font-bold uppercase cursor-not-allowed">
                      Secure Outright Buy
                    </div>
                    <div className="px-3 py-2.5 bg-zinc-100 text-zinc-400 rounded text-center text-xs font-display font-bold uppercase border-dashed border border-zinc-300 cursor-not-allowed">
                      Make Offer
                    </div>
                  </div>

                </div>

              </div>
              
              {/* Fitment Specifications */}
              <div className="bg-[#FAF8F5] border border-[#EADECE] rounded p-4 text-xs space-y-2.5 text-left pt-3">
                <span className="text-[9.5px] uppercase font-mono tracking-widest text-[#5C2314] font-black block border-b border-[#EADECE]/80 pb-1 leading-none select-none">
                  Fitted Compatibility specs
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 leading-relaxed">
                  <div>
                    <span className="block text-zinc-400 font-mono text-[9px] uppercase">Vehicle Make</span>
                    <strong className="text-zinc-700">{previewPart.compatibility[0]?.make || 'Chevrolet'}</strong>
                  </div>
                  <div>
                    <span className="block text-zinc-400 font-mono text-[9px] uppercase">Vehicle Model</span>
                    <strong className="text-zinc-700">{previewPart.compatibility[0]?.model || 'C10 Pickup'}</strong>
                  </div>
                  <div>
                    <span className="block text-zinc-400 font-mono text-[9px] uppercase">Production Years</span>
                    <strong className="text-zinc-700">{previewPart.compatibility[0]?.years || '1981-1987'}</strong>
                  </div>
                  <div>
                    <span className="block text-zinc-400 font-mono text-[9px] uppercase">Engine Spec</span>
                    <strong className="text-zinc-700">{previewPart.compatibility[0]?.engine || '5.7L V8'}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-200/60 font-sans text-zinc-600 italic">
                  &ldquo;{previewPart.description}&rdquo;
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* PartsPeddle Premium Snap-to-List AI ID Modal */}
      {isAiModalOpen && (
        <div 
          className="fixed inset-0 bg-[#0A0A0A]/90 backdrop-blur-md flex items-center justify-center z-[200] p-4 font-sans animate-fade-in"
          id="ai-snap-to-list-modal"
        >
          <div className="bg-white rounded-2xl border border-zinc-200/50 w-full max-w-xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-[#FAF8F5] border-b border-[#EADECE] px-6 py-5 flex flex-col items-start gap-1 select-none relative">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#1A1A1A]" />
                <h3 className="font-display font-black text-sm text-[#1A1A1A] uppercase tracking-tighter">
                  Snap-to-List ID
                </h3>
              </div>
              <p className="text-[10px] text-zinc-500 font-sans font-medium">
                Automatically draft a listing from snapshots
              </p>
              
              <button 
                onClick={() => {
                  if (!isAnalyzing) {
                    setIsAiModalOpen(false);
                    setUploadedImages([]);
                    setAnalysisError(null);
                  }
                }}
                disabled={isAnalyzing}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                id="btn-close-ai-modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-center min-h-[400px] relative custom-scrollbar">
              
              {/* Error Guard Display */}
              {analysisError && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-xs text-left space-y-1.5 flex items-start gap-3 animate-scale-up">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <strong className="font-bold uppercase tracking-wider block">Scan Interrupted</strong>
                    <p className="opacity-90">{analysisError}</p>
                  </div>
                </div>
              )}

              {/* Viewfinder and Photos Area */}
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDropImage}
                className={`rounded-2xl transition-all select-none bg-white relative overflow-hidden border-2 flex flex-col items-center justify-center ${
                  isDragging ? 'border-rust-copper bg-rust-copper/5 scale-[0.98]' : 'border-rust-copper/30 border-dashed p-1'
                }`}
                id="dropzone-unfilled"
              >
                <input 
                  type="file" 
                  id="ai-file-picker"
                  accept="image/*"
                  multiple
                  capture="environment"
                  onChange={handlePhotoSelect}
                  className="hidden" 
                />
                
                {uploadedImages.length > 0 ? (
                  <div className="w-full flex items-center justify-center bg-steel-black min-h-[160px]">
                    <img 
                      src={uploadedImages[uploadedImages.length - 1]} 
                      className="w-full h-full object-cover aspect-[4/3] rounded-xl"
                      alt="Last capture" 
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-[4/3] rounded-xl bg-steel-black relative overflow-hidden">
                    {viewfinderStream && !cameraError ? (
                      <>
                        <video 
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Live Badge */}
                        <div className="absolute top-3 left-3 bg-charcoal/70 backdrop-blur-sm px-2 py-1 rounded text-xs font-sans text-base-cream flex items-center gap-1.5 z-10 shadow-sm border border-white/10 uppercase tracking-widest scale-90 origin-left">
                           <div className="w-1.5 h-1.5 bg-sage-green rounded-full animate-pulse"></div>
                           Live Viewfinder
                        </div>

                        {/* Add Angle Button Overlay */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            document.getElementById('ai-file-picker')?.click();
                          }}
                          className="absolute top-3 right-3 w-8 h-8 bg-charcoal/70 backdrop-blur-sm rounded-full flex items-center justify-center text-base-cream hover:bg-rust-copper transition-all z-10 shadow-lg border border-white/10"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        
                        {/* Capture Button */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            capturePhoto();
                          }}
                          className="absolute bottom-4 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-rust-copper border-4 border-base-cream shadow-xl active:scale-95 transition-transform z-10"
                        >
                          <div className="h-full w-full rounded-full border border-black/10"></div>
                        </button>
                      </>
                    ) : (
                      <div className="bg-base-cream w-full h-full border border-oil-dark/20 p-6 flex flex-col items-center justify-center text-center">
                        <Camera className="text-warm-gray w-12 h-12 mb-3" />
                        <h3 className="font-display text-lg text-steel-black mb-2 uppercase tracking-tight">Camera Not Available</h3>
                        <p className="text-sm text-warm-gray mb-4 font-sans leading-snug max-w-[240px]">
                          Enable camera access to snap parts instantly, or upload a photo from your device.
                        </p>
                        
                        <div className="w-full space-y-3">
                          <button 
                            onClick={() => document.getElementById('ai-file-picker')?.click()}
                            className="bg-rust-copper text-steel-black rounded-lg w-full py-3 font-display uppercase text-sm font-black tracking-widest shadow-lg active:scale-[0.98] transition-all"
                          >
                            Upload from Gallery
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Captured Thumbnails Horizontal Row */}
              {uploadedImages.length > 0 && (
                <div className="space-y-2">
                  <div className="flex gap-2 overflow-x-auto py-1 px-1 custom-scrollbar">
                    {uploadedImages.map((img, i) => (
                      <div key={i} className="relative group shrink-0">
                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-oil-dark hover:border-rust-copper transition-colors bg-steel-black">
                          <img src={img} className="w-full h-full object-cover" alt={`Angle ${i+1}`} />
                        </div>
                        {!isAnalyzing && (
                          <button 
                            onClick={() => setUploadedImages(prev => prev.filter((_, idx) => idx !== i))}
                            className="absolute -top-1.5 -right-1.5 bg-charcoal text-base-cream p-1 rounded-full shadow-lg hover:bg-red-500 transition-colors z-10 scale-75"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                    {uploadedImages.length < 5 && !isAnalyzing && (
                      <button 
                        onClick={() => document.getElementById('ai-file-picker')?.click()}
                        className="w-16 h-16 rounded-lg border border-dashed border-warm-gray/40 flex flex-col items-center justify-center text-warm-gray hover:border-rust-copper hover:text-rust-copper transition-colors shrink-0 bg-zinc-50"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Compact Toolbars (Full View / Clear Light) */}
              {!isAnalyzing && viewfinderStream && !cameraError && uploadedImages.length === 0 && (
                <div className="flex gap-2 justify-center pt-2">
                  <button className="w-10 h-10 flex items-center justify-center bg-[#1A1A1A] text-warm-gray hover:text-base-cream rounded-lg transition-colors border border-white/5" title="Full View">
                    <Maximize className="w-4 h-4" />
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center bg-[#1A1A1A] text-warm-gray hover:text-base-cream rounded-lg transition-colors border border-white/5" title="Clear Light">
                    <Sun className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="bg-white border-t border-zinc-100 px-6 py-5 sticky bottom-0 z-30">
              <button
                disabled={uploadedImages.length === 0 || isAnalyzing}
                onClick={handleIdentifyWithAi}
                className={`w-full py-3.5 rounded-xl font-display font-black text-sm uppercase tracking-wide transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer ${
                  uploadedImages.length > 0 && !isAnalyzing
                    ? 'bg-rust-copper text-steel-black hover:brightness-110 shadow-rust-copper/20'
                    : 'bg-zinc-200 text-zinc-400 opacity-40 cursor-not-allowed shadow-none'
                } ${isAnalyzing ? 'animate-pulse' : ''}`}
              >
                {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-steel-black/30 border-t-steel-black rounded-full animate-spin"></div>
                      <span>Analyzing...</span>
                    </>
                ) : (
                    <>
                      <span>Identify Part</span>
                    </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {isReviewOpen && <AIReviewModal />}
      {isZoomOpen && <ZoomModal />}
      {isOffline && <OfflineModal />}
    </div>
  );
}
