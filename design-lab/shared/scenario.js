/*
 * S2.5 Round 1 — the comparison scenario.
 *
 * Every prototype renders exactly this moment of the same run, so the three art directions can
 * be compared on style alone: same player, bots, company, CV state, HUD values, questions and
 * ATS keywords. Prototype code: never imported by the apps.
 */
window.SCENARIO = {
  company: 'Kestrel Pay',
  player: {
    name: 'RICARDO',
    title: 'Senior Fullstack Developer',
    stack: ['Node.js', 'PHP', 'React', 'PostgreSQL', 'Redis'],
  },
  // Ricardo runs third of four. Positions are the same in every direction.
  bots: { first: 'SOFIA', second: 'MATEO', fourth: 'ALEX' },
  position: '3rd',
  runners: 4,
  cvHealth: 80,
  score: '12,480',
  applicants: '237 applicants',

  technical: {
    stage: 'Hiring Manager',
    icon: '💼',
    counter: '1 / 3',
    prompt: 'Which Redis structure fits a real-time leaderboard?',
    options: { A: 'List', B: 'Set', C: 'Sorted set', D: 'String' },
    selected: 'C',
    seconds: '9',
  },

  recruiter: {
    stage: 'Recruiter',
    icon: '📞',
    counter: '2 / 3',
    line: 'Hi Ricardo! Got 15 minutes? Quick one…',
    prompt: 'Where is the role based?',
    options: { A: 'Barcelona', B: 'Lima', C: 'Berlin', D: 'Austin' },
    selected: 'A',
    seconds: '7',
  },

  ats: {
    stage: 'ATS 9000',
    icon: '🤖',
    match: 82,
    threshold: 70,
    seconds: '14',
    collected: ['Node.js', 'React', 'Redis'],
    upcoming: ['PHP', 'PostgreSQL'],
    traps: ['Ninja', '10x', 'Synergy', 'Spark'],
    // Failing the ATS ends a run, so no named bot is rejected here: anonymous applicant CVs are.
    rejectedPile: 'Auto-rejected',
  },

  // Satire stays in the background: it accompanies the game, it doesn't dominate it.
  humor: [
    'Quick 15-minute call',
    '237 applicants',
    'Culture Fit',
    'Take-home assignment',
    "We'll get back to you",
  ],
};

/** Fills every [data-s="path.to.value"] element with the scenario value. */
window.fillScenario = function fillScenario(root = document) {
  for (const el of root.querySelectorAll('[data-s]')) {
    const value = el.dataset.s
      .split('.')
      .reduce((node, key) => (node == null ? undefined : node[key]), window.SCENARIO);
    if (value !== undefined) el.textContent = String(value);
  }
};

/*
 * Orientation helpers for the mobile comparison:
 * - landscape (844×390): the intended gameplay layout;
 * - portrait default: the "rotate your device" prompt;
 * - ?portrait=fit: what playing in portrait would look like (the whole level squeezed).
 */
window.applyPortraitMode = function applyPortraitMode() {
  const fit = new URLSearchParams(location.search).get('portrait') === 'fit';
  if (!fit) return;
  document.documentElement.classList.add('portrait-fit');
  for (const svg of document.querySelectorAll('svg.scene')) {
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.fillScenario();
  window.applyPortraitMode();
});
