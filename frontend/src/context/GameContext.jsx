import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

const GameContext = createContext();

export function GameProvider({ children }) {
  const getInitialView = () => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (['portal', 'arena', 'admin'].includes(hash)) return hash;
    }
    return 'arena'; // Default directly to Namma Area so user immediately sees Namma Area
  };

  const [currentView, setCurrentViewState] = useState(getInitialView);
  const setCurrentView = (view) => {
    setCurrentViewState(view);
    if (typeof window !== 'undefined') {
      window.location.hash = view;
    }
  };

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (['portal', 'arena', 'admin'].includes(hash)) {
        setCurrentViewState(hash);
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const [adminSubTab, setAdminSubTab] = useState('thalaivar'); // 'thalaivar' | 'total-comalies' | 'kanaku-valaku'
  const [nammaAreaSubTab, setNammaAreaSubTab] = useState('kootani'); // 'kootani' | 'mani-adi' | 'power-up-pothys'

  // Team Registration Details
  const [teamName, setTeamName] = useState('TEAM KINETIC');
  const [p1Handle, setP1Handle] = useState('VALKYRIE_01');
  const [p2Handle, setP2Handle] = useState('NEXUS_CORE');
  const [activeFaction, setActiveFaction] = useState('KINETIC');
  const [arenaPin, setArenaPin] = useState('794-20');

  // Connected Teams Roster (Each team consists of 2 players)
  const [teams, setTeams] = useState([
    {
      id: 1,
      teamName: 'TEAM KINETIC',
      p1: 'Alex Vance',
      p2: 'Sarah Connor',
      handle: 'AGENT ZERO // VALKYRIE_01',
      tag: 'YOUR TEAM',
      lane: 'Lane #01',
      score: 1450,
      r1: 450,
      r2: 600,
      r3Live: 400,
      winRate: '78%',
      streak: 4,
      status: 'CONNECTED',
      activeSabotages: []
    },
    {
      id: 2,
      teamName: 'TEAM VORTEX',
      p1: 'Elena Rostova',
      p2: 'Dmitri Volkov',
      handle: 'VORTEX-9 // NEXUS_CORE',
      tag: 'OPPONENT',
      lane: 'Lane #02',
      score: 1200,
      r1: 500,
      r2: 450,
      r3Live: 250,
      winRate: '54%',
      streak: 1,
      status: 'CONNECTED',
      activeSabotages: ['Sound Distortion']
    },
    {
      id: 3,
      teamName: 'TEAM NULL POINTER',
      p1: 'Marcus Thorne',
      p2: 'Aria Stark',
      handle: 'NULL_POINTER // BER_07',
      tag: 'BENCH',
      lane: 'Lane #03',
      score: 950,
      r1: 400,
      r2: 350,
      r3Live: 200,
      winRate: '42%',
      streak: 0,
      status: 'CONNECTED',
      activeSabotages: []
    },
    {
      id: 4,
      teamName: 'TEAM CYBER SPECTRE',
      p1: 'Kenji Sato',
      p2: 'Maya Lin',
      handle: 'CYBER_SPECTRE // NYC_09',
      tag: 'STANDBY',
      lane: 'Lane #04',
      score: 750,
      r1: 300,
      r2: 300,
      r3Live: 150,
      winRate: '36%',
      streak: 0,
      status: 'CONNECTED',
      activeSabotages: []
    }
  ]);

  // Buzzer & Lock-in State with sequential queue
  const [buzzersArmed, setBuzzersArmed] = useState(true);
  const [isLockedIn, setIsLockedIn] = useState(false);

  // Mani Adi Buzzer Press Result
  const [buzzerPressResult, setBuzzerPressResult] = useState({
    pressed: false,
    rank: 1,
    time: '14:02:44.819',
    latency: '0.142s',
    title: 'CONGRATS! YOU PRESSED 1ST!',
    subtitle: 'GOLD RESPONSE PRIORITY SECURED // QUEUE #01'
  });

  const initialQueue = [
    { id: 1, teamId: 1, teamName: 'TEAM KINETIC', name: 'Alex Vance & Sarah Connor', handle: 'VALKYRIE_01', latency: '0.142s', timestamp: '14:02:44.819', rank: 1 },
    { id: 2, teamId: 2, teamName: 'TEAM VORTEX', name: 'Elena Rostova & Dmitri Volkov', handle: 'NEXUS_CORE', latency: '0.198s', timestamp: '14:02:44.875', rank: 2 },
    { id: 3, teamId: 3, teamName: 'TEAM NULL POINTER', name: 'Marcus Thorne & Aria Stark', handle: 'NULL_POINTER', latency: '0.245s', timestamp: '14:02:44.922', rank: 3 },
    { id: 4, teamId: 4, teamName: 'TEAM CYBER SPECTRE', name: 'Kenji Sato & Maya Lin', handle: 'CYBER_SPECTRE', latency: '0.312s', timestamp: '14:02:44.989', rank: 4 }
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

  // Kanaku Valaku (Audit Log)
  const [auditLogs, setAuditLogs] = useState([
    {
      id: 1,
      time: '14:02:44',
      category: 'LOCK EVENT',
      message: 'Buzzer resolved to TEAM KINETIC (Alex Vance & Sarah Connor) in 0.142s.',
      colorClass: 'text-signal-emerald font-bold'
    },
    {
      id: 2,
      time: '14:02:18',
      category: 'SCORE',
      message: 'Admin adjusted TEAM KINETIC points (+100).',
      colorClass: 'text-primary'
    },
    {
      id: 3,
      time: '14:01:50',
      category: 'SABOTAGE',
      message: 'Sound Distortion active on TEAM VORTEX terminal.',
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

  // Adjust score of any team by ID
  const adjustTeamScore = (teamId, delta) => {
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id === teamId) {
          const nextScore = t.score + delta;
          appendLog('SCORE', `Adjusted score for ${t.teamName} (${delta > 0 ? '+' : ''}${delta} pts). New total: ${nextScore}.`);
          return { ...t, score: nextScore };
        }
        return t;
      })
    );
  };

  // Current active buzzer team from the queue
  const currentBuzzerWinner = buzzerQueue[queueIndex] || {
    id: 0,
    teamId: 0,
    teamName: 'NO FURTHER BUZZERS',
    name: 'QUEUE EXHAUSTED',
    handle: 'EMPTY',
    latency: '0.000s',
    timestamp: '--:--:--',
    rank: 0
  };

  // Step to the next player in the buzzer queue
  const advanceToNextPlayer = () => {
    if (queueIndex < buzzerQueue.length - 1) {
      const nextIndex = queueIndex + 1;
      setQueueIndex(nextIndex);
      const nextTeam = buzzerQueue[nextIndex];
      playTone(780, 0.15);
      appendLog(
        'QUEUE ADVANCE',
        `Admin advanced to next pressed team: #${nextTeam.rank} ${nextTeam.teamName} (${nextTeam.latency} latency).`,
        'text-acid-chartreuse font-bold'
      );
    } else {
      playTone(300, 0.2, 'sawtooth');
      appendLog('QUEUE', 'Buzzer queue reached the end. No more pressed contenders.', 'text-on-surface-variant');
    }
  };

  // Award floor points
  const awardFastestAnswer = (teamIdOverride) => {
    const targetTeamId = teamIdOverride || currentBuzzerWinner.teamId || 1;
    adjustTeamScore(targetTeamId, 50);
    playTone(1100, 0.2);
    appendLog(
      'ARBITRAGE',
      `Floor points (+50) awarded to ${currentBuzzerWinner.teamName || 'Team ' + targetTeamId}.`,
      'text-signal-emerald font-bold'
    );
  };

  // Buzzer Trigger in Mani Adi
  const executeBuzzIn = () => {
    if (isLockedIn || !buzzersArmed) return;

    setIsLockedIn(true);
    playTone(950, 0.22, 'triangle');

    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#CCFF00', '#00FF85', '#4B00E0']
      });
    } catch (e) {}

    const latencyNum = (0.12 + Math.random() * 0.08).toFixed(3);
    const nowTime = getFormattedTime();

    // Randomize or set rank 1 for user
    const pressRank = 1;
    setBuzzerPressResult({
      pressed: true,
      rank: pressRank,
      time: nowTime,
      latency: `${latencyNum}s`,
      title: '🎉 CONGRATS! YOU PRESSED 1ST!',
      subtitle: 'GOLD RESPONSE PRIORITY SECURED // POD CH-01'
    });

    const updatedQueue = [
      { id: 1, teamId: 1, teamName: teamName || 'TEAM KINETIC', name: `${p1Handle} & ${p2Handle}`, handle: p1Handle, latency: `${latencyNum}s`, timestamp: nowTime, rank: 1 },
      { id: 2, teamId: 2, teamName: 'TEAM VORTEX', name: 'Elena Rostova & Dmitri Volkov', handle: 'NEXUS_CORE', latency: '0.198s', timestamp: nowTime, rank: 2 },
      { id: 3, teamId: 3, teamName: 'TEAM NULL POINTER', name: 'Marcus Thorne & Aria Stark', handle: 'NULL_POINTER', latency: '0.245s', timestamp: nowTime, rank: 3 },
      { id: 4, teamId: 4, teamName: 'TEAM CYBER SPECTRE', name: 'Kenji Sato & Maya Lin', handle: 'CYBER_SPECTRE', latency: '0.312s', timestamp: nowTime, rank: 4 }
    ];
    setBuzzerQueue(updatedQueue);
    setQueueIndex(0);

    appendLog('LOCK EVENT', `Mani Adi triggered by ${teamName} in ${latencyNum}s! Position: #1.`, 'text-signal-emerald font-bold');

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
    setBuzzerPressResult((prev) => ({ ...prev, pressed: false }));
    setBuzzerQueue(initialQueue);
    playTone(700, 0.1);
    appendLog('BUZZERS', 'Hardware buffers flushed & queue reset.', 'text-on-surface-variant');
  };

  // Deploy Sabotage to a target team
  const deploySabotageToTeam = (sabotageName, duration, targetTeamId) => {
    const target = teams.find((t) => t.id === targetTeamId);
    const targetTeamName = target ? target.teamName : `Team ${targetTeamId}`;

    setTeams((prev) =>
      prev.map((t) => {
        if (t.id === targetTeamId) {
          const updatedSabotages = t.activeSabotages.includes(sabotageName)
            ? t.activeSabotages
            : [...t.activeSabotages, sabotageName];
          return { ...t, activeSabotages: updatedSabotages };
        }
        return t;
      })
    );

    setActiveThreat({
      name: `${sabotageName.toUpperCase()} [ACTIVE]`,
      isActive: true,
      timeLeft: duration || 15,
      target: targetTeamName,
      sub: `Tactical disruption payload deployed against ${targetTeamName}.`
    });

    playTone(420, 0.3, 'sawtooth');
    appendLog('SABOTAGE', `${sabotageName} deployed directly against ${targetTeamName}.`, 'text-sabotage-crimson font-bold');

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
        appendLog('SYS', `Disruption expired: ${sabotageName} on ${targetTeamName}.`, 'text-on-surface-variant');
      } else {
        setActiveThreat((prev) => ({ ...prev, timeLeft: left }));
      }
    }, 1000);
  };

  // Remove / Neutralize Sabotage from a team (Admin capability)
  const removeSabotageFromTeam = (teamId, sabotageName) => {
    const target = teams.find((t) => t.id === teamId);
    const targetTeamName = target ? target.teamName : `Team ${teamId}`;

    setTeams((prev) =>
      prev.map((t) => {
        if (t.id === teamId) {
          return {
            ...t,
            activeSabotages: sabotageName
              ? t.activeSabotages.filter((s) => s !== sabotageName)
              : []
          };
        }
        return t;
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
      `Admin OVERRIDE: Removed sabotage [${sabotageName || 'ALL DISRUPTIONS'}] from ${targetTeamName}.`,
      'text-signal-emerald font-bold'
    );
  };

  const clearLogs = () => {
    setAuditLogs([]);
    appendLog('SYS', 'Audit buffer cleared.', 'text-on-surface-variant');
  };

  // Spacebar listener for Mani Adi
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && e.target === document.body && currentView === 'arena' && nammaAreaSubTab === 'mani-adi') {
        e.preventDefault();
        executeBuzzIn();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLockedIn, buzzersArmed, currentView, nammaAreaSubTab]);

  return (
    <GameContext.Provider
      value={{
        currentView,
        setCurrentView,
        adminSubTab,
        setAdminSubTab,
        nammaAreaSubTab,
        setNammaAreaSubTab,
        teamName,
        setTeamName,
        teams,
        players: teams, // backwards-compatibility alias
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
        buzzerPressResult,
        buzzerQueue,
        queueIndex,
        currentBuzzerWinner,
        advanceToNextPlayer,
        activeThreat,
        auditLogs,
        adjustTeamScore,
        adjustPlayerScore: adjustTeamScore,
        executeBuzzIn,
        armBuzzers,
        lockBuzzers,
        resetBuzzers,
        awardFastestAnswer,
        deploySabotageToTeam,
        deploySabotageToPlayer: deploySabotageToTeam,
        removeSabotageFromTeam,
        removeSabotageFromPlayer: removeSabotageFromTeam,
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
