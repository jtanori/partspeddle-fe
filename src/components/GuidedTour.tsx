import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Volume2, Maximize, X, ArrowRight, HelpCircle, 
  Search, Grid, Info, ShieldCheck, DollarSign
} from 'lucide-react';
import { TOUR_STEPS } from '../services/data/tour';

interface GuidedTourProps {
  onClose: () => void;
  onHighlightElement: (elementId: string | undefined) => void;
}

export default function GuidedTour({ onClose, onHighlightElement }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoDuration, setVideoDuration] = useState(32);
  const [videoTime, setVideoTime] = useState(3); // Start near 0:03 matching mockup
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [arrowPaths, setArrowPaths] = useState<string[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  const tourData = TOUR_STEPS.find((t) => t.step === currentStep);

  // Sync actual video element playback state
  useEffect(() => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.play().catch((err) => {
          console.warn("Media playback play request failed/blocked:", err);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isVideoPlaying]);

  // Sync time slider bar value
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setVideoTime(Math.round(videoRef.current.currentTime));
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(Math.round(videoRef.current.duration) || 32);
      // Seek near 3 seconds initially to reflect mockup frame
      videoRef.current.currentTime = 3;
      setVideoTime(3);
    }
  };

  // Format visual seconds/minutes (0:03)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Linear scrub timing bar selection click
  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percent = clickX / rect.width;
      const targetTime = percent * videoDuration;
      videoRef.current.currentTime = targetTime;
      setVideoTime(Math.round(targetTime));
    }
  };

  // Apply highlight glow outline styling on focused targets in the DOM
  useEffect(() => {
    if (!tourData?.elementId) {
      onHighlightElement(undefined);
      return;
    }

    onHighlightElement(tourData.elementId);

    // If step is 1, let's highlight both navigation search and hero search widget
    const elIds = tourData.elementId === 'tour-search'
      ? ['tour-search', 'tour-search-hero']
      : [tourData.elementId];

    const highlighted: HTMLElement[] = [];

    elIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el && el instanceof HTMLElement) {
        el.classList.add('tour-highlight');
        highlighted.push(el);
      }
    });

    return () => {
      highlighted.forEach((el) => el.classList.remove('tour-highlight'));
    };
  }, [currentStep, tourData, onHighlightElement]);

  // Compute curved pointers to draw golden indicator lines
  useEffect(() => {
    const updateArrows = () => {
      if (window.innerWidth < 768 || !tourData?.elementId) {
        setArrowPaths([]);
        return;
      }

      const paths: string[] = [];
      const dialogEl = document.getElementById('guided-tour-dialog');
      
      if (!dialogEl) {
        setArrowPaths([]);
        return;
      }

      const dialogRect = dialogEl.getBoundingClientRect();

      if (tourData.elementId === 'tour-search') {
        // Arrow 1: Pointing to the search inputs in the navigation header
        const targetNav = document.getElementById('tour-search');
        if (targetNav) {
          const targetRect = targetNav.getBoundingClientRect();
          const startX = dialogRect.right - (dialogRect.width * 0.15);
          const startY = dialogRect.top;
          const endX = targetRect.left + (targetRect.width / 2);
          const endY = targetRect.bottom + 12;

          const cx = startX + (endX - startX) * 0.3;
          const cy = startY - (startY - endY) * 0.85;

          paths.push(`M ${startX} ${startY} Q ${cx} ${cy} ${endX} ${endY}`);
        }

        // Arrow 2: Pointing to the search in the homepage hero box
        const targetHero = document.getElementById('tour-search-hero');
        if (targetHero) {
          const targetRect = targetHero.getBoundingClientRect();
          const startX = dialogRect.left + (dialogRect.width * 0.15);
          const startY = dialogRect.bottom;
          const endX = targetRect.left + (targetRect.width / 2);
          const endY = targetRect.top - 12;

          const cx = startX + (endX - startX) * 0.5;
          const cy = startY + (endY - startY) * 0.5;

          paths.push(`M ${startX} ${startY} Q ${cx} ${cy} ${endX} ${endY}`);
        }
      } else {
        // Default curve path
        const targetEl = document.getElementById(tourData.elementId);
        if (targetEl) {
          const targetRect = targetEl.getBoundingClientRect();
          const startX = dialogRect.left + (dialogRect.width / 2);
          const startY = targetRect.top > dialogRect.bottom ? dialogRect.bottom : dialogRect.top;
          const endX = targetRect.left + (targetRect.width / 2);
          const endY = targetRect.top > dialogRect.bottom ? targetRect.top - 12 : targetRect.bottom + 12;

          const cx = (startX + endX) / 2;
          const cy = (startY + endY) / 2 - 40;

          paths.push(`M ${startX} ${startY} Q ${cx} ${cy} ${endX} ${endY}`);
        }
      }

      setArrowPaths(paths);
    };

    updateArrows();
    window.addEventListener('resize', updateArrows);
    window.addEventListener('scroll', updateArrows, true);
    const t = setTimeout(updateArrows, 200);

    return () => {
      window.removeEventListener('resize', updateArrows);
      window.removeEventListener('scroll', updateArrows, true);
      clearTimeout(t);
    };
  }, [currentStep, tourData]);

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    if (dontShowAgain) {
      localStorage.setItem('parts_peddle_tour_done_forever', 'true');
    }
    setIsDismissed(true);
    onHighlightElement(undefined);
    onClose();
  };

  if (isDismissed) return null;

  // Render context-specific copywriting parameters detailing exact user features
  const getStepGuideDetails = () => {
    switch (currentStep) {
      case 1:
        return {
          title: "Let's start with search.",
          text: "Use the search bar to search parts with custom OEM codes, names, or vehicle VIN. Refine queries with the instant auto-completing drop-down or by choosing system categories below."
        };
      case 2:
        return {
          title: "Filter instantly by system.",
          text: "Browse components under major assemblies like Powertrain, Brakes, or Suspension to pinpoint items that precisely fit your restoration vehicle project."
        };
      case 3:
        return {
          title: "Verify extraction details.",
          text: "Check official donor vehicle diagnostics. Find verified odometer readings, engine testing log reports, authentic salvage images, and guaranteed fitment guides."
        };
      case 4:
        return {
          title: "Buy with confidence.",
          text: "Rely on regional operator ratings. We list parts exclusively from vetted salvage yards backed by money-back fitment warranties and speedy shipping."
        };
      case 5:
        return {
          title: "Secure best pricing.",
          text: "Add parts to your cart or submit custom bids instantly. Discuss fits directly with mechanics to negotiate budgets."
        };
      default:
        return {
          title: "Let's start with search.",
          text: "Use the search bar at the top to find any part, make, model, or VIN."
        };
    }
  };

  const StepGuide = getStepGuideDetails();
  const progressPercent = (videoTime / videoDuration) * 100;

  return (
    <>
      {/* Curved Indicator Arrow SVG Overlays */}
      {arrowPaths.map((path, idx) => (
        <svg key={idx} className="fixed inset-0 pointer-events-none z-[99999] w-full h-full">
          <defs>
            <marker
              id={`tour-arrowhead-${idx}`}
              markerWidth="8"
              markerHeight="6"
              refX="5"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#d48c43" />
            </marker>
          </defs>
          <path
            d={path}
            fill="none"
            stroke="#d48c43"
            strokeWidth="2.5"
            strokeLinecap="round"
            markerEnd={`url(#tour-arrowhead-${idx})`}
            className="opacity-95 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
          />
        </svg>
      ))}

      {/* Highlight stylesheet: guarantees cleanup on unmount/dismiss */}
      <style>{`
        .tour-highlight {
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1) !important;
          box-shadow: 0 0 0 3px rgba(212, 140, 67, 0.25), 0 0 20px 8px rgba(212, 140, 67, 0.55) !important;
          border-color: #d48c43 !important;
        }
      `}</style>

      {/* Main Dim Backdrop */}
      <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-[9999] p-0 sm:p-4 transition-all animate-fade-in">

        {/* Responsive dialog: full-height sheet on portrait phones, constrained card on larger screens */}
        <div
          id="guided-tour-dialog"
          className="bg-[#161617] border border-[#242426] rounded-none sm:rounded-xl w-full sm:max-w-[720px] h-full sm:h-auto sm:max-h-[90dvh] text-white shadow-[0_20px_40px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col p-0 font-sans"
        >
          {/* Close button top right */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 z-20 p-1.5 rounded-full bg-zinc-900/65 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer border border-zinc-800/40"
          >
            <X className="w-4 h-4" />
          </button>

          {/* ACTIVE WORK: FULL-WIDTH VIDEO CONTAINER (Has no border, bottom corner radius is 0) */}
          <div className="relative w-full aspect-video sm:aspect-[16/10] bg-black overflow-hidden border-none sm:rounded-t-xl rounded-b-none group shrink-0">
            
            {/* Actual HTML5 Video playing high-quality engine preview clip to showcase play capabilities */}
            <video
              ref={videoRef}
              src="https://assets.mixkit.co/videos/preview/mixkit-car-engine-running-close-up-vibe-34220-large.mp4"
              poster="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=650"
              className="w-full h-full object-cover"
              loop
              muted
              playsInline
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
            />

            {/* Translucent control bar matching mockup */}
            <div className="absolute inset-x-0 bottom-0 h-10 bg-black/65 flex items-center px-4 gap-2.5 z-10">
              {/* Play/Pause Button */}
              <button 
                onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                className="text-white hover:text-[#d48c43] transition-colors p-1 cursor-pointer"
              >
                {isVideoPlaying ? (
                  <Pause className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current" />
                )}
              </button>

              {/* Scrubber track */}
              <div 
                onClick={handleScrubberClick}
                className="flex-1 h-1 bg-white/20 rounded-full relative cursor-pointer"
              >
                <div 
                  className="absolute top-0 left-0 h-full bg-white rounded-full" 
                  style={{ width: `${progressPercent}%` }}
                ></div>
                <div 
                  className="absolute w-2.5 h-2.5 bg-white rounded-full top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all"
                  style={{ left: `${progressPercent}%` }}
                ></div>
              </div>

              {/* Timeline time countdown display */}
              <span className="font-mono text-[11px] text-white">
                {formatTime(videoTime)} / {formatTime(videoDuration)}
              </span>

              {/* Speaker icon */}
              <button className="text-zinc-450 hover:text-white p-1 cursor-pointer">
                <Volume2 className="w-3.5 h-3.5" />
              </button>

              {/* Fullscreen icon */}
              <button className="text-zinc-450 hover:text-white p-1 cursor-pointer">
                <Maximize className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Center Play Overlay when paused */}
            {!isVideoPlaying && (
              <div 
                onClick={() => setIsVideoPlaying(true)}
                className="absolute inset-0 bg-black/35 backdrop-blur-[1px] flex items-center justify-center cursor-pointer"
              >
                <div className="w-14 h-14 rounded-full bg-black/75 border border-zinc-800/80 flex items-center justify-center text-white hover:text-[#d48c43] hover:scale-105 active:scale-95 transition-all shadow-xl">
                  <Play className="w-5 h-5 fill-current translate-x-0.5" />
                </div>
              </div>
            )}
          </div>

          {/* COMPACT BOTTOM BUTTON CONTAINER BAR */}
          <div className="flex items-center justify-between p-3.5 px-5 bg-[#101011] border-t border-[#242426]">
            
            {/* Step notification element keeping navigation clear */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-medium font-sans">
                Onboarding Tour • Step <span className="text-[#d48c43] font-semibold">{currentStep} of 5</span>
              </span>
            </div>

            {/* Active action triggers */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleSkip}
                className="text-xs font-semibold text-zinc-400 hover:text-white bg-transparent hover:bg-white/[0.04] border border-[#242426] px-4 py-1.5 rounded transition-all cursor-pointer"
              >
                Skip Tour
              </button>
              <button
                onClick={handleNext}
                className="bg-[#58211a] hover:bg-[#6d2b23] text-white text-xs font-semibold px-5 py-1.5 rounded transition-all cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <span>{currentStep === 5 ? "Finish" : "Next Step"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* 
            ==================================================================
            COMMENTED COPYS & SIDEBARS CODE FOR POTENTIAL FUTURE COMPONENT REUSE 
            ==================================================================

            {/* 
            <div className="md:w-1/2 flex flex-col justify-between p-6">
              <label className="flex items-center gap-2 text-zinc-405 hover:text-zinc-300 text-xs mt-4 cursor-pointer select-none group">
                <input 
                  type="checkbox" 
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-sm flex items-center justify-center border transition-all ${
                  dontShowAgain ? 'bg-[#d48c43] border-[#d48c43] text-white' : 'border-zinc-750 bg-zinc-900 group-hover:border-zinc-550'
                }`}>
                  <svg className="w-2.5 h-2.5 stroke-[3]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span>Don't show this tour again</span>
              </label>
            </div>
            
            <div className="md:w-1/2 flex flex-col justify-between p-6">
              <div className="flex flex-col">
                <div className="flex flex-col mb-3">
                  <span className="text-[13px] text-zinc-401 font-medium">Welcome to PartsPeddle</span>
                  <span className="text-xs text-zinc-501 mt-0.5 font-mono">{currentStep} of 5</span>
                </div>
                <h1 className="text-[26px] font-bold text-white tracking-tight leading-none mb-2">
                  Hey, I’m <span className="text-[#d48c43]">Jess</span>.
                </h1>
                <p className="text-sm text-zinc-401 leading-normal mb-5 font-sans">
                  I'll show you around and help you find the parts you need faster and easier.
                </p>
                <div className="border border-[#d48c43]/40 bg-[#d48c43]/[0.03] rounded-lg p-4 flex gap-3.5 items-start">
                  <div className="w-8 h-8 rounded-full border border-[#d48c43] bg-zinc-950 flex items-center justify-center shrink-0">
                    <Search className="w-4 h-4 text-[#d48c43]" />
                  </div>
                  <div>
                    <h3 className="text-white text-sm font-semibold mb-1 leading-snug">
                      {StepGuide.title}
                    </h3>
                    <p className="text-zinc-401 text-xs leading-normal">
                      {StepGuide.text}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            */}

        </div>

      </div>
    </>
  );
}
