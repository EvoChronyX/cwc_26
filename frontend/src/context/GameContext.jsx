import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { api, WS_URL, getAuthToken, setAuthToken, clearAuthToken, getStoredUser, setStoredUser } from '../services/api';

const GameContext = createContext();

export function GameProvider({ children }) {
  const getInitialView = () => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (['portal', 'arena', 'admin'].includes(hash)) return hash;
    }
    return 'portal'; // Default directly to portal login access page
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

  // User & Squad Identity State
  const initialUser = getStoredUser();
  const [currentUser, setCurrentUser] = useState(initialUser);
  const [currentTeamId, setCurrentTeamId] = useState(initialUser?.team_data?.id || initialUser?.team_id || null);

  const [teamName, setTeamName] = useState(initialUser?.team_data?.teamName || initialUser?.display_name || '');
  const [p1Handle, setP1Handle] = useState(initialUser?.team_data?.p1 || '');
  const [p2Handle, setP2Handle] = useState(initialUser?.team_data?.p2 || '');
  const [playerAvatar, setPlayerAvatar] = useState(initialUser?.team_data?.avatarId || 'avatar-1');
  const [playerPassword, setPlayerPassword] = useState('');
  const [activeFaction, setActiveFaction] = useState('KINETIC');
  const [arenaPin, setArenaPin] = useState('794-20');

  // Connected Teams Roster (Synchronized with PostgreSQL DB)
  const [teams, setTeams] = useState([]);

  // Buzzer & Lock-in State with sequential queue
  const [buzzersArmed, setBuzzersArmed] = useState(true);
  const [isLockedIn, setIsLockedIn] = useState(false);

  // Mani Adi Buzzer Press Result
  const [buzzerPressResult, setBuzzerPressResult] = useState({
    pressed: false,
    rank: 1,
    time: '--:--:--',
    latency: '0.000s',
    title: 'BUZZER STANDBY',
    subtitle: 'AWAITING MASTER CIRCUIT ARBITRAGE'
  });

  const [buzzerQueue, setBuzzerQueue] = useState([]);
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
  const [auditLogs, setAuditLogs] = useState([]);

  const threatTimerRef = useRef(null);
  const resetTimeoutRef = useRef(null);
  const wsRef = useRef(null);

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

  // Fetch baseline state from PostgreSQL database
  const refreshDatabaseState = useCallback(async () => {
    try {
      const [fetchedTeams, queueData, logsData] = await Promise.all([
        api.teams.getAll().catch(() => []),
        api.buzzer.getQueue().catch(() => ({ queue: [], queueIndex: 0, buzzersArmed: true })),
        api.audit.getLogs('ALL', 50).catch(() => [])
      ]);

      if (Array.isArray(fetchedTeams) && fetchedTeams.length > 0) {
        setTeams(fetchedTeams);
      }

      if (queueData) {
        const q = queueData.queue || [];
        setBuzzerQueue(q);
        setQueueIndex(queueData.queueIndex || 0);
        if (typeof queueData.buzzersArmed === 'boolean') {
          setBuzzersArmed(queueData.buzzersArmed);
        }

        const storedUser = getStoredUser();
        const activeTeamId = currentTeamId || storedUser?.team_data?.id || storedUser?.team_id || storedUser?.entity_id;
        if (activeTeamId) {
          const myBuzz = q.find((item) => item.teamId === activeTeamId);
          if (myBuzz) {
            setIsLockedIn(true);
            setBuzzerPressResult({
              pressed: true,
              rank: myBuzz.rank,
              time: myBuzz.timestamp || myBuzz.clientTime || '--:--:--',
              clientTime: myBuzz.clientTime || myBuzz.timestamp,
              serverTime: myBuzz.serverTime,
              latency: myBuzz.latency,
              title: myBuzz.rank === 1 ? '🎉 CONGRATS! YOU PRESSED 1ST!' : `BUZZER CONFIRMED: #${myBuzz.rank}`,
              subtitle: `RESPONSE PRIORITY SECURED // QUEUE #${myBuzz.rank}`
            });
          } else {
            setIsLockedIn(false);
          }
        }
      }

      if (Array.isArray(logsData)) {
        setAuditLogs(logsData);
      }
    } catch (err) {
      console.warn('Error refreshing database state:', err);
    }
  }, [currentTeamId]);

  // Connect WebSocket for live tournament telemetry with keepalive and auto-reconnect
  useEffect(() => {
    let socket = null;
    let isMounted = true;
    let pingInterval = null;
    let reconnectTimeout = null;

    const connectWebSocket = () => {
      if (!isMounted) return;

      const token = getAuthToken();
      const wsUrl = token ? `${WS_URL}?token=${encodeURIComponent(token)}` : WS_URL;

      try {
        socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onopen = () => {
          // Send keepalive ping every 15 seconds to prevent idle drops
          if (pingInterval) clearInterval(pingInterval);
          pingInterval = setInterval(() => {
            if (socket && socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify({ type: 'PING' }));
            }
          }, 15000);

          // Re-hydrate baseline state on connect/reconnect
          refreshDatabaseState();
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            handleWebSocketMessage(data);
          } catch (e) {
            console.warn('WS parse error:', e);
          }
        };

        socket.onerror = (e) => {
          console.warn('WS socket error:', e);
        };

        socket.onclose = () => {
          if (pingInterval) clearInterval(pingInterval);
          if (isMounted) {
            // Auto reconnect after 2 seconds
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
            reconnectTimeout = setTimeout(connectWebSocket, 2000);
          }
        };
      } catch (e) {
        console.warn('WebSocket connection error:', e);
        if (isMounted) {
          reconnectTimeout = setTimeout(connectWebSocket, 3000);
        }
      }
    };

    connectWebSocket();

    return () => {
      isMounted = false;
      if (pingInterval) clearInterval(pingInterval);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
        socket.close();
      }
    };
  }, [currentUser, refreshDatabaseState]);

  // Initial database hydration
  useEffect(() => {
    refreshDatabaseState();
  }, [refreshDatabaseState]);

  // Handle incoming real-time messages from FastAPI WebSocket
  const handleWebSocketMessage = (data) => {
    if (!data || !data.type) return;

    switch (data.type) {
      case 'INIT_STATE':
        if (data.teams) setTeams(data.teams);
        if (data.queueState) {
          const q = data.queueState.queue || [];
          setBuzzerQueue(q);
          setQueueIndex(data.queueState.queueIndex || 0);
          if (typeof data.queueState.buzzersArmed === 'boolean') {
            setBuzzersArmed(data.queueState.buzzersArmed);
          }
          if (currentTeamId) {
            const myBuzz = q.find((item) => item.teamId === currentTeamId);
            if (myBuzz) {
              setIsLockedIn(true);
              setBuzzerPressResult({
                pressed: true,
                rank: myBuzz.rank,
                time: myBuzz.timestamp || myBuzz.clientTime || '--:--:--',
                clientTime: myBuzz.clientTime || myBuzz.timestamp,
                serverTime: myBuzz.serverTime,
                latency: myBuzz.latency,
                title: myBuzz.rank === 1 ? '🎉 CONGRATS! YOU PRESSED 1ST!' : `BUZZER CONFIRMED: #${myBuzz.rank}`,
                subtitle: `RESPONSE PRIORITY SECURED // QUEUE #${myBuzz.rank}`
              });
            }
          }
        }
        if (data.recentLogs) setAuditLogs(data.recentLogs);
        break;

      case 'SCORE_UPDATED':
        setTeams((prev) =>
          prev.map((t) => (t.id === data.team_id ? { ...t, score: data.score } : t))
        );
        break;

      case 'LEADERBOARD_UPDATED':
      case 'SCORE_RESET':
        if (Array.isArray(data.teams)) {
          setTeams(data.teams);
        }
        break;

      case 'QUEUE_UPDATED':
      case 'BUZZER_STRIKE':
        if (data.queueState) {
          const q = data.queueState.queue || [];
          setBuzzerQueue(q);
          setQueueIndex(data.queueState.queueIndex || 0);
        }
        if (data.strike) {
          playTone(850, 0.15);
          // If this strike belongs to current team
          if (currentTeamId && data.strike.teamId === currentTeamId) {
            setIsLockedIn(true);
            setBuzzerPressResult({
              pressed: true,
              rank: data.strike.rank,
              time: data.strike.timestamp || data.strike.clientTime || '--:--:--',
              clientTime: data.strike.clientTime || data.strike.timestamp,
              serverTime: data.strike.serverTime,
              latency: data.strike.latency,
              title: data.strike.rank === 1 ? '🎉 CONGRATS! YOU PRESSED 1ST!' : `BUZZER CONFIRMED: #${data.strike.rank}`,
              subtitle: `RESPONSE PRIORITY SECURED // QUEUE #${data.strike.rank}`
            });
            try {
              confetti({
                particleCount: 50,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#CCFF00', '#00FF85', '#4B00E0']
              });
            } catch (e) {}
          }
        }
        break;

      case 'BUZZERS_STATE_CHANGED':
        if (typeof data.buzzersArmed === 'boolean') {
          setBuzzersArmed(data.buzzersArmed);
          if (data.buzzersArmed) {
            playTone(600, 0.1);
          } else {
            playTone(300, 0.15, 'square');
          }
        }
        if (data.queueState) {
          setBuzzerQueue(data.queueState.queue || []);
          setQueueIndex(data.queueState.queueIndex || 0);
        }
        break;

      case 'BUZZERS_ARMED':
        setBuzzersArmed(true);
        if (data.queueState) {
          setBuzzerQueue(data.queueState.queue || []);
          setQueueIndex(data.queueState.queueIndex || 0);
        }
        playTone(600, 0.1);
        break;

      case 'BUZZERS_LOCKED':
        setBuzzersArmed(false);
        if (data.queueState) {
          setBuzzerQueue(data.queueState.queue || []);
          setQueueIndex(data.queueState.queueIndex || 0);
        }
        playTone(300, 0.15, 'square');
        break;

      case 'BUZZERS_RESET':
      case 'BUZZER_RESET':
        setIsLockedIn(false);
        setQueueIndex(0);
        setBuzzerPressResult({
          pressed: false,
          rank: 1,
          time: '--:--:--',
          latency: '0.000s',
          title: 'BUZZER STANDBY',
          subtitle: 'AWAITING MASTER CIRCUIT ARBITRAGE'
        });
        if (data.queueState) {
          setBuzzerQueue(data.queueState.queue || []);
        } else {
          setBuzzerQueue([]);
        }
        playTone(700, 0.1);
        break;

      case 'QUEUE_ADVANCED':
        if (typeof data.queueIndex === 'number') {
          setQueueIndex(data.queueIndex);
        }
        if (data.queueState) {
          setBuzzerQueue(data.queueState.queue || []);
          setQueueIndex(data.queueState.queueIndex || 0);
        }
        playTone(780, 0.15);
        break;

      case 'SABOTAGE_DEPLOYED':
        // Update teams active sabotages
        setTeams((prev) =>
          prev.map((t) => {
            if (t.id === data.targetId) {
              const cur = t.activeSabotages || [];
              return {
                ...t,
                activeSabotages: cur.includes(data.sabotageName) ? cur : [...cur, data.sabotageName]
              };
            }
            return t;
          })
        );
        // If current team is target or attacker, update activeThreat HUD
        if (currentTeamId && (data.targetId === currentTeamId || data.attackerId === currentTeamId)) {
          setActiveThreat({
            name: `${(data.sabotageName || 'TACTICAL DISRUPTION').toUpperCase()} [ACTIVE]`,
            isActive: true,
            timeLeft: data.duration || 15,
            target: data.targetTeamName || `Team #${data.targetId}`,
            sub: `Disruption payload active against ${data.targetTeamName || 'target'}.`
          });
          playTone(420, 0.3, 'sawtooth');

          if (threatTimerRef.current) clearInterval(threatTimerRef.current);
          let left = data.duration || 15;
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
            } else {
              setActiveThreat((prev) => ({ ...prev, timeLeft: left }));
            }
          }, 1000);
        }
        break;

      case 'SABOTAGE_NEUTRALIZED':
        setTeams((prev) =>
          prev.map((t) => {
            if (t.id === data.targetTeamId) {
              return {
                ...t,
                activeSabotages: Array.isArray(data.activeSabotages)
                  ? data.activeSabotages
                  : (t.activeSabotages || []).filter((s) => s !== data.sabotageName)
              };
            }
            return t;
          })
        );
        if (currentTeamId && data.targetTeamId === currentTeamId) {
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
        break;

      case 'AUDIT_EVENT':
        if (data.event) {
          setAuditLogs((prev) => [data.event, ...prev]);
        }
        break;

      case 'AUDIT_CLEARED':
        setAuditLogs([]);
        break;

      default:
        break;
    }
  };

  // Append entry to Kanaku Valaku locally (used as instant optimistic feed)
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

  // AUTHENTICATION: Player Register or Returning Squad Login
  const loginPlayer = async (rawTeamName, rawP1, rawP2, avatarId, password) => {
    const res = await api.auth.playerRegisterOrLogin(
      rawTeamName,
      rawP1,
      rawP2,
      avatarId,
      password
    );

    setAuthToken(res.access_token);
    setStoredUser(res);
    setCurrentUser(res);

    if (res.team_data) {
      setCurrentTeamId(res.team_data.id);
      setTeamName(res.team_data.teamName);
      setP1Handle(res.team_data.p1);
      setP2Handle(res.team_data.p2);
      setPlayerAvatar(res.team_data.avatarId || avatarId || 'avatar-1');
    } else {
      setCurrentTeamId(res.entity_id);
      setTeamName(res.display_name);
    }

    await refreshDatabaseState();
    return res;
  };

  // AUTHENTICATION: Game Master Admin Login
  const loginAdmin = async (gmId, password) => {
    const res = await api.auth.adminLogin(gmId, password);
    setAuthToken(res.access_token);
    setStoredUser(res);
    setCurrentUser(res);

    await refreshDatabaseState();
    return res;
  };

  // LOGOUT: Clears tokens and redirects back to portal
  const logout = () => {
    clearAuthToken();
    setCurrentUser(null);
    setCurrentTeamId(null);
    setPlayerPassword('');
    setIsLockedIn(false);
    playTone(500, 0.15, 'sawtooth');
    setCurrentView('portal');
  };

  // Adjust score of any team by ID (Calls FastAPI backend)
  const adjustTeamScore = async (teamId, delta) => {
    try {
      const res = await api.scores.adjust(teamId, delta, `Admin score adjust (${delta > 0 ? '+' : ''}${delta} pts)`);
      if (res && res.score !== undefined) {
        setTeams((prev) =>
          prev.map((t) => (t.id === teamId ? { ...t, score: res.score } : t))
        );
      }
    } catch (err) {
      console.error('Failed to adjust score:', err);
      // Fallback local mutation
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
    }
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

  // Step to the next player in the buzzer queue (Calls backend)
  const advanceToNextPlayer = async () => {
    try {
      const res = await api.buzzer.advance();
      if (res) {
        setQueueIndex(res.queueIndex || 0);
      }
      playTone(780, 0.15);
    } catch (err) {
      console.warn('Buzzer advance API fallback:', err);
      if (queueIndex < buzzerQueue.length - 1) {
        setQueueIndex((prev) => prev + 1);
        playTone(780, 0.15);
      } else {
        playTone(300, 0.2, 'sawtooth');
      }
    }
  };

  // Award floor points (Calls backend)
  const awardFastestAnswer = async (teamIdOverride) => {
    const targetTeamId = teamIdOverride || currentBuzzerWinner.teamId || 1;
    try {
      await api.scores.grantFloor(targetTeamId, 50);
      playTone(1100, 0.2);
    } catch (err) {
      console.warn('Award floor API fallback:', err);
      adjustTeamScore(targetTeamId, 50);
      playTone(1100, 0.2);
    }
  };

  // Buzzer Trigger in Mani Adi (Calls backend /api/buzzer/buzz with high precision telemetry)
  const executeBuzzIn = async () => {
    if (isLockedIn || !buzzersArmed) return;

    setIsLockedIn(true);
    playTone(950, 0.22, 'triangle');

    // Get exact local system click time with millisecond precision
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    const ms = now.getMilliseconds().toString().padStart(3, '0');
    const clientTimeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}.${ms}`;
    const clientTime = now.getTime() / 1000;

    try {
      const res = await api.buzzer.buzz(clientTime, clientTimeStr);

      if (res && res.success) {
        setBuzzerPressResult({
          pressed: true,
          rank: res.rank,
          time: res.time || res.timestamp || clientTimeStr,
          clientTime: res.clientTime || clientTimeStr,
          serverTime: res.serverTime,
          latency: res.latency,
          title: res.rank === 1 ? '🎉 CONGRATS! YOU PRESSED 1ST!' : `BUZZER REGISTERED: #${res.rank}`,
          subtitle: `RESPONSE PRIORITY SECURED // QUEUE #${res.rank}`
        });

        if (res.queueState) {
          setBuzzerQueue(res.queueState.queue || []);
          setQueueIndex(res.queueState.queueIndex || 0);
        }

        try {
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#CCFF00', '#00FF85', '#4B00E0']
          });
        } catch (e) {}
      }
    } catch (err) {
      console.warn('Buzzer API strike returned error or already locked:', err);
      // Re-hydrate state from database to ensure accuracy
      refreshDatabaseState();
    }
  };

  const armBuzzers = async () => {
    try {
      const res = await api.buzzer.arm();
      if (res) {
        setBuzzersArmed(true);
        if (res.queue) setBuzzerQueue(res.queue);
        if (typeof res.queueIndex === 'number') setQueueIndex(res.queueIndex);
      }
      playTone(600, 0.1);
    } catch (err) {
      console.error('Buzzer arm failed:', err);
      alert(`Buzzer Arm Failed: ${err.message || 'Unauthorized or server error. Please verify Admin login.'}`);
    }
  };

  const lockBuzzers = async () => {
    try {
      const res = await api.buzzer.lock();
      if (res) {
        setBuzzersArmed(false);
        if (res.queue) setBuzzerQueue(res.queue);
        if (typeof res.queueIndex === 'number') setQueueIndex(res.queueIndex);
      }
      playTone(300, 0.15, 'square');
    } catch (err) {
      console.error('Buzzer lock failed:', err);
      alert(`Buzzer Lock Failed: ${err.message || 'Unauthorized or server error. Please verify Admin login.'}`);
    }
  };

  const resetBuzzers = async () => {
    try {
      const res = await api.buzzer.reset();
      setIsLockedIn(false);
      setQueueIndex(0);
      setBuzzerPressResult({
        pressed: false,
        rank: 1,
        time: '--:--:--',
        latency: '0.000s',
        title: 'BUZZER STANDBY',
        subtitle: 'AWAITING MASTER CIRCUIT ARBITRAGE'
      });
      if (res && res.queue) {
        setBuzzerQueue(res.queue);
      } else {
        setBuzzerQueue([]);
      }
      playTone(700, 0.1);
    } catch (err) {
      console.error('Buzzer reset failed:', err);
      alert(`Buzzer Reset Failed: ${err.message || 'Unauthorized or server error. Please verify Admin login.'}`);
    }
  };

  // Deploy Sabotage to a target team (Calls backend)
  const deploySabotageToTeam = async (sabotageName, duration, targetTeamId) => {
    const slug = sabotageName.toLowerCase().trim().replace(/\s+/g, '-');
    try {
      await api.sabotages.deploy(slug, targetTeamId);
      playTone(420, 0.3, 'sawtooth');
    } catch (err) {
      console.error('Failed to deploy sabotage:', err);
      alert(err.message || 'Failed to deploy sabotage');
    }
  };

  // Remove / Neutralize Sabotage from a team (Calls backend)
  const removeSabotageFromTeam = async (teamId, sabotageName) => {
    try {
      await api.sabotages.neutralize(teamId, sabotageName);
      playTone(1050, 0.25, 'triangle');
    } catch (err) {
      console.error('Failed to neutralize sabotage:', err);
      // Fallback local mutation
      setTeams((prev) =>
        prev.map((t) => {
          if (t.id === teamId) {
            return {
              ...t,
              activeSabotages: sabotageName
                ? (t.activeSabotages || []).filter((s) => s !== sabotageName)
                : []
            };
          }
          return t;
        })
      );
    }
  };

  const clearLogs = async () => {
    try {
      await api.audit.clear();
      setAuditLogs([]);
    } catch (err) {
      console.warn('Clear logs fallback:', err);
      setAuditLogs([]);
    }
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
        currentUser,
        currentTeamId,
        teamName,
        setTeamName,
        teams,
        players: teams, // backwards-compatibility alias
        p1Handle,
        setP1Handle,
        p2Handle,
        setP2Handle,
        playerAvatar,
        setPlayerAvatar,
        playerPassword,
        setPlayerPassword,
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
        playTone,
        loginPlayer,
        loginAdmin,
        logout,
        refreshDatabaseState
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
