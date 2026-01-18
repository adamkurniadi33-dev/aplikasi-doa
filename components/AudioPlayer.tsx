
import React, { useState } from 'react';
import { geminiService, decodeBase64, decodeAudioData } from '../services/geminiService';

interface AudioPlayerProps {
  text: string;
  label?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ text, label }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePlay = async () => {
    if (isPlaying || isLoading) return;
    
    setIsLoading(true);
    try {
      const base64Audio = await geminiService.speakPrayer(text);
      if (base64Audio) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const decoded = decodeBase64(base64Audio);
        const audioBuffer = await decodeAudioData(decoded, audioContext, 24000, 1);
        
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        
        source.onended = () => {
          setIsPlaying(false);
          audioContext.close();
        };

        setIsPlaying(true);
        source.start();
      }
    } catch (err) {
      console.error(err);
      alert("Maaf, pemutaran audio gagal.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePlay}
      disabled={isLoading || isPlaying}
      className={`relative group flex items-center justify-center transition-all duration-500 rounded-full ${
        label ? 'px-6 py-3 bg-emerald-900 text-white shadow-xl shadow-emerald-900/20' : 'w-14 h-14 bg-emerald-950 text-white shadow-2xl shadow-emerald-950/30'
      } hover:scale-105 active:scale-95 disabled:opacity-50`}
      title={label || "Dengarkan Doa"}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-white/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {label && <span className="text-xs font-bold uppercase tracking-widest">Menyiapkan...</span>}
        </div>
      ) : isPlaying ? (
        <div className="flex items-center gap-2">
          <div className="flex gap-1 h-3 items-end">
            <div className="w-1 bg-white animate-[bounce_1s_infinite]"></div>
            <div className="w-1 bg-white animate-[bounce_1.2s_infinite]"></div>
            <div className="w-1 bg-white animate-[bounce_0.8s_infinite]"></div>
          </div>
          {label && <span className="text-xs font-bold uppercase tracking-widest">Sedang Dibaca</span>}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <svg className={`${label ? 'w-5 h-5' : 'w-6 h-6'} transition-transform group-hover:scale-110`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          {label && <span className="text-xs font-bold uppercase tracking-widest">{label}</span>}
        </div>
      )}
    </button>
  );
};

export default AudioPlayer;
