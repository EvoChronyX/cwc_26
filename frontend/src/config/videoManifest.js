/**
 * Tactical Video & Visual Alert Manifest
 * 
 * Maps all game sabotages, powerups, shields, and counter-attacks to:
 * 1. Low-latency static video files located in /public/videos/
 * 2. Visual fallback animation themes (glitch, matrix, shield, freeze, blackout)
 *    so the UI renders an ultra-crisp Cyberpunk HUD even if the MP4 is still being placed.
 */

export const VIDEO_MANIFEST = {
  // =========================================================================
  // SABOTAGES (DISRUPTIONS)
  // =========================================================================
  sabotages: {
    blackout: {
      videoUrl: '/videos/sabotages/blackout.mp4',
      title: 'BLACKOUT DISRUPTION',
      subtitle: 'Hostile squad initiated complete visual blackout protocol.',
      color: '#FF2A3B',
      accentColor: '#FF6B00',
      icon: 'dark_mode',
      fallbackTheme: 'blackout',
      soundFrequency: 180,
    },
    'no-copy-paste': {
      videoUrl: '/videos/sabotages/no-copy-paste.mp4',
      title: 'CLIPBOARD MALWARE LOCK',
      subtitle: 'System copy-paste buffer isolated and intercepted.',
      color: '#FF0055',
      accentColor: '#FF5500',
      icon: 'content_paste_off',
      fallbackTheme: 'glitch',
      soundFrequency: 240,
    },
    'no-ai': {
      videoUrl: '/videos/sabotages/no-ai.mp4',
      title: 'AI ENGINE NEUTRALIZED',
      subtitle: 'Neural copilot and LLM assistance disconnected.',
      color: '#FF3366',
      accentColor: '#FF9900',
      icon: 'smart_toy',
      fallbackTheme: 'glitch',
      soundFrequency: 290,
    },
    freeze: {
      videoUrl: '/videos/sabotages/freeze.mp4',
      title: 'ABSOLUTE ZERO FREEZE',
      subtitle: 'Code editor terminal input locked down by rival payload.',
      color: '#00E5FF',
      accentColor: '#0077FF',
      icon: 'ac_unit',
      fallbackTheme: 'freeze',
      soundFrequency: 350,
    },
    'force-task': {
      videoUrl: '/videos/sabotages/force-task.mp4',
      title: 'FORCED TASK PROTOCOL',
      subtitle: 'Compulsory side-objective assigned by adversary.',
      color: '#FF5500',
      accentColor: '#FFCC00',
      icon: 'priority_high',
      fallbackTheme: 'matrix',
      soundFrequency: 410,
    },
    'force-punishment': {
      videoUrl: '/videos/sabotages/punishment.mp4',
      title: 'PENALTY CHALLENGE FORCED',
      subtitle: 'Compulsory challenge constraint enforced on your squad.',
      color: '#FF0033',
      accentColor: '#9900FF',
      icon: 'warning',
      fallbackTheme: 'glitch',
      soundFrequency: 220,
    },
    'force-complexity': {
      videoUrl: '/videos/sabotages/complexity.mp4',
      title: 'ALGORITHMIC COMPLEXITY LOCK',
      subtitle: 'Arbitrary constraint payload attached to current problem.',
      color: '#FF7700',
      accentColor: '#FF0055',
      icon: 'psychology_alt',
      fallbackTheme: 'matrix',
      soundFrequency: 310,
    },
    default: {
      videoUrl: '/videos/sabotages/default_sabotage.mp4',
      title: 'TACTICAL DISRUPTION ACTIVE',
      subtitle: 'A rival team has deployed a tactical disruption payload.',
      color: '#FF2A3B',
      accentColor: '#CCFF00',
      icon: 'emergency_home',
      fallbackTheme: 'glitch',
      soundFrequency: 300,
    },
  },

  // =========================================================================
  // POWER-UPS (ADVANTAGES)
  // =========================================================================
  powerups: {
    'extra-time': {
      videoUrl: '/videos/powerups/extra-time.mp4',
      title: 'CHRONO MATRIX: EXTRA TIME',
      subtitle: 'Time distortion activated. Extra coding window granted.',
      color: '#CCFF00',
      accentColor: '#00FF85',
      icon: 'more_time',
      fallbackTheme: 'matrix',
      soundFrequency: 600,
    },
    'skip-task': {
      videoUrl: '/videos/powerups/skip-task.mp4',
      title: 'TASK BYPASS UNLOCKED',
      subtitle: 'Obstacle neutralized! Task skipped with zero point penalty.',
      color: '#00FF85',
      accentColor: '#CCFF00',
      icon: 'fast_forward',
      fallbackTheme: 'matrix',
      soundFrequency: 750,
    },
    'skip-punishment': {
      videoUrl: '/videos/powerups/skip-punishment.mp4',
      title: 'PENALTY CANCELLED',
      subtitle: 'Punishment defused! Squad operational integrity restored.',
      color: '#00E5FF',
      accentColor: '#00FF85',
      icon: 'cancel',
      fallbackTheme: 'shield',
      soundFrequency: 820,
    },
    hints: {
      videoUrl: '/videos/powerups/hints.mp4',
      title: 'INTEL DECRYPTED: HINTS',
      subtitle: 'Arbiter hints deciphered. Architectural insights unlocked.',
      color: '#FFD700',
      accentColor: '#FF8800',
      icon: 'lightbulb',
      fallbackTheme: 'matrix',
      soundFrequency: 880,
    },
    lottery: {
      videoUrl: '/videos/powerups/lottery.mp4',
      title: 'SURPRISE LOTTERY SURGE',
      subtitle: 'Quantum lottery triggered unpredictable power surge!',
      color: '#B026FF',
      accentColor: '#CCFF00',
      icon: 'casino',
      fallbackTheme: 'matrix',
      soundFrequency: 920,
    },
    ai: {
      videoUrl: '/videos/powerups/ai.mp4',
      title: 'NEURAL AI ACCELERATOR',
      subtitle: 'Full AI generative copilot query granted for 1 question.',
      color: '#00F0FF',
      accentColor: '#7000FF',
      icon: 'smart_toy',
      fallbackTheme: 'matrix',
      soundFrequency: 1000,
    },
    'change-question': {
      videoUrl: '/videos/powerups/change-question.mp4',
      title: 'SPECIFICATION REROLL',
      subtitle: 'Problem specification swapped for alternate track.',
      color: '#FF00CC',
      accentColor: '#00FF85',
      icon: 'swap_horiz',
      fallbackTheme: 'matrix',
      soundFrequency: 680,
    },
    'check-progress': {
      videoUrl: '/videos/powerups/check-progress.mp4',
      title: 'SURVEILLANCE RADAR ACTIVE',
      subtitle: 'Competitor telemetry and metrics exposed on your radar.',
      color: '#00FFCC',
      accentColor: '#0066FF',
      icon: 'radar',
      fallbackTheme: 'matrix',
      soundFrequency: 720,
    },
    default: {
      videoUrl: '/videos/powerups/default_powerup.mp4',
      title: 'POWER-UP ACTIVATED',
      subtitle: 'Tactical advantage engaged for your squad.',
      color: '#00FF85',
      accentColor: '#CCFF00',
      icon: 'bolt',
      fallbackTheme: 'matrix',
      soundFrequency: 800,
    },
  },

  // =========================================================================
  // SHIELDS & DEFENSE
  // =========================================================================
  shields: {
    'shield-active': {
      videoUrl: '/videos/shields/shield-active.mp4',
      title: 'DEFENSIVE SHIELD DEPLOYED',
      subtitle: 'Electromagnetic barrier active. Complete immunity to incoming sabotages.',
      color: '#00FF85',
      accentColor: '#00E5FF',
      icon: 'shield',
      fallbackTheme: 'shield',
      soundFrequency: 850,
    },
    'shield-blocked': {
      videoUrl: '/videos/shields/shield-blocked.mp4',
      title: 'SABOTAGE INTERCEPTED & BLOCKED',
      subtitle: 'Incoming hostile disruption was absorbed by your tactical shield!',
      color: '#00FF85',
      accentColor: '#CCFF00',
      icon: 'verified_user',
      fallbackTheme: 'shield',
      soundFrequency: 950,
    },
    'reflect-active': {
      videoUrl: '/videos/shields/reflect-active.mp4',
      title: 'REFLECTIVE SHIELD ENGAGED',
      subtitle: 'Mirror barrier activated. Any sabotage will be reflected back onto attacker!',
      color: '#9900FF',
      accentColor: '#CCFF00',
      icon: 'change_circle',
      fallbackTheme: 'reflect',
      soundFrequency: 880,
    },
    'reflect-counter': {
      videoUrl: '/videos/shields/reflect-counter.mp4',
      title: 'SABOTAGE REFLECTED! COUNTER-STRIKE',
      subtitle: 'Hostile attack reflected! The attacking squad was struck by their own disruption!',
      color: '#CCFF00',
      accentColor: '#9900FF',
      icon: 'swap_calls',
      fallbackTheme: 'reflect',
      soundFrequency: 1100,
    },
  },
};

/**
 * Normalizes an item slug or name to its video manifest entry.
 */
export function resolveSabotageVideo(slugOrName) {
  if (!slugOrName) return VIDEO_MANIFEST.sabotages.default;
  const s = slugOrName.toLowerCase();

  if (s.includes('blackout')) return VIDEO_MANIFEST.sabotages.blackout;
  if (s.includes('copy') || s.includes('paste')) return VIDEO_MANIFEST.sabotages['no-copy-paste'];
  if (s.includes('ai') && (s.includes('no') || s.includes('disable'))) return VIDEO_MANIFEST.sabotages['no-ai'];
  if (s.includes('freeze')) return VIDEO_MANIFEST.sabotages.freeze;
  if (s.includes('task') && (s.includes('force') || s.includes('mandatory'))) return VIDEO_MANIFEST.sabotages['force-task'];
  if (s.includes('punish') || s.includes('penalty')) return VIDEO_MANIFEST.sabotages['force-punishment'];
  if (s.includes('complex')) return VIDEO_MANIFEST.sabotages['force-complexity'];

  return VIDEO_MANIFEST.sabotages.default;
}

export function resolvePowerupVideo(slugOrName) {
  if (!slugOrName) return VIDEO_MANIFEST.powerups.default;
  const s = slugOrName.toLowerCase();

  if (s.includes('reflect')) return VIDEO_MANIFEST.shields['reflect-active'];
  if (s.includes('shield')) return VIDEO_MANIFEST.shields['shield-active'];
  if (s.includes('time') || s.includes('chrono')) return VIDEO_MANIFEST.powerups['extra-time'];
  if (s.includes('skip') && s.includes('task')) return VIDEO_MANIFEST.powerups['skip-task'];
  if (s.includes('skip') && s.includes('punish')) return VIDEO_MANIFEST.powerups['skip-punishment'];
  if (s.includes('hint')) return VIDEO_MANIFEST.powerups.hints;
  if (s.includes('lottery')) return VIDEO_MANIFEST.powerups.lottery;
  if (s.includes('ai')) return VIDEO_MANIFEST.powerups.ai;
  if (s.includes('change') || s.includes('swap')) return VIDEO_MANIFEST.powerups['change-question'];
  if (s.includes('progress') || s.includes('radar')) return VIDEO_MANIFEST.powerups['check-progress'];

  return VIDEO_MANIFEST.powerups.default;
}

export function resolveShieldVideo(eventType) {
  switch (eventType) {
    case 'SHIELD_BLOCKED':
      return VIDEO_MANIFEST.shields['shield-blocked'];
    case 'REFLECT_COUNTER':
    case 'SABOTAGE_REFLECTED':
      return VIDEO_MANIFEST.shields['reflect-counter'];
    case 'REFLECT_ACTIVE':
      return VIDEO_MANIFEST.shields['reflect-active'];
    case 'SHIELD_ACTIVE':
    default:
      return VIDEO_MANIFEST.shields['shield-active'];
  }
}
