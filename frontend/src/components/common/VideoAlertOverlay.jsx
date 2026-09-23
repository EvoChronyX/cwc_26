import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Cyberpunk Video Alert & Picture-in-Picture Tactical Overlay
 * 
 * Works across desktop and Linux systems (X11 / Wayland) to ensure players
 * are notified of sabotages, power-ups, shields, and reflections even when
 * coding in external windows like VS Code.
 */
export function VideoAlertOverlay({
  alertData, // { isOpen, type, title, subtitle, videoUrl, fallbackTheme, duration, timeLeft, target, attacker, isVictim, color, accentColor, icon }
  onDismiss,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [videoError, setVideoError] = useState(false);
  const [isPipActive, setIsPipActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [remainingTime, setRemainingTime] = useState(alertData?.timeLeft || alertData?.duration || 15);
  const animationFrameRef = useRef(null);

  const themeColor = alertData?.color || '#FF2A3B';
  const accentColor = alertData?.accentColor || '#CCFF00';
  const fallbackTheme = alertData?.fallbackTheme || 'matrix';

  // Synchronize remaining time
  useEffect(() => {
    if (alertData?.timeLeft !== undefined) {
      setRemainingTime(alertData.timeLeft);
    }
  }, [alertData?.timeLeft]);

  // Local 1-second countdown ticker
  useEffect(() => {
    if (!alertData?.isOpen || remainingTime <= 0) return;

    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [alertData?.isOpen, remainingTime]);

  // Web Audio Tactical Alarm Synthesizer
  const playTacticalAlarm = useCallback((freq = 300, isVictim = true) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = isVictim ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      if (isVictim) {
        // Warping siren effect for sabotage victim
        osc.frequency.linearRampToValueAtTime(freq * 1.6, audioCtx.currentTime + 0.25);
        osc.frequency.linearRampToValueAtTime(freq, audioCtx.currentTime + 0.5);
      } else {
        // Upward chord for power-up
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, audioCtx.currentTime + 0.35);
      }

      gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.55);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.55);
    } catch (e) {
      console.warn('Audio alarm blocked by browser policy:', e);
    }
  }, []);

  // Trigger alarm on open
  useEffect(() => {
    if (alertData?.isOpen) {
      setVideoError(false);
      setIsMinimized(false);
      const freq = alertData.type === 'SABOTAGE' ? 240 : 800;
      playTacticalAlarm(freq, alertData.isVictim);
    }
  }, [alertData?.isOpen, alertData?.type, alertData?.isVictim, playTacticalAlarm]);

  // Request Picture-in-Picture (Always-On-Top in Linux and Windows over VS Code)
  const togglePictureInPicture = async () => {
    try {
      if (!videoRef.current) return;

      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPipActive(false);
      } else if (document.pictureInPictureEnabled) {
        // Ensure video is playing before requesting PiP
        await videoRef.current.play().catch(() => {});
        await videoRef.current.requestPictureInPicture();
        setIsPipActive(true);
      }
    } catch (err) {
      console.warn('PiP error or unsupported:', err);
    }
  };

  // Picture-in-Picture state listener
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnterPip = () => setIsPipActive(true);
    const handleLeavePip = () => setIsPipActive(false);

    video.addEventListener('enterpictureinpicture', handleEnterPip);
    video.addEventListener('leavepictureinpicture', handleLeavePip);

    return () => {
      video.removeEventListener('enterpictureinpicture', handleEnterPip);
      video.removeEventListener('leavepictureinpicture', handleLeavePip);
    };
  }, []);

  // Stream animated canvas into video element for PiP support during fallback mode
  useEffect(() => {
    if (!alertData?.isOpen) return;
    if (videoError || !alertData?.videoUrl) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (canvas && video && typeof canvas.captureStream === 'function') {
        try {
          const stream = canvas.captureStream(30);
          video.srcObject = stream;
          video.play().catch(() => {});
        } catch (e) {
          console.warn('Canvas captureStream error:', e);
        }
      }
    } else if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject = null;
    }
  }, [alertData?.isOpen, videoError, alertData?.videoUrl]);

  // Cyberpunk Canvas Fallback Animation
  useEffect(() => {
    if (!alertData?.isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 640);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 360);

    const particles = [];
    const particleCount = 45;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: fallbackTheme === 'freeze' ? Math.random() * 0.8 + 0.2 : (Math.random() - 0.5) * 1.5,
        size: Math.random() * 3 + 1,
        alpha: Math.random() * 0.8 + 0.2,
      });
    }

    let frame = 0;
    const render = () => {
      frame++;
      ctx.fillStyle = fallbackTheme === 'blackout' ? 'rgba(5, 5, 8, 0.35)' : 'rgba(10, 14, 23, 0.25)';
      ctx.fillRect(0, 0, width, height);

      // Draw Grid / Hex background
      ctx.strokeStyle = fallbackTheme === 'blackout' ? 'rgba(255, 42, 59, 0.08)' : 'rgba(0, 255, 133, 0.06)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.fillStyle = themeColor;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // Animated Center Radar Ring
      const cx = width / 2;
      const cy = height / 2;
      const radius = (Math.sin(frame * 0.05) * 20 + 80) % (width / 3);

      ctx.strokeStyle = themeColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(10, radius), 0, Math.PI * 2);
      ctx.stroke();

      // Scanning sweep line
      const angle = (frame * 0.04) % (Math.PI * 2);
      ctx.strokeStyle = accentColor;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * (width / 2.5), cy + Math.sin(angle) * (width / 2.5));
      ctx.stroke();

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [alertData?.isOpen, fallbackTheme, themeColor, accentColor]);

  if (!alertData?.isOpen) return null;

  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Minimized Floating Pill Mode
  if (isMinimized) {
    return (
      <div
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-surface-dark border-2 cursor-pointer shadow-[0_0_30px_rgba(0,0,0,0.8)] flex items-center gap-4 transition-transform hover:scale-105"
        style={{ borderColor: themeColor }}
      >
        <span className="w-3.5 h-3.5 rounded-full animate-ping" style={{ backgroundColor: themeColor }}></span>
        <div>
          <span className="font-label-mono-sm text-[11px] font-bold block" style={{ color: themeColor }}>
            {alertData.title}
          </span>
          <span className="font-headline-lg text-lg font-black text-white">{timeFormatted}</span>
        </div>
        <span className="material-symbols-outlined text-white text-xl ml-2">open_in_full</span>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 transition-all duration-300">
      {/* Container Card */}
      <div
        className="relative w-full max-w-4xl bg-surface-dark border-2 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.9)] flex flex-col"
        style={{ borderColor: themeColor }}
      >
        {/* Top Progress Bar */}
        {alertData.duration > 0 && (
          <div className="w-full h-1.5 bg-surface-subtle overflow-hidden">
            <div
              className="h-full transition-all duration-1000 ease-linear"
              style={{
                width: `${Math.min(100, (remainingTime / alertData.duration) * 100)}%`,
                backgroundColor: themeColor,
              }}
            ></div>
          </div>
        )}

        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-hairline-dark flex items-center justify-between gap-4 bg-canvas-dark/60">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
              style={{ backgroundColor: `${themeColor}25`, color: themeColor, border: `1px solid ${themeColor}60` }}
            >
              <span className="material-symbols-outlined text-2xl">{alertData.icon || 'warning'}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-label-mono-sm font-black uppercase tracking-widest"
                  style={{ backgroundColor: themeColor, color: '#000' }}
                >
                  {alertData.type || 'TACTICAL ALERT'}
                </span>
                {alertData.isVictim && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-label-mono-sm font-black uppercase bg-sabotage-crimson text-white">
                    SQUAD TARGETED
                  </span>
                )}
              </div>
              <h2 className="font-headline-lg text-lg sm:text-xl font-bold text-white uppercase tracking-tight mt-0.5">
                {alertData.title}
              </h2>
            </div>
          </div>

          {/* Action buttons (PiP, Mute, Minimize, Close) */}
          <div className="flex items-center gap-2">
            {/* Always-on-top PiP Button for Linux & Windows (Over VS Code) */}
            <button
              type="button"
              onClick={togglePictureInPicture}
              title="Pin Video Always-on-Top over VS Code (Picture-in-Picture)"
              className="px-3 py-1.5 rounded-xl bg-surface-subtle hover:bg-surface-container border border-hairline-light text-white font-label-mono-sm text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-base">
                {isPipActive ? 'pip_exit' : 'picture_in_picture_alt'}
              </span>
              <span className="hidden sm:inline">
                {isPipActive ? 'Exit PiP' : 'Pin Over VS Code'}
              </span>
            </button>

            {/* Mute Audio Toggle */}
            <button
              type="button"
              onClick={() => {
                setIsMuted(!isMuted);
                if (videoRef.current) videoRef.current.muted = !isMuted;
              }}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              className="p-2 rounded-xl bg-surface-subtle hover:bg-surface-container border border-hairline-light text-white cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-lg">
                {isMuted ? 'volume_off' : 'volume_up'}
              </span>
            </button>

            {/* Minimize to Corner Pill */}
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              title="Minimize to floating pill"
              className="p-2 rounded-xl bg-surface-subtle hover:bg-surface-container border border-hairline-light text-white cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close_fullscreen</span>
            </button>

            {/* Dismiss / Close Button */}
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                title="Dismiss Alert"
                className="p-2 rounded-xl bg-surface-subtle hover:bg-sabotage-crimson/30 border border-hairline-light hover:border-sabotage-crimson text-white cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Media Display Area (Video with Fallback Cyberpunk Canvas) */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
          {/* Video Player (Always mounted to support PiP in both MP4 and Canvas Stream modes) */}
          <video
            ref={videoRef}
            src={alertData.videoUrl && !videoError ? alertData.videoUrl : undefined}
            autoPlay
            loop={alertData.duration > 0}
            muted={isMuted}
            playsInline
            onError={() => {
              console.warn('Video failed to load or not yet placed at:', alertData.videoUrl);
              setVideoError(true);
            }}
            className={videoError || !alertData.videoUrl ? 'hidden' : 'w-full h-full object-contain'}
          />

          {/* Cyberpunk Canvas Fallback when MP4 is not yet present */}
          {(videoError || !alertData.videoUrl) && (
            <canvas ref={canvasRef} className="w-full h-full object-cover" />
          )}

          {/* Fallback Watermark & HUD Badge */}
          {videoError && (
            <div className="absolute top-4 left-4 px-3 py-1 rounded bg-black/70 border border-hairline-dark font-label-mono-sm text-[11px] text-acid-chartreuse flex items-center gap-1.5 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-acid-chartreuse animate-pulse"></span>
              CYBER HUD SIMULATOR • PLACE MP4 IN {alertData.videoUrl}
            </div>
          )}

          {/* Central Monospace Countdown HUD for Duration-based Sabotages */}
          {alertData.duration > 0 && (
            <div className="absolute bottom-6 right-6 px-5 py-3 rounded-2xl bg-black/80 border border-hairline-dark backdrop-blur-md flex items-center gap-3 shadow-2xl">
              <div>
                <span className="font-label-mono-sm text-[9px] uppercase tracking-wider text-on-surface-variant block font-bold">
                  DURATION REMAINING
                </span>
                <span className="font-headline-lg text-2xl sm:text-3xl font-black" style={{ color: themeColor }}>
                  {timeFormatted}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Banner with Context & Info */}
        <div className="p-4 sm:p-6 border-t border-hairline-dark bg-canvas-dark/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1 max-w-xl">
            <span className="font-label-mono-sm text-xs text-on-surface-variant font-bold uppercase tracking-wider">
              TACTICAL STATUS TELEMETRY
            </span>
            <p className="font-body-base text-sm text-white/90 leading-snug">
              {alertData.subtitle}
            </p>
            {(alertData.attacker || alertData.target) && (
              <div className="flex items-center gap-3 mt-1 font-label-mono-sm text-xs font-bold">
                {alertData.attacker && (
                  <span className="text-on-surface-variant">
                    Attacker: <span className="text-acid-chartreuse">{alertData.attacker}</span>
                  </span>
                )}
                {alertData.target && (
                  <span className="text-on-surface-variant">
                    Target: <span className="text-sabotage-crimson">{alertData.target}</span>
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePictureInPicture}
              className="py-2.5 px-5 rounded-xl font-label-mono-sm text-xs uppercase font-bold tracking-wider text-black bg-acid-chartreuse hover:bg-signal-emerald transition-all shadow-[2px_2px_0px_#000] cursor-pointer flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">picture_in_picture_alt</span>
              <span>Keep on Screen (PiP)</span>
            </button>
            <button
              type="button"
              onClick={onDismiss || (() => setIsMinimized(true))}
              className="py-2.5 px-4 rounded-xl font-label-mono-sm text-xs uppercase font-bold tracking-wider text-white bg-surface-subtle hover:bg-surface-container border border-hairline-light transition-all cursor-pointer"
            >
              Dismiss to HUD
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
