import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

const GameContext = createContext();

export function GameProvider({ children }) {
  const [currentView, setCurrentView] = useState('arena'); // 'arena' | 'admin' | 'portal'
  const [adminSubTab, setAdminSubTab] = useState('thalaivar'); // 'thalaivar' | 'total-comalies' | 'kanaku-valaku'

  // Connected Players & Teams Roster for "Total Comalies" & Arena
  const [players, setPlayers] = useState([
    {
      id: 1,
      name: 'Alex Vance',
      handle: 'AGENT ZERO',
      tag: 'YOU',
      lane: 'Lane #01',
      score: 1450,
      streak: 4,
      status: 'CONNECTED',
      activeSabotages: []
    },
    {
      id: 2,
      name: 'Elena Rostova',
      handle: 'VORTEX-9',
      tag: 'OPPONENT',
      lane: 'Lane #02',
      score: 1200,
      streak: 1,
      status: 'CONNECTED',
      activeSabotages: ['Sound Distortion']
    },
    {
      id: 3,
      name: 'Marcus Thorne',
      handle: 'NULL_POINTER',
      tag: 'BENCH',
      lane: 'Lane #03',
      score: 950,
      streak: 0,
      status: 'CONNECTED',
      activeSabotages: []
    },
    {
      id: 4,
      name: 'CyberSpectre',
      handle: 'CYBER_SPECTRE',
      tag: 'STANDBY',
      lane: 'Lane #04',
      score: 750,
      streak: 0,
      status: 'CONNECTED',
      activeSabotages: []
    }
  ]);

  const [p1Handle, setP1Handle] = useState('VALKYRIE_01');
  const [p2Handle, setP2Handle] = useState('NEXUS_CORE');
  const [activeFaction, setActiveFaction] = useState('KINETIC');
  const [arenaPin, setArenaPin] = useState('794-20');

  // Buzzer & Lock-in State with sequential queue
  const [buzzersArmed, setBuzzersArmed] = useState(true);
  const [isLockedIn, setIsLockedIn] = useState(false);

  const initialQueue = [
    { id: 1, playerId: 1, name: 'Alex Vance', handle: 'AGENT ZERO (YOU)', latency: '0.142s', timestamp: '14:02:44.819', rank: 1 },
    { id: 2, playerId: 2, name: 'Elena Rostova', handle: 'VORTEX-9 (OPPONENT)', latency: '0.198s', timestamp: '14:02:44.875', rank: 2 },
    { id: 3, playerId: 3, name: 'Marcus Thorne', handle: 'NULL_POINTER', latency: '0.245s', timestamp: '14:02:44.922', rank: 3 },
    { id: 4, playerId: 4, name: 'CyberSpectre', handle: 'CYBER_SPECTRE', latency: '0.312s', timestamp: '14:02:44.989', rank: 4 }
  ];

  const [buzzerQueue, setBuzzerQueue] = useState(initialQueue);
  const [queueIndex, setQueueIndex] = useState(0);

  // Active Threat / Sabotage for live arena
  const [activeThreat, setActiveThreat] = useState({
    name: 'NONE ACTIVE',
    isActive: false,
    timeLeft: 0,
    target: '',
    sub: 'Shields nominal. No hostile modifiers.'
  });

  // Round Clock
  const [roundSeconds, setRoundSeconds] = useState(102.85);

  // Kanaku Valaku (Audit Log)
  const [auditLogs, setAuditLogs] = useState([
    {
      id: 1,
      time: '14:02:44',
      category: 'LOCK EVENT',
      message: 'Buzzer resolved to Player 1 (Alex Vance) in 0.142s.',
      colorClass: 'text-signal-emerald font-bold'
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
      message: 'Sound Distortion active on Player 2 (Elena Rostova) terminal.',
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

  const getFormattedTime = () => {
    const d = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  // Web Audio Synth
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

  // Append entry to Kanaku Valaku
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

  // Adjust score of any player by ID
  const adjustPlayerScore = (playerId, delta) => {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === playerId) {
          const nextScore = p.score + delta;
          appendLog('SCORE', `Adjusted score for ${p.name} (${delta > 0 ? '+' : ''}${delta} pts). New total: ${nextScore}.`);
          return { ...p, score: nextScore };
        }
        return p;
      })
    );
  };

  // Set manual custom score for player
  const setPlayerCustomScore = (playerId, newScore) => {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === playerId) {
          appendLog('SCORE', `Admin manually set score for ${p.name} to ${newScore} pts.`);
          return { ...p, score: newScore };
        }
        return p;
      })
    );
  };

  // Legacy P1 / P2 helper wrappers
  const p1Score = players.find((p) => p.id === 1)?.score ?? 1450;
  const p2Score = players.find((p) => p.id === 2)?.score ?? 1200;
  const adjustScore = (playerNum, delta) => {
    adjustPlayerScore(playerNum, delta);
  };

  // Current active buzzer player from the queue
  const currentBuzzerWinner = buzzerQueue[queueIndex] || {
    id: 0,
    playerId: 0,
    name: 'NO FURTHER BUZZERS',
    handle: 'QUEUE EXHAUSTED',
    latency: '0.000s',
    timestamp: '--:--:--',
    rank: 0
  };

  // Step to the next player in the buzzer queue
  const advanceToNextPlayer = () => {
    if (queueIndex < buzzerQueue.length - 1) {
      const nextIndex = queueIndex + 1;
      setQueueIndex(nextIndex);
      const nextPlayer = buzzerQueue[nextIndex];
      playTone(780, 0.15);
      appendLog(
        'QUEUE ADVANCE',
        `Admin advanced to next pressed player: #${nextPlayer.rank} ${nextPlayer.name} (${nextPlayer.latency} latency).`,
        'text-acid-chartreuse font-bold'
      );
    } else {
      playTone(300, 0.2, 'sawtooth');
      appendLog('QUEUE', 'Buzzer queue reached the end. No more pressed players.', 'text-on-surface-variant');
    }
  };

  // Award floor points to current buzzer winner
  const awardFastestAnswer = (playerIdOverride) => {
    const targetPlayerId = playerIdOverride || currentBuzzerWinner.playerId || 1;
    adjustPlayerScore(targetPlayerId, 50);
    playTone(1100, 0.2);
    appendLog(
      'ARBITRAGE',
      `Floor points (+50) awarded to ${currentBuzzerWinner.name || 'Player ' + targetPlayerId}.`,
      'text-signal-emerald font-bold'
    );
  };

  // Buzzer Trigger in Arena
  const executeBuzzIn = () => {
    if (isLockedIn || !buzzersArmed) return;

    setIsLockedIn(true);
    playTone(950, 0.22, 'triangle');

    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#CCFF00', '#00FF85', '#4B00E0']
      });
    } catch (e) {}

    const latencyNum = (0.12 + Math.random() * 0.08).toFixed(3);
    const nowTime = getFormattedTime();

    // Set queue to active player first
    const updatedQueue = [
      { id: 1, playerId: 1, name: 'Alex Vance', handle: 'AGENT ZERO (YOU)', latency: `${latencyNum}s`, timestamp: nowTime, rank: 1 },
      { id: 2, playerId: 2, name: 'Elena Rostova', handle: 'VORTEX-9', latency: '0.198s', timestamp: nowTime, rank: 2 },
      { id: 3, playerId: 3, name: 'Marcus Thorne', handle: 'NULL_POINTER', latency: '0.245s', timestamp: nowTime, rank: 3 },
      { id: 4, playerId: 4, name: 'CyberSpectre', handle: 'CYBER_SPECTRE', latency: '0.312s', timestamp: nowTime, rank: 4 }
    ];
    setBuzzerQueue(updatedQueue);
    setQueueIndex(0);

    appendLog('LOCK EVENT', `Buzzer locked by Player 1 (Agent Zero) in ${latencyNum}s! Priority acquired.`, 'text-signal-emerald font-bold');

    if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    resetTimeoutRef.current = setTimeout(() => {
      setIsLockedIn(false);
    }, 7000);
  };

  const armBuzzers = () => {
    setBuzzersArmed(true);
    playTone(600, 0.1);
    appendLog('BUZZERS', 'Master circuit ARMED by Game Master.', 'text-signal-emerald');
  };

  const lockBuzzers = () => {
    setBuzzersArmed(false);
    playTone(300, 0.15, 'square');
    appendLog('BUZZERS', 'Master circuit LOCKED by Game Master.', 'text-sabotage-crimson font-bold');
  };

  const resetBuzzers = () => {
    setIsLockedIn(false);
    setQueueIndex(0);
    setBuzzerQueue([
      { id: 1, playerId: 1, name: 'Alex Vance', handle: 'AGENT ZERO', latency: '0.142s', timestamp: getFormattedTime(), rank: 1 },
      { id: 2, playerId: 2, name: 'Elena Rostova', handle: 'VORTEX-9', latency: '0.198s', timestamp: getFormattedTime(), rank: 2 },
      { id: 3, playerId: 3, name: 'Marcus Thorne', handle: 'NULL_POINTER', latency: '0.245s', timestamp: getFormattedTime(), rank: 3 }
    ]);
    playTone(700, 0.1);
    appendLog('BUZZERS', 'Hardware buffers flushed & queue reset.', 'text-on-surface-variant');
  };

  // Deploy Sabotage to a target player
  const deploySabotageToPlayer = (sabotageName, duration, targetPlayerId) => {
    const target = players.find((p) => p.id === targetPlayerId);
    const targetName = target ? target.name : `Player ${targetPlayerId}`;

    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === targetPlayerId) {
          const updatedSabotages = p.activeSabotages.includes(sabotageName)
            ? p.activeSabotages
            : [...p.activeSabotages, sabotageName];
          return { ...p, activeSabotages: updatedSabotages };
        }
        return p;
      })
    );

    setActiveThreat({
      name: `${sabotageName.toUpperCase()} [ACTIVE]`,
      isActive: true,
      timeLeft: duration || 15,
      target: targetName,
      sub: `Tactical disruption payload deployed against ${targetName}.`
    });

    playTone(420, 0.3, 'sawtooth');
    appendLog('SABOTAGE', `${sabotageName} deployed directly against ${targetName}.`, 'text-sabotage-crimson font-bold');

    if (threatTimerRef.current) clearInterval(threatTimerRef.current);
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
        appendLog('SYS', `Disruption expired: ${sabotageName} on ${targetName}.`, 'text-on-surface-variant');
      } else {
        setActiveThreat((prev) => ({ ...prev, timeLeft: left }));
      }
    }, 1000);
  };

  // Remove / Neutralize Sabotage from a player (Admin capability)
  const removeSabotageFromPlayer = (playerId, sabotageName) => {
    const player = players.find((p) => p.id === playerId);
    const playerName = player ? player.name : `Player ${playerId}`;

    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === playerId) {
          return {
            ...p,
            activeSabotages: sabotageName
              ? p.activeSabotages.filter((s) => s !== sabotageName)
              : []
          };
        }
        return p;
      })
    );

    if (activeThreat.isActive) {
      setActiveThreat({
        name: 'NONE ACTIVE',
        isActive: false,
        timeLeft: 0,
        target: '',
        sub: 'Shields nominal. Hostile modifier neutralized by Admin.'
      });
      if (threatTimerRef.current) clearInterval(threatTimerRef.current);
    }

    playTone(1050, 0.25, 'triangle');
    appendLog(
      'NEUTRALIZE',
      `Admin OVERRIDE: Removed sabotage [${sabotageName || 'ALL DISRUPTIONS'}] from ${playerName}.`,
      'text-signal-emerald font-bold'
    );
  };

  const clearLogs = () => {
    setAuditLogs([]);
    appendLog('SYS', 'Audit buffer cleared.', 'text-on-surface-variant');
  };

  // Spacebar listener for Player Arena
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
        adminSubTab,
        setAdminSubTab,
        players,
        p1Score,
        p2Score,
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
        buzzerQueue,
        queueIndex,
        currentBuzzerWinner,
        advanceToNextPlayer,
        activeThreat,
        roundSeconds,
        auditLogs,
        adjustScore,
        adjustPlayerScore,
        setPlayerCustomScore,
        executeBuzzIn,
        armBuzzers,
        lockBuzzers,
        resetBuzzers,
        awardFastestAnswer,
        deploySabotageToPlayer,
        removeSabotageFromPlayer,
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
