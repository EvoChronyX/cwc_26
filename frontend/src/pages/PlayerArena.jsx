import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

export default function PlayerArena() {
  const {
    p1Score,
    p2Score,
    buzzersArmed,
    isLockedIn,
    lockedPlayer,
    activeThreat,
    executeBuzzIn,
    deploySabotage,
    playTone
  } = useGame();

  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const questions = [
    {
      id: 'A',
      text: 'Sub-millisecond gossiping with Raft',
      num: '[1]'
    },
    {
      id: 'B',
      text: 'Bounded by RTT speed of light (CAP Theorem)',
      num: '[2]'
    },
    {
      id: 'C',
      text: 'Deterministic monotonic clock pinning',
      num: '[3]'
    },
    {
      id: 'D',
      text: 'Vector clock convergence at ingress',
      num: '[4]'
    }
  ];

  const handleSelectAnswer = (id) => {
    setSelectedAnswer(id);
    playTone(820, 0.09);
  };

  const scoreDelta = p1Score - p2Score;

  return (
    <div className="w-full pt-16 bg-background min-h-screen">
      <div className="flex flex-col w-full">
        
        {/* Live Match Telemetry Status Ribbon */}
        <section className="w-full bg-canvas-dark text-on-primary px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-4 border-b border-hairline-dark">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-signal-emerald animate-ping"></span>
              <span className="font-label-mono-sm text-label-mono-sm uppercase text-signal-emerald tracking-widest">
                TRANSMISSION: 8.4ms LATENCY
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="font-label-mono-sm text-label-mono-sm text-on-primary-container">MATCH ID:</span>
              <span className="font-label-mono-sm text-label-mono-sm text-acid-chartreuse font-bold">#ARENA-FINALS-994</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-surface-dark px-3 py-1 rounded-full">
              <span className="font-label-mono-sm text-label-mono-sm text-on-primary-container">SPECTATORS:</span>
              <span className="font-label-mono-sm text-label-mono-sm text-on-primary font-bold">1,842 LIVE</span>
            </div>
            <div className="flex items-center gap-2 bg-secondary-container text-on-secondary-fixed px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="font-label-mono-sm text-label-mono-sm uppercase font-bold tracking-wider">SYNC ENGINE: ACTIVE</span>
            </div>
          </div>
        </section>

        {/* Editorial Sub-Bar & Intro Title Block */}
        <div className="w-full px-4 sm:px-8 pt-8 pb-4 flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-hairline-light">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-surface-subtle px-3 py-1 rounded-full font-label-mono-sm text-label-mono-sm text-on-surface-variant uppercase tracking-wider">
                CHAMPIONSHIP STAGE // ARENA FEED
              </span>
              <span className="font-label-mono-sm text-label-mono-sm text-cobalt-deep font-bold tracking-widest">
                PROTOCOL 04.9
              </span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-primary tracking-tight uppercase">
              Live Player Arena <span className="text-on-surface-variant font-light">// Real-Time Confrontation</span>
            </h1>
            <p className="font-body-base text-body-base text-on-surface-variant mt-2 max-w-2xl">
              Execute fast-twitch reflex inputs, track telemetry divergence in real-time, and withstand active tactical disruption payloads routed from the Event Master engine.
            </p>
          </div>

          {/* Quick Telemetry Stats */}
          <div className="flex items-center gap-4">
            <div className="bg-surface-subtle p-4 rounded-xl flex flex-col items-start min-w-[130px]">
              <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant uppercase">ROUND CLOCK</span>
              <span className="font-label-mono-lg text-headline-md text-primary font-bold tracking-tight">01:42.85</span>
            </div>
            <div className="bg-primary text-on-primary p-4 rounded-xl flex flex-col items-start min-w-[140px] shadow-[3px_3px_0px_#CCFF00]">
              <span className="font-label-mono-sm text-label-mono-sm text-acid-chartreuse uppercase">BUZZ SENSITIVITY</span>
              <span className="font-label-mono-lg text-headline-md text-on-primary font-bold tracking-tight">0.002 SEC</span>
            </div>
          </div>
        </div>

        {/* Primary Interactive Split Grid */}
        <div className="w-full px-4 sm:px-8 py-8 grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* LEFT & CENTER: Buzzer Deck & Head-to-Head HUD (xl:col-span-8) */}
          <div className="xl:col-span-8 flex flex-col gap-8">
            
            {/* Head to Head HUD Card */}
            <div className="w-full bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-hairline-light gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-signal-emerald"></span>
                  <span className="font-label-mono-sm text-label-mono-sm text-primary uppercase font-bold tracking-wider">
                    SYNCHRONIZED HEAD-TO-HEAD HUD
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant">ROUND 03:</span>
                  <span className="bg-surface-subtle px-3 py-0.5 rounded-full font-label-mono-sm text-label-mono-sm text-primary font-bold">
                    ALGORITHM REVERSE
                  </span>
                </div>
              </div>

              {/* Split Player Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                {/* Delta Badge Floating Between Cards (Desktop) */}
                <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex-col items-center justify-center bg-primary text-acid-chartreuse px-4 py-2 rounded-full shadow-[2px_2px_0px_#CCFF00]">
                  <span className="font-label-mono-sm text-label-mono-sm tracking-tight font-bold">
                    {scoreDelta >= 0 ? `+${scoreDelta} PTS LEAD` : `${scoreDelta} PTS DEFICIT`}
                  </span>
                </div>

                {/* Player 1 (User) */}
                <div className="bg-surface-subtle rounded-xl p-6 flex flex-col justify-between relative overflow-hidden group hover:bg-surface-container transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center font-headline-md text-headline-md font-bold shadow-[2px_2px_0px_#CCFF00]">
                        P1
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-headline-md text-headline-md font-bold text-primary tracking-tight">AGENT ZERO</span>
                          <span className="bg-acid-chartreuse text-canvas-dark text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">YOU</span>
                        </div>
                        <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant uppercase">AUTH: AGT-8491-VAL</span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-signal-emerald">verified_user</span>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant uppercase">YOUR SCORE</span>
                      <span className="font-label-mono-sm text-label-mono-sm text-signal-emerald uppercase font-bold">
                        {scoreDelta >= 0 ? 'LEAD POSITION' : 'TRAILING'}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-headline-xl text-headline-xl font-bold text-primary tracking-tight">
                        {p1Score.toLocaleString()}
                      </span>
                      <span className="font-label-mono-lg text-label-mono-lg text-on-surface-variant">PTS</span>
                    </div>
                  </div>

                  {/* Micro Progress Meter */}
                  <div className="mt-6 pt-4 border-t border-hairline-light flex items-center justify-between">
                    <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant">BUZZ WIN %</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-surface-container rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: '78%' }}></div>
                      </div>
                      <span className="font-label-mono-sm text-label-mono-sm font-bold text-primary">78%</span>
                    </div>
                  </div>
                </div>

                {/* Player 2 (Opponent) */}
                <div className="bg-surface-subtle rounded-xl p-6 flex flex-col justify-between relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-surface-container-high text-primary flex items-center justify-center font-headline-md text-headline-md font-bold">
                        P2
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-headline-md text-headline-md font-bold text-primary tracking-tight">VORTEX-9</span>
                          <span className="bg-surface-container text-on-surface-variant text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">OPPONENT</span>
                        </div>
                        <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant uppercase">AUTH: AGT-2093-PAR</span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-outline">wifi_tethering</span>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant uppercase">OPPONENT SCORE</span>
                      <span className="font-label-mono-sm text-label-mono-sm text-sabotage-crimson uppercase font-bold">
                        {scoreDelta >= 0 ? `-${scoreDelta} DEFICIT` : `+${Math.abs(scoreDelta)} ADVANTAGE`}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-headline-xl text-headline-xl font-bold text-on-surface-variant tracking-tight">
                        {p2Score.toLocaleString()}
                      </span>
                      <span className="font-label-mono-lg text-label-mono-lg text-on-surface-variant">PTS</span>
                    </div>
                  </div>

                  {/* Micro Progress Meter */}
                  <div className="mt-6 pt-4 border-t border-hairline-light flex items-center justify-between">
                    <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant">BUZZ WIN %</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-surface-container rounded-full overflow-hidden">
                        <div className="bg-on-surface-variant h-full rounded-full" style={{ width: '54%' }}></div>
                      </div>
                      <span className="font-label-mono-sm text-label-mono-sm font-bold text-on-surface-variant">54%</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* MASSIVE INTERACTIVE BUZZER UNIT */}
            <div className="w-full bg-canvas-dark text-on-primary rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl flex flex-col items-center text-center">
              {/* Ambient Technical Grid Pattern Behind Buzzer */}
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#CCFF00_1px,transparent_1px)] [background-size:24px_24px]"></div>

              {/* Buzzer Status Telemetry Pill */}
              <div className="relative z-10 flex items-center gap-3 mb-8">
                <div className="flex items-center gap-2 bg-surface-dark px-5 py-2 rounded-full border border-hairline-dark">
                  <span className={`w-3 h-3 rounded-full ${isLockedIn ? 'bg-acid-chartreuse' : buzzersArmed ? 'bg-signal-emerald animate-pulse' : 'bg-sabotage-crimson'}`}></span>
                  <span className={`font-label-mono-sm text-label-mono-sm uppercase tracking-widest font-bold ${isLockedIn ? 'text-acid-chartreuse' : buzzersArmed ? 'text-signal-emerald' : 'text-sabotage-crimson'}`}>
                    {isLockedIn
                      ? 'BUZZER LOCKED // TRANSMITTED'
                      : buzzersArmed
                      ? 'BUZZER ACTIVE (READY)'
                      : 'BUZZER HARDWARE LOCKED'}
                  </span>
                </div>
                <span className="font-label-mono-sm text-label-mono-sm text-on-primary-container hidden sm:inline-block">
                  TRIGGER MODE: INSTANT INTERCEPT
                </span>
              </div>

              {/* Center Interactive Massive Button Container */}
              <div className="relative z-10 my-4 flex items-center justify-center">
                {/* Outer Pulsing Ring */}
                <div className={`absolute w-72 h-72 sm:w-88 sm:h-88 rounded-full bg-acid-chartreuse/10 pointer-events-none transition-all duration-1000 ${isLockedIn ? 'scale-125 opacity-0' : 'animate-ping'}`}></div>
                
                {/* Secondary Outer Halo Accent */}
                <div className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full border border-acid-chartreuse/30 pointer-events-none"></div>

                {/* THE ROUND BUZZER BUTTON */}
                <button
                  type="button"
                  onClick={executeBuzzIn}
                  disabled={!buzzersArmed || isLockedIn}
                  className={`relative w-56 h-56 sm:w-72 sm:h-72 rounded-full flex flex-col items-center justify-center p-6 select-none cursor-pointer focus:outline-none transition-all duration-150 active:scale-95 ${
                    isLockedIn
                      ? 'bg-surface-dark border-4 border-signal-emerald shadow-[0px_0px_50px_rgba(0,255,133,0.5)]'
                      : buzzersArmed
                      ? 'bg-primary border-4 border-acid-chartreuse shadow-[0px_0px_35px_rgba(204,255,0,0.45)] hover:shadow-[0px_0px_55px_rgba(204,255,0,0.7)]'
                      : 'bg-surface-dark border-4 border-sabotage-crimson opacity-60 cursor-not-allowed'
                  }`}
                >
                  <span className={`material-symbols-outlined text-5xl mb-2 ${isLockedIn ? 'text-signal-emerald' : 'text-acid-chartreuse'}`}>
                    {isLockedIn ? 'task_alt' : 'touch_app'}
                  </span>
                  <span className="font-headline-lg text-headline-lg font-bold text-on-primary tracking-tight leading-tight uppercase">
                    {isLockedIn ? 'LOCKED' : 'BUZZ IN'}
                  </span>
                  <span className="font-label-mono-sm text-label-mono-sm text-acid-chartreuse tracking-widest uppercase mt-1 font-bold">
                    {isLockedIn ? 'TRANSMITTED' : 'LOCK ANSWER'}
                  </span>
                  <span className="font-label-mono-sm text-[9px] text-on-primary-container tracking-wider uppercase mt-3">
                    TAP // SPACEBAR
                  </span>
                </button>
              </div>

              {/* Real-Time Feedback Banner (Dynamic) */}
              <div className="relative z-10 mt-8 w-full max-w-xl transition-all duration-300">
                {isLockedIn ? (
                  <div className="bg-primary border-2 border-acid-chartreuse rounded-2xl p-4 flex items-center justify-between gap-4 shadow-[3px_3px_0px_#CCFF00] animate-bounce">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-signal-emerald text-primary flex items-center justify-center font-bold">
                        <span className="material-symbols-outlined">bolt</span>
                      </div>
                      <div className="text-left">
                        <span className="font-headline-md text-headline-md text-acid-chartreuse font-bold block">
                          YOU LOCKED IN! ({lockedPlayer.latency})
                        </span>
                        <span className="font-body-sm text-body-sm text-on-primary">
                          Priority allocated. Waiting for Game Master ruling on Arena answer...
                        </span>
                      </div>
                    </div>
                    <span className="bg-surface-dark text-signal-emerald font-label-mono-sm text-label-mono-sm px-3 py-1 rounded-full uppercase font-bold">
                      1ST TO BUZZ
                    </span>
                  </div>
                ) : (
                  <div className="bg-surface-dark border border-hairline-dark rounded-2xl p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-acid-chartreuse text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined font-bold">timer</span>
                      </div>
                      <div className="text-left">
                        <span className="font-label-mono-sm text-label-mono-sm text-acid-chartreuse font-bold block">
                          SYSTEM READY FOR INPUT
                        </span>
                        <span className="font-body-sm text-body-sm text-on-primary-container">
                          Press now to seize response priority on current challenge question.
                        </span>
                      </div>
                    </div>
                    <span className="font-label-mono-sm text-label-mono-sm text-on-primary-container hidden sm:block">READY</span>
                  </div>
                )}
              </div>

              {/* Buzzer Micro Guidance */}
              <div className="relative z-10 mt-6 flex flex-wrap items-center justify-center gap-6 text-on-primary-container font-label-mono-sm text-label-mono-sm">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-acid-chartreuse">bolt</span>
                  FASTEST TIME REGISTERED TODAY: 0.142s
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-acid-chartreuse">lock_clock</span>
                  FALSE BUZZ PENALTY: -50 PTS
                </span>
              </div>
            </div>

            {/* Live Challenge Prompt Preview */}
            <div className="w-full bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-label-mono-sm text-label-mono-sm uppercase text-cobalt-deep font-bold tracking-widest">
                    ACTIVE QUESTION CARD #09
                  </span>
                  <span className="bg-surface-subtle px-2.5 py-0.5 rounded-full font-label-mono-sm text-label-mono-sm text-on-surface-variant font-bold">
                    VAL: 300 PTS
                  </span>
                </div>
                <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant uppercase">
                  ROUND 3 // CATEGORY: SYSTEM DESIGN
                </span>
              </div>
              <h2 className="font-headline-lg text-headline-lg text-primary font-bold tracking-tight mb-4">
                "What is the theoretical latency floor for edge synchronization in distributed decentralized state engines when subjected to partition tolerances?"
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                {questions.map((q) => {
                  const isSelected = selectedAnswer === q.id;
                  return (
                    <div
                      key={q.id}
                      onClick={() => handleSelectAnswer(q.id)}
                      className={`p-3.5 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-primary text-on-primary shadow-[2px_2px_0px_#CCFF00]'
                          : 'bg-surface-subtle hover:bg-surface-container text-primary'
                      }`}
                    >
                      <span className={`font-body-base text-body-base font-medium ${isSelected ? 'text-on-primary' : 'text-primary'}`}>
                        {q.id}. {q.text}
                      </span>
                      <span className={`font-label-mono-sm text-label-mono-sm font-bold ${isSelected ? 'text-acid-chartreuse' : 'text-on-surface-variant'}`}>
                        {q.num}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT: Tactical Sabotages & Real-Time Standings (xl:col-span-4) */}
          <div className="xl:col-span-4 flex flex-col gap-8">
            
            {/* Synchronized Sabotages Deck */}
            <div className="w-full bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-hairline-light">
                <div>
                  <span className="font-label-mono-sm text-label-mono-sm text-primary uppercase font-bold tracking-widest block">
                    TACTICAL SABOTAGES DECK
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Synchronized live with Event Admin payload state
                  </span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant">security</span>
              </div>

              {/* Incoming Sabotage Threat Monitor */}
              <div className={`p-4 rounded-xl mb-6 flex items-center justify-between transition-colors ${
                activeThreat.isActive ? 'bg-error-container' : 'bg-surface-subtle'
              }`}>
                <div className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full ${activeThreat.isActive ? 'bg-sabotage-crimson animate-ping' : 'bg-signal-emerald'}`}></span>
                  <div>
                    <span className={`font-label-mono-sm text-label-mono-sm uppercase font-bold block ${
                      activeThreat.isActive ? 'text-sabotage-crimson' : 'text-primary'
                    }`}>
                      {activeThreat.name}
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      {activeThreat.sub}
                    </span>
                  </div>
                </div>
                <span className={`font-label-mono-sm text-label-mono-sm font-bold ${
                  activeThreat.isActive ? 'text-sabotage-crimson' : 'text-on-surface-variant'
                }`}>
                  00:{activeThreat.timeLeft < 10 ? `0${activeThreat.timeLeft}` : activeThreat.timeLeft}
                </span>
              </div>

              {/* 6 Synchronized Sabotage Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3">
                {/* Sabotage 1: Static Blind */}
                <div className="p-3.5 rounded-xl bg-surface-subtle flex flex-col gap-1.5 hover:bg-surface-container transition-colors group">
                  <div className="flex items-center justify-between">
                    <span className="font-headline-md text-body-lead font-bold text-primary tracking-tight">Static Blind</span>
                    <span className="bg-primary text-on-primary font-label-mono-sm text-[10px] px-2 py-0.5 rounded-full uppercase">DEF 15s</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Obscures challenge prompt with high-gain CRT static distortion.</p>
                  <div className="flex items-center justify-between pt-1 font-label-mono-sm text-label-mono-sm">
                    <span className="text-on-surface-variant">STATUS:</span>
                    <span className="text-signal-emerald font-bold uppercase">ARMED // READY</span>
                  </div>
                </div>

                {/* Sabotage 2: Reverse Controls */}
                <div className="p-3.5 rounded-xl bg-surface-subtle flex flex-col gap-1.5 hover:bg-surface-container transition-colors group">
                  <div className="flex items-center justify-between">
                    <span className="font-headline-md text-body-lead font-bold text-primary tracking-tight">Reverse Controls</span>
                    <span className="bg-primary text-on-primary font-label-mono-sm text-[10px] px-2 py-0.5 rounded-full uppercase">DEF 12s</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Flips answer key quadrants (A-D inversion, arrow mappings).</p>
                  <div className="flex items-center justify-between pt-1 font-label-mono-sm text-label-mono-sm">
                    <span className="text-on-surface-variant">STATUS:</span>
                    <span className="text-signal-emerald font-bold uppercase">ARMED // READY</span>
                  </div>
                </div>

                {/* Sabotage 3: Sound Distortion */}
                <div className="p-3.5 rounded-xl bg-surface-subtle flex flex-col gap-1.5 hover:bg-surface-container transition-colors group">
                  <div className="flex items-center justify-between">
                    <span className="font-headline-md text-body-lead font-bold text-primary tracking-tight">Sound Distortion</span>
                    <span className="bg-primary text-on-primary font-label-mono-sm text-[10px] px-2 py-0.5 rounded-full uppercase">DEF 10s</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Plays discordant binaural noise pulses through headset stream.</p>
                  <div className="flex items-center justify-between pt-1 font-label-mono-sm text-label-mono-sm">
                    <span className="text-on-surface-variant">STATUS:</span>
                    <span className="text-signal-emerald font-bold uppercase">ARMED // READY</span>
                  </div>
                </div>

                {/* Sabotage 4: Buzzer Jammer */}
                <div className="p-3.5 rounded-xl bg-surface-subtle flex flex-col gap-1.5 hover:bg-surface-container transition-colors group">
                  <div className="flex items-center justify-between">
                    <span className="font-headline-md text-body-lead font-bold text-primary tracking-tight">Buzzer Jammer</span>
                    <span className="bg-sabotage-crimson text-on-primary font-label-mono-sm text-[10px] px-2 py-0.5 rounded-full uppercase">CRITICAL</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Adds a 650ms synthetic input jitter to target buzzer trigger.</p>
                  <div className="flex items-center justify-between pt-1 font-label-mono-sm text-label-mono-sm">
                    <span className="text-on-surface-variant">STATUS:</span>
                    <span className="text-sabotage-crimson font-bold uppercase">ADMIN COOLDOWN (34s)</span>
                  </div>
                </div>

                {/* Sabotage 5: Double Risk */}
                <div className="p-3.5 rounded-xl bg-surface-subtle flex flex-col gap-1.5 hover:bg-surface-container transition-colors group">
                  <div className="flex items-center justify-between">
                    <span className="font-headline-md text-body-lead font-bold text-primary tracking-tight">Double Risk</span>
                    <span className="bg-cobalt-deep text-on-primary font-label-mono-sm text-[10px] px-2 py-0.5 rounded-full uppercase">2X MULT</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Doubles both point gain and point penalty for next locked submission.</p>
                  <div className="flex items-center justify-between pt-1 font-label-mono-sm text-label-mono-sm">
                    <span className="text-on-surface-variant">STATUS:</span>
                    <span className="text-signal-emerald font-bold uppercase">ARMED // READY</span>
                  </div>
                </div>

                {/* Sabotage 6: Time Drain */}
                <div className="p-3.5 rounded-xl bg-surface-subtle flex flex-col gap-1.5 hover:bg-surface-container transition-colors group">
                  <div className="flex items-center justify-between">
                    <span className="font-headline-md text-body-lead font-bold text-primary tracking-tight">Time Drain</span>
                    <span className="bg-primary text-on-primary font-label-mono-sm text-[10px] px-2 py-0.5 rounded-full uppercase">-5 SEC</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Instantly accelerates target's answer countdown clock.</p>
                  <div className="flex items-center justify-between pt-1 font-label-mono-sm text-label-mono-sm">
                    <span className="text-on-surface-variant">STATUS:</span>
                    <span className="text-signal-emerald font-bold uppercase">ARMED // READY</span>
                  </div>
                </div>
              </div>

              {/* Interactive Test Sabotage Trigger */}
              <button
                type="button"
                onClick={() => deploySabotage('Static Blind', 15, 'Player 1 (Agent Zero)')}
                className="mt-4 w-full bg-surface-subtle hover:bg-surface-container-high text-primary font-label-mono-sm text-label-mono-sm py-2.5 rounded-lg transition-colors uppercase font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">sensors</span> Simulate Incoming Payload
              </button>
            </div>

            {/* Quick Session Visualizer (SVG Sparkline) */}
            <div className="w-full bg-canvas-dark text-on-primary rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="font-label-mono-sm text-label-mono-sm uppercase text-acid-chartreuse font-bold tracking-widest">
                  BUZZ VELOCITY PROFILE
                </span>
                <span className="font-label-mono-sm text-label-mono-sm text-on-primary-container">PAST 5 ROUNDS</span>
              </div>
              
              {/* Inline SVG Sparkline for reaction latency */}
              <div className="w-full h-20 mb-3">
                <svg className="w-full h-full text-acid-chartreuse" fill="none" preserveAspectRatio="none" viewBox="0 0 300 80">
                  <path d="M 0 60 L 50 45 L 100 52 L 150 20 L 200 35 L 250 15 L 300 10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></path>
                  <path d="M 0 60 L 50 45 L 100 52 L 150 20 L 200 35 L 250 15 L 300 10 L 300 80 L 0 80 Z" fill="currentColor" fillOpacity="0.1"></path>
                  <circle className="animate-pulse" cx="150" cy="20" fill="#CCFF00" r="4"></circle>
                  <circle cx="300" cy="10" fill="#00FF85" r="4"></circle>
                </svg>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-hairline-dark font-label-mono-sm text-label-mono-sm">
                <span className="text-on-primary-container">PEAK SPRINT SPEED</span>
                <span className="text-on-primary font-bold">0.184s (RECORD PACE)</span>
              </div>
            </div>

          </div>
        </div>

        {/* LIVE MATCH LEADERBOARD SECTION */}
        <section className="w-full px-4 sm:px-8 py-8 border-t border-hairline-light bg-surface">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-signal-emerald"></span>
                <span className="font-label-mono-sm text-label-mono-sm uppercase text-on-surface-variant font-bold tracking-widest">
                  GLOBAL STANDINGS // SYNCHRONIZED
                </span>
              </div>
              <h2 className="font-headline-lg text-headline-lg text-primary uppercase font-bold tracking-tight">
                Live Match Leaderboard
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant uppercase">SORTED BY:</span>
              <span className="bg-primary text-on-primary px-3 py-1 rounded-full font-label-mono-sm text-label-mono-sm uppercase font-bold">
                TOTAL SCORE (PTS)
              </span>
            </div>
          </div>

          {/* Leaderboard Table Container */}
          <div className="w-full overflow-x-auto rounded-2xl bg-surface-container-lowest shadow-sm">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-hairline-light bg-surface-subtle font-label-mono-sm text-label-mono-sm text-on-surface-variant uppercase">
                  <th className="py-4 px-6">RANK</th>
                  <th className="py-4 px-6">PLAYER // AGENT</th>
                  <th className="py-4 px-6">R1 SCORE</th>
                  <th className="py-4 px-6">R2 SCORE</th>
                  <th className="py-4 px-6">R3 (LIVE)</th>
                  <th className="py-4 px-6">TOTAL PTS</th>
                  <th className="py-4 px-6">BUZZ WIN %</th>
                  <th className="py-4 px-6 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline-light font-body-base text-body-base">
                {/* Rank 1: Current User */}
                <tr className="bg-surface-subtle/50 hover:bg-surface-subtle transition-colors">
                  <td className="py-4 px-6 font-label-mono-lg text-label-mono-lg font-bold text-primary">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-acid-chartreuse text-canvas-dark text-xs font-bold">
                      #01
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-xs">
                        P1
                      </div>
                      <div>
                        <span className="font-bold text-primary flex items-center gap-1.5">
                          AGENT ZERO 
                          <span className="bg-acid-chartreuse text-canvas-dark text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">YOU</span>
                        </span>
                        <span className="font-label-mono-sm text-[10px] text-on-surface-variant uppercase">AGT-8491-VAL</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-label-mono-sm text-label-mono-sm">450</td>
                  <td className="py-4 px-6 font-label-mono-sm text-label-mono-sm">600</td>
                  <td className="py-4 px-6 font-label-mono-sm text-label-mono-sm text-signal-emerald font-bold">+{p1Score - 1050}</td>
                  <td className="py-4 px-6 font-headline-md text-headline-md font-bold text-primary">{p1Score.toLocaleString()}</td>
                  <td className="py-4 px-6 font-label-mono-sm text-label-mono-sm font-bold text-primary">78%</td>
                  <td className="py-4 px-6 text-right">
                    <span className="inline-block bg-primary text-acid-chartreuse px-2.5 py-0.5 rounded-full font-label-mono-sm text-[10px] font-bold uppercase">
                      LOCKED &amp; READY
                    </span>
                  </td>
                </tr>

                {/* Rank 2: Vortex-9 */}
                <tr className="hover:bg-surface-subtle transition-colors">
                  <td className="py-4 px-6 font-label-mono-lg text-label-mono-lg font-bold text-on-surface-variant">#02</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-surface-container text-primary flex items-center justify-center font-bold text-xs">
                        P2
                      </div>
                      <div>
                        <span className="font-bold text-primary">VORTEX-9</span>
                        <span className="font-label-mono-sm text-[10px] text-on-surface-variant block uppercase">AGT-2093-PAR</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-label-mono-sm text-label-mono-sm">500</td>
                  <td className="py-4 px-6 font-label-mono-sm text-label-mono-sm">450</td>
                  <td className="py-4 px-6 font-label-mono-sm text-label-mono-sm text-on-surface-variant font-bold">+{p2Score - 950}</td>
                  <td className="py-4 px-6 font-headline-md text-headline-md font-bold text-on-surface-variant">{p2Score.toLocaleString()}</td>
                  <td className="py-4 px-6 font-label-mono-sm text-label-mono-sm font-bold text-on-surface-variant">54%</td>
                  <td className="py-4 px-6 text-right">
                    <span className="inline-block bg-surface-subtle text-on-surface-variant px-2.5 py-0.5 rounded-full font-label-mono-sm text-[10px] uppercase">
                      CONTENDING
                    </span>
                  </td>
                </tr>

                {/* Rank 3: NullPointer */}
                <tr className="hover:bg-surface-subtle transition-colors">
                  <td className="py-4 px-6 font-label-mono-lg text-label-mono-lg font-bold text-on-surface-variant">#03</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-surface-container text-primary flex items-center justify-center font-bold text-xs">
                        P3
                      </div>
                      <div>
                        <span className="font-bold text-primary">NULL_POINTER</span>
                        <span className="font-label-mono-sm text-[10px] text-on-surface-variant block uppercase">AGT-7712-BER</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-label-mono-sm text-label-mono-sm">400</td>
                  <td className="py-4 px-6 font-label-mono-sm text-label-mono-sm">350</td>
                  <td className="py-4 px-6 font-label-mono-sm text-label-mono-sm text-on-surface-variant font-bold">+200</td>
                  <td className="py-4 px-6 font-headline-md text-headline-md font-bold text-on-surface-variant">950</td>
                  <td className="py-4 px-6 font-label-mono-sm text-label-mono-sm font-bold text-on-surface-variant">42%</td>
                  <td className="py-4 px-6 text-right">
                    <span className="inline-block bg-surface-subtle text-on-surface-variant px-2.5 py-0.5 rounded-full font-label-mono-sm text-[10px] uppercase">
                      ACTIVE
                    </span>
                  </td>
                </tr>

                {/* Rank 4: CyberSpectre */}
                <tr className="hover:bg-surface-subtle transition-colors">
                  <td className="py-4 px-6 font-label-mono-lg text-label-mono-lg font-bold text-on-surface-variant">#04</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-surface-container text-primary flex items-center justify-center font-bold text-xs">
                        P4
                      </div>
                      <div>
                        <span className="font-bold text-primary">CYBER_SPECTRE</span>
                        <span className="font-label-mono-sm text-[10px] text-on-surface-variant block uppercase">AGT-4019-NYC</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-label-mono-sm text-label-mono-sm">300</td>
                  <td className="py-4 px-6 font-label-mono-sm text-label-mono-sm">300</td>
                  <td className="py-4 px-6 font-label-mono-sm text-label-mono-sm text-on-surface-variant font-bold">+150</td>
                  <td className="py-4 px-6 font-headline-md text-headline-md font-bold text-on-surface-variant">750</td>
                  <td className="py-4 px-6 font-label-mono-sm text-label-mono-sm font-bold text-on-surface-variant">36%</td>
                  <td className="py-4 px-6 text-right">
                    <span className="inline-block bg-surface-subtle text-on-surface-variant px-2.5 py-0.5 rounded-full font-label-mono-sm text-[10px] uppercase">
                      STANDBY
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Global Footer */}
        <footer className="w-full bg-surface-subtle py-space-lg">
          <div className="w-full px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-sm">
              <span className="font-headline-md text-headline-md tracking-tight font-bold text-primary">CLASH // EVENT ARENA</span>
              <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant">AFTERNOW ARCHITECTURE</span>
            </div>
            <div className="flex items-center gap-space-lg">
              <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant uppercase">HIGH-FREQUENCY TELEMETRY ENGINE</span>
              <span className="font-label-mono-sm text-label-mono-sm text-primary font-bold">© 2025 CLASH PROTOCOL. ALL RIGHTS RESERVED.</span>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
