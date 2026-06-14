import { useEffect, useState } from 'react';
import { useScreenRecorder } from '../../hooks/useScreenRecorder';
import { openSourceSelectorWithPermissionRetry } from './openSourceSelectorFlow';
import { useAudioLevelMeter } from '../../hooks/useAudioLevelMeter';
import { AudioLevelMeter } from '../ui/audio-level-meter';

export function MainDashboard() {
  const {
    recording,
    toggleRecording,
    microphoneEnabled,
    setMicrophoneEnabled,
    microphoneDeviceId,
    webcamEnabled,
    setWebcamEnabled,
  } = useScreenRecorder();

  const [selectedSource, setSelectedSource] = useState("Screen");

  useEffect(() => {
    const checkSelectedSource = async () => {
      if (window.electronAPI) {
        const source = await window.electronAPI.getSelectedSource();
        if (source) {
          setSelectedSource(source.name);
        } else {
          setSelectedSource("Screen");
        }
      }
    };

    checkSelectedSource();
    const interval = setInterval(checkSelectedSource, 500);
    return () => clearInterval(interval);
  }, []);

  const openSourceSelector = async () => {
    if (window.electronAPI) {
      await openSourceSelectorWithPermissionRetry({
        openSourceSelector: () => window.electronAPI.openSourceSelector(),
        requestScreenAccess: () => window.electronAPI.requestScreenAccess(),
      });
    }
  };

  const { level } = useAudioLevelMeter({
    enabled: microphoneEnabled && !recording,
    deviceId: microphoneDeviceId,
  });

  return (
    <div className="bg-surface text-on-surface font-body h-screen w-screen overflow-hidden flex flex-col selection:bg-primary selection:text-surface">
      <style>
        {`
          * {
              box-shadow: none !important;
          }
          .brutal-border {
              border: 1px solid theme('colors.outline');
          }
          .brutal-border-active {
              border: 1px solid theme('colors.primary');
          }
          .scanline {
              background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.1));
              background-size: 100% 4px;
              pointer-events: none;
          }
        `}
      </style>
      
      {/* TopNavBar */}
      <nav className="bg-surface border-b border-outline-variant flex justify-between items-center px-6 h-16 w-full max-w-full z-10 shrink-0">
        <div className="flex items-center gap-8">
          <div className="text-xl font-headline font-black tracking-tighter text-primary">openscreenxbt</div>
          <div className="flex items-center gap-1 font-display font-bold text-label-lg">
            <button className="text-primary border-b-2 border-primary px-4 py-4 hover:text-primary transition-colors duration-200 scale-95 active:opacity-80">Launch</button>
            <button onClick={() => window.electronAPI?.switchToEditor?.()} className="text-on-surface-variant px-4 py-4 hover:text-primary transition-colors duration-200 scale-95 active:opacity-80 border-b-2 border-transparent">Library</button>
            <button onClick={() => window.electronAPI?.switchToEditor?.()} className="text-on-surface-variant px-4 py-4 hover:text-primary transition-colors duration-200 scale-95 active:opacity-80 border-b-2 border-transparent">Shortcuts</button>
            <button onClick={() => window.electronAPI?.switchToEditor?.()} className="text-on-surface-variant px-4 py-4 hover:text-primary transition-colors duration-200 scale-95 active:opacity-80 border-b-2 border-transparent">Settings</button>
          </div>
        </div>
        <div>
          <button className="text-on-surface-variant hover:text-primary transition-colors duration-200 scale-95 active:opacity-80 flex items-center justify-center p-2 brutal-border">
            <span className="material-symbols-outlined" data-icon="account_circle">account_circle</span>
          </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden relative">
        <div className="absolute inset-0 scanline z-50 opacity-20"></div>
        {/* Main UI Canvas */}
        <div className="flex-1 p-8 overflow-y-auto flex flex-col gap-6 relative z-10">
          <header className="flex justify-between items-end border-b border-outline pb-4">
            <div>
              <h1 className="font-headline font-black text-4xl text-on-surface tracking-tight uppercase">Capture Target</h1>
              <p className="font-label text-sm text-primary mt-2 flex items-center gap-2">
                <span className={`w-2 h-2 ${recording ? 'bg-red-500 animate-pulse' : 'bg-primary'} inline-block`}></span> 
                {recording ? 'RECORDING IN PROGRESS' : 'READY TO CAPTURE'}
              </p>
            </div>
            <div className="font-label text-xs text-on-surface-variant text-right">
              RES: 3840x2160<br/>
              FPS: 60.00
            </div>
          </header>

          {/* Target Selection Grid */}
          <div className="grid grid-cols-3 gap-4">
            <button 
              onClick={openSourceSelector}
              className={`bg-surface-container p-6 text-left relative group hover:bg-surface-variant transition-colors group ${selectedSource ? 'brutal-border-active' : 'brutal-border'}`}
            >
              {selectedSource && <div className="absolute top-0 right-0 bg-primary text-surface font-label text-xs px-2 py-1 uppercase font-bold">Active</div>}
              <span className={`material-symbols-outlined text-4xl mb-4 block transition-colors ${selectedSource ? 'text-primary' : 'text-on-surface-variant group-hover:text-on-surface'}`} data-icon="desktop_windows">desktop_windows</span>
              <h3 className={`font-headline font-bold text-xl mb-1 uppercase tracking-wider ${selectedSource ? 'text-primary' : 'text-on-surface'}`}>Select Source</h3>
              <p className="font-label text-xs text-on-surface-variant">{selectedSource}</p>
              <div className="mt-4 h-1 w-full bg-outline">
                {selectedSource && <div className="h-full bg-primary w-full"></div>}
              </div>
            </button>
          </div>

          {/* I/O Controls */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-surface-container brutal-border p-4 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-4 border-b border-outline pb-2">
                <div className="flex items-center gap-2">
                  <span className={`material-symbols-outlined ${microphoneEnabled ? 'text-on-surface' : 'text-on-surface-variant'}`} data-icon="mic_external_on">mic_external_on</span>
                  <span className={`font-headline font-bold uppercase ${microphoneEnabled ? 'text-on-surface' : 'text-on-surface-variant'}`}>Audio Input</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    checked={microphoneEnabled} 
                    onChange={(e) => !recording && setMicrophoneEnabled(e.target.checked)} 
                    disabled={recording}
                    className="sr-only peer" 
                    type="checkbox" 
                  />
                  <div className="w-11 h-6 bg-outline peer-focus:outline-none peer-focus:ring-0 peer-checked:bg-primary brutal-border after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface after:border-outline after:border after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-surface"></div>
                </label>
              </div>
              <div className="flex items-center gap-4">
                <div className="font-label text-xs text-on-surface-variant w-16">CH 1/2</div>
                <div className="flex-1 h-3 flex items-center">
                  <AudioLevelMeter level={level} className="w-full h-2" />
                </div>
              </div>
            </div>
            
            <div className="bg-surface-container brutal-border p-4 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-4 border-b border-outline pb-2">
                <div className="flex items-center gap-2">
                  <span className={`material-symbols-outlined ${webcamEnabled ? 'text-on-surface' : 'text-on-surface-variant'}`} data-icon="videocam">videocam</span>
                  <span className={`font-headline font-bold uppercase ${webcamEnabled ? 'text-on-surface' : 'text-on-surface-variant'}`}>Camera</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    checked={webcamEnabled}
                    onChange={(e) => !recording && setWebcamEnabled(e.target.checked)}
                    disabled={recording}
                    className="sr-only peer" 
                    type="checkbox" 
                  />
                  <div className="w-11 h-6 bg-outline peer-focus:outline-none peer-focus:ring-0 peer-checked:bg-primary brutal-border after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-surface-variant after:border-outline after:border after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-surface"></div>
                </label>
              </div>
              <div className="flex items-center gap-4">
                <div className="font-label text-xs text-on-surface-variant">{webcamEnabled ? 'ACTIVE SIGNAL' : 'NO SIGNAL INPUT'}</div>
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="mt-auto pt-6">
            <button 
              onClick={toggleRecording}
              className={`w-full ${recording ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-on-primary'} text-surface font-headline font-black text-2xl uppercase tracking-widest py-6 transition-colors flex items-center justify-center gap-4 active:scale-[0.99]`}
            >
              <span className="material-symbols-outlined text-3xl" data-icon="fiber_manual_record" data-weight="fill">{recording ? 'stop_circle' : 'fiber_manual_record'}</span>
              {recording ? 'Stop Recording' : 'Start Recording'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
