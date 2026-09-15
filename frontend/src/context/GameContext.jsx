import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

const GameContext = createContext();

export function GameProvider({ children }) {
  const [currentView, setCurrentView] = useState('arena'); // 'arena' | 'admin' | 'portal'
  const [p1Score, setP1Score] = useState(1450);
  const [p2Score, setP2Score] = useState(1200);
  const [p1Streak, setP1Streak] = useState(4);
  const [p2Streak, setP2Streak] = useState(1);
  const [p1Handle, setP1Handle] = useState('VALKYRIE_01');
  const [p2Handle, setP2Handle] = useState('NEXUS_CORE');
  const [activeFaction, setActiveFaction] = useState('KINETIC');
  const [arenaPin, setArenaPin] = useState('794-20');

  // Buzzer & Lock-in State
  const [buzzersArmed, setBuzzersArmed] = useState(true);
  const [isLockedIn, setIsLockedIn] = useState(false);
  const [lockedPlayer, setLockedPlayer] = useState({
    name: 'PLAYER 1 // ALEX VANCE',
    tag: 'AGENT ZERO (YOU)',
    latency: '0.142s',
    timestamp: '14:02:44.819'
  });

  // Sabotages State
  const [activeThreat, setActiveThreat] = useState({
    name: 'NONE ACTIVE',
    isActive: false,
    timeLeft: 0,
    target: '',
    sub: 'Shields nominal. No hostile modifiers.'
  });

  // Round Clock
  const [roundSeconds, setRoundSeconds] = useState(102.85);

  // Activity Stream Audit Log
  const [auditLogs, setAuditLogs] = useState([
    {
      id: 1,
      time: '14:02:44',
      category: 'LOCK EVENT',
      message: 'Buzzer resolved to Player 1 (Alex Vance) in 0.142s.',
      colorClass: 'text-signal-emerald'
    },
    {
      id: 2,
      time: '14:02:18',
      category: 'SCORE',
      message: 'Admin adjusted Player 1 points (+100).',
      colorClass: 'text-primary'
    },
    {
      id: 3,
      time: '14:01:50',
      category: 'SABOTAGE',
      message: 'Sound Distortion active on Player 1 terminal.',
      colorClass: 'text-sabotage-crimson font-bold'
    },
    {
      id: 4,
      time: '14:00:12',
      category: 'SYS',
      message: 'Round 04 initialized. Target question set: Tech Architecture.',
      colorClass: 'text-on-surface-variant'
    }
  ]);

  const threatTimerRef = useRef(null);
  const resetTimeoutRef = useRef(null);

  // Format current time
  const getFormattedTime = () => {
    const d = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  // Web Audio Synth Beep
  const playTone = (frequency = 880, duration = 0.18, type = 'sine') => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Audio play prevented', e);
    }
  };

  // Add an entry to the audit log
  const appendLog = (category, message, colorClass = 'text-primary') => {
    setAuditLogs((prev) => [
      {
        id: Date.now() + Math.random(),
        time: getFormattedTime(),
        category,
        message,
        colorClass
      },
      ...prev
    ]);
  };

  // Adjust score
  const adjustScore = (player, delta) => {
    if (player === 1) {
      setP1Score((prev) => {
        const next = prev + delta;
        appendLog('SCORE', `Admin adjusted Player 1 by ${delta > 0 ? '+' : ''}${delta} pts.`);
        return next;
      });
    } else {
      setP2Score((prev) => {
        const next = prev + delta;
        appendLog('SCORE', `Admin adjusted Player 2 by ${delta > 0 ? '+' : ''}${delta} pts.`);
        return next;
      });
    }
  };

  // Buzzer Trigger Action
  const executeBuzzIn = () => {
    if (isLockedIn || !buzzersArmed) return;

    setIsLockedIn(true);
    playTone(950, 0.22, 'triangle');

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#CCFF00', '#00FF85', '#4B00E0']
      });
    } catch (e) {}

    const latencyNum = (0.120 + Math.random() * 0.08).toFixed(3);
    const nowTime = getFormattedTime();

    setLockedPlayer({
      name: 'PLAYER 1 // AGENT ZERO',
      tag: 'YOU (AGENT ZERO)',
      latency: `${latencyNum}s`,
      timestamp: nowTime
    });

    appendLog('LOCK EVENT', `Buzzer locked by Player 1 (Agent Zero) in ${latencyNum}s! Priority acquired.`, 'text-signal-emerald font-bold');

    if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    resetTimeoutRef.current = setTimeout(() => {
      setIsLockedIn(false);
    }, 7000);
  };

  // Buzzer Controls
  const armBuzzers = () => {
    setBuzzersArmed(true);
    playTone(600, 0.1);
    appendLog('BUZZERS', 'Master circuit ARMED by Game Master.', 'text-signal-emerald');
  };

  const lockBuzzers = () => {
    setBuzzersArmed(false);
    playTone(300, 0.15, 'square');
    appendLog('BUZZERS', 'Master circuit LOCKED by Game Master.', 'text-sabotage-crimson');
  };

  const resetBuzzers = () => {
    setIsLockedIn(false);
    setLockedPlayer({
      name: 'AWAITING LOCK-IN',
      tag: 'NONE',
      latency: '0.000s',
      timestamp: '--:--:--'
    });
    playTone(700, 0.1);
    appendLog('BUZZERS', 'Hardware buffers flushed. Awaiting next buzz.', 'text-on-surface-variant');
  };

  const awardFastestAnswer = (player) => {
    adjustScore(player, 50);
    playTone(1100, 0.2);
    appendLog('ARBITRAGE', `Lock-in awarded to Player ${player} (+50 Floor points).`, 'text-signal-emerald');
  };

  const rejectLockIn = () => {
    playTone(250, 0.25, 'sawtooth');
    appendLog('ARBITRAGE', 'Lock-in attempt nullified by Game Master.', 'text-sabotage-crimson font-bold');
    setLockedPlayer({
      name: 'SIGNAL NULLIFIED',
      tag: 'FOUL',
      latency: '0.000s',
      timestamp: getFormattedTime()
    });
  };

  // Sabotage Simulation
  const deploySabotage = (name, duration, target) => {
    if (threatTimerRef.current) clearInterval(threatTimerRef.current);

    setActiveThreat({
      name: `${name.toUpperCase()} [ACTIVE]`,
      isActive: true,
      timeLeft: duration || 15,
      target,
      sub: `Tactical disruption payload deployed against ${target}.`
    });

    playTone(420, 0.3, 'sawtooth');
    appendLog('SABOTAGE', `${name} fired directly against ${target}.`, 'text-sabotage-crimson font-bold');

    let left = duration || 15;
    threatTimerRef.current = setInterval(() => {
      left -= 1;
      if (left <= 0) {
        clearInterval(threatTimerRef.current);
        setActiveThreat({
          name: 'NONE ACTIVE',
          isActive: false,
          timeLeft: 0,
          target: '',
          sub: 'Shields nominal. No hostile modifiers.'
        });
        appendLog('SYS', `Disruption expired: ${name}.`, 'text-on-surface-variant');
      } else {
        setActiveThreat((prev) => ({ ...prev, timeLeft: left }));
      }
    }, 1000);
  };

  const cancelSabotage = (name) => {
    if (threatTimerRef.current) clearInterval(threatTimerRef.current);
    setActiveThreat({
      name: 'NONE ACTIVE',
      isActive: false,
      timeLeft: 0,
      target: '',
      sub: 'Shields nominal. No hostile modifiers.'
    });
    appendLog('SYS', `Sabotage aborted manually: ${name}.`, 'text-on-surface-variant');
  };

  const clearLogs = () => {
    setAuditLogs([]);
    appendLog('SYS', 'Audit buffer cleared.', 'text-on-surface-variant');
  };

  // Keyboard shortcut listener for spacebar in Arena
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && e.target === document.body && currentView === 'arena') {
        e.preventDefault();
        executeBuzzIn();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLockedIn, buzzersArmed, currentView]);

  return (
    <GameContext.Provider
      value={{
        currentView,
        setCurrentView,
        p1Score,
        p2Score,
        p1Streak,
        p2Streak,
        p1Handle,
        setP1Handle,
        p2Handle,
        setP2Handle,
        activeFaction,
        setActiveFaction,
        arenaPin,
        setArenaPin,
        buzzersArmed,
        isLockedIn,
        lockedPlayer,
        activeThreat,
        roundSeconds,
        auditLogs,
        adjustScore,
        executeBuzzIn,
        armBuzzers,
        lockBuzzers,
        resetBuzzers,
        awardFastestAnswer,
        rejectLockIn,
        deploySabotage,
        cancelSabotage,
        clearLogs,
        playTone
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
