/*
 * Direction B — scene helpers shared by the three B prototypes (prototype only).
 */
(function () {
  /** Walkway tile joints; the group scrolls in pixel steps to sell the run. */
  window.groundJoints = function groundJoints(target) {
    let out = '';
    for (let x = 0; x < 1700; x += 84) {
      out += `<rect x="${x}" y="806" width="4" height="94" fill="#3B2F6E"/>`;
    }
    document.getElementById(target).innerHTML = out;
  };

  /** Far campus skyline (no signs): dark blocks with a few lit windows. */
  window.campusSkyline = function campusSkyline(target, blocks) {
    let out = '';
    blocks.forEach(([x, y, w], i) => {
      out += `<rect x="${x}" y="${y}" width="${w}" height="${800 - y}" fill="#1E1A3D"/>`;
      out += `<rect x="${x + 14}" y="${y - 24}" width="${Math.round(w * 0.6)}" height="24" fill="#2A2456"/>`;
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c * 28 + 14 < w - 14; c++) {
          const k = (i * 7 + r * 5 + c * 3) % 9;
          if (k === 0 || k === 4) {
            out += `<rect x="${x + 14 + c * 28}" y="${y + 24 + r * 46}" width="14" height="14" fill="${k === 0 ? '#FFB547' : '#2DE2E6'}" opacity=".6"/>`;
          }
        }
      }
    });
    document.getElementById(target).innerHTML = out;
  };

  /** Keyword tokens: your stack is a clean data packet; buzzwords are glitched blocks. */
  window.keywordTokens = function keywordTokens(target, ats, at) {
    const width = (label) => 40 + label.length * 15;
    const good = (label, [x, y], i) => {
      const w = width(label) + 30;
      return `<g transform="translate(${x - w / 2} ${y - 24})"><g class="token" style="--phase:-${(i * 0.3).toFixed(2)}s">
        <rect width="${w}" height="48" fill="#0E0B1F" stroke="#2DE2E6" stroke-width="4"/>
        <rect x="10" y="12" width="24" height="24" fill="#B7F34B"/>
        <path d="M22 16 v16 M14 24 h16" stroke="#0E0B1F" stroke-width="5"/>
        <text x="${(w + 34) / 2}" y="32" text-anchor="middle" font-family="Silkscreen" font-size="18" fill="#F2F4FF">${label}</text>
      </g></g>`;
    };
    const trap = (label, [x, y], i) => {
      const w = width(label);
      return `<g transform="translate(${x - w / 2} ${y - 24})"><g class="token" style="--phase:-${(i * 0.25).toFixed(2)}s">
        <rect x="-5" y="4" width="${w}" height="44" fill="#2DE2E6" opacity=".55"/>
        <rect width="${w}" height="44" fill="#FF3E9A"/>
        <rect x="${w - 22}" y="-8" width="12" height="8" fill="#FF3E9A"/><rect x="8" y="44" width="16" height="8" fill="#FF3E9A"/>
        <text x="${w / 2}" y="30" text-anchor="middle" font-family="Silkscreen" font-size="18" fill="#0E0B1F">!${label}</text>
      </g></g>`;
    };
    document.getElementById(target).innerHTML =
      ats.upcoming.map((t, i) => good(t, at[t], i)).join('') +
      ats.traps.map((t, i) => trap(t, at[t], i)).join('');
  };

  /** Four answer plates (A top → D ground) next to the portals; the chosen one turns magenta. */
  window.answerPlates = function answerPlates(target, question) {
    const ys = { A: 300, B: 440, C: 580, D: 720 };
    let out = '';
    for (const [letter, y] of Object.entries(ys)) {
      const on = question.selected === letter;
      const edge = on ? '#FF3E9A' : '#2DE2E6';
      out += `<g transform="translate(1176 ${y})" shape-rendering="crispEdges">
        <rect width="232" height="56" fill="${on ? '#3A1030' : '#0E0B1F'}" stroke="${edge}" stroke-width="4"/>
        <rect x="10" y="10" width="36" height="36" fill="${edge}"/>
        <text x="28" y="37" text-anchor="middle" font-family="Silkscreen" font-size="24" fill="#0E0B1F">${letter}</text>
        <text x="60" y="37" font-family="Pixelify Sans" font-weight="600" font-size="25" fill="#F2F4FF">${question.options[letter]}</text>
      </g>`;
    }
    document.getElementById(target).innerHTML = out;
  };
})();
