/*
 * Direction C — scene helpers shared by the three C prototypes (prototype only).
 */
(function () {
  /**
   * The answer tower: four archive boxes stacked (A top → D ground). Each box has a flap door
   * cut along a dashed line and an index card label; the chosen one gets highlighter.
   */
  window.answerBoxes = function answerBoxes(target, question) {
    const floors = { A: 250, B: 390, C: 530, D: 670 };
    let out = '';
    for (const [letter, y] of Object.entries(floors)) {
      const on = question.selected === letter;
      out += `<g class="door${on ? ' selected' : ''}" filter="url(#c-shadow)">
        <rect x="1150" y="${y}" width="420" height="130" fill="var(--box)"/>
        <rect x="1150" y="${y}" width="420" height="14" fill="#B8956A"/>
        <rect x="1166" y="${y + 24}" width="46" height="16" rx="8" fill="#6B5236"/>
        <rect x="1436" y="${y + 22}" width="112" height="108" fill="#5A4630"/>
        <rect x="1436" y="${y + 22}" width="112" height="108" fill="none" stroke="var(--ink)" stroke-width="2" stroke-dasharray="8 6" opacity=".5"/>
        <rect class="flap" x="1436" y="${y + 22}" width="112" height="108" fill="#D4B58A" style="${on ? '' : 'transform: none'}"/>
        ${on ? `<path d="M1460 ${y + 120} l12 -10 M1478 ${y + 120} l12 -10" stroke="var(--hl)" stroke-width="5" stroke-linecap="round"/>` : ''}
      </g>
      <g transform="translate(1180 ${y + 48})">
        ${on ? '<rect class="highlight" x="-10" y="-8" width="250" height="70" rx="6" fill="var(--hl)" opacity=".85"/>' : ''}
        <g filter="url(#c-shadow)" transform="rotate(${on ? -2 : letter.charCodeAt(0) % 2 ? 1 : -1} 115 28)">
          <rect width="232" height="56" fill="var(--card)"/>
          <rect y="14" width="232" height="1.5" fill="var(--stamp)" opacity=".5"/>
          <circle cx="28" cy="28" r="18" fill="none" stroke="var(--stamp)" stroke-width="3"/>
          <text x="28" y="36" text-anchor="middle" font-family="Fraunces" font-weight="900" font-size="22" fill="var(--stamp)">${letter}</text>
          <text x="58" y="37" font-family="Fraunces" font-weight="800" font-size="24" fill="var(--ink)">${question.options[letter]}</text>
        </g>
        <rect x="96" y="-8" width="40" height="14" fill="#F3E7B5" opacity=".85" transform="rotate(3 116 -1)"/>
      </g>`;
    }
    document.getElementById(target).innerHTML = out;
  };

  /** Label-maker tape: your stack is clean mint tape; buzzwords are red tape with pinked edges. */
  window.keywordLabels = function keywordLabels(target, ats, at) {
    const width = (label) => 46 + label.length * 14;
    const good = (label, [x, y], i) => {
      const w = width(label) + 28;
      return `<g transform="translate(${x - w / 2} ${y - 22}) rotate(${i % 2 ? 2 : -2})"><g class="token" style="--phase:-${(i * 0.3).toFixed(2)}s" filter="url(#c-shadow)">
        <rect width="${w}" height="44" rx="4" fill="var(--mint)"/>
        <rect x="10" y="11" width="22" height="22" fill="var(--card)" stroke="var(--ink)" stroke-width="2.5"/>
        <path d="M15 22 l5 5 l9 -11" fill="none" stroke="var(--ink)" stroke-width="3"/>
        <text x="${(w + 36) / 2}" y="29" text-anchor="middle" font-family="IBM Plex Mono" font-weight="700" font-size="19" fill="var(--ink)">${label}</text>
      </g></g>`;
    };
    const trap = (label, [x, y], i) => {
      const w = width(label);
      let edge = `M0 0 H${w}`;
      for (let yy = 0; yy < 44; yy += 8) edge += ` L${w + 6} ${yy + 4} L${w} ${yy + 8}`;
      edge += ` H0`;
      for (let yy = 44; yy > 0; yy -= 8) edge += ` L-6 ${yy - 4} L0 ${yy - 8}`;
      return `<g transform="translate(${x - w / 2} ${y - 22}) rotate(${i % 2 ? -3 : 3})"><g class="token" style="--phase:-${(i * 0.25).toFixed(2)}s" filter="url(#c-shadow)">
        <path d="${edge} Z" fill="var(--stamp)"/>
        <text x="${w / 2}" y="29" text-anchor="middle" font-family="IBM Plex Mono" font-weight="700" font-size="19" fill="var(--card)">✕ ${label}</text>
      </g></g>`;
    };
    document.getElementById(target).innerHTML =
      ats.upcoming.map((t, i) => good(t, at[t], i)).join('') +
      ats.traps.map((t, i) => trap(t, at[t], i)).join('');
  };

  /** Notebook-paper ground with a torn top edge. */
  window.notebookGround = function notebookGround(target) {
    let edge = 'M0 900 V800';
    for (let x = 0; x <= 1600; x += 20) edge += ` L${x} ${800 + ((x * 7) % 9) - 4}`;
    edge += ' V900 Z';
    document.getElementById(target).innerHTML = `
      <path d="${edge}" fill="var(--card)" filter="url(#c-shadow-lg)"/>
      <rect x="0" y="812" width="1600" height="88" fill="url(#c-lines)"/>
      <rect x="64" y="806" width="2.5" height="94" fill="var(--stamp)" opacity=".55"/>`;
  };
})();
