/*
 * Direction B — Neon Pixel Campus: shared SVG symbols (prototype only).
 * Modern pixel art: every sprite is a character map rendered to crisp rects (1 map pixel = 7
 * scene units). Colors that change per runner are CSS custom properties, so the bots are the
 * same map with another palette. Two leg frames alternate with steps() for the run cycle.
 */
(function () {
  const PX = 7;

  // Map characters → fills. Unset vars fall back to transparent, so overlays only show when asked.
  const PALETTE = {
    k: '#0E0B1F',
    h: 'var(--hair)',
    H: 'var(--hair-hi)',
    s: 'var(--skin)',
    S: 'var(--skin-d)',
    t: 'var(--top)',
    T: 'var(--top-d)',
    p: 'var(--pants)',
    o: 'var(--shoe)',
    w: '#F2F4FF',
    l: '#8A8FB5',
    c: '#2DE2E6',
    x: 'var(--cvx, #F2F4FF)',
    y: 'var(--cvy, #F2F4FF)',
    z: 'var(--cvz, #0E0B1F)',
    q: 'var(--tail, transparent)',
    a: 'var(--cap, transparent)',
    g: 'var(--glasses, transparent)',
    // hologram tints
    A: '#7DF3F5',
    B: '#2DE2E6',
    C: '#167C86',
    D: '#0B3F4A',
    m: '#FF3E9A',
  };

  /** Renders a character map as horizontal runs of rects. */
  function pixels(rows, size = PX, ox = 0, oy = 0) {
    let out = '';
    rows.forEach((row, y) => {
      let x = 0;
      while (x < row.length) {
        const ch = row[x];
        let run = 1;
        while (row[x + run] === ch) run++;
        if (ch !== '.') {
          out += `<rect x="${(ox + x) * size}" y="${(oy + y) * size}" width="${run * size + 0.4}" height="${size + 0.4}" fill="${PALETTE[ch]}"/>`;
        }
        x += run;
      }
    });
    return out;
  }

  // 20 × 21 runner holding the CV up in front (cols 13–19, a paper sheet). x/y/z are the CV's
  // damage pixels: x turns into glitch, y and z go missing (a bitten corner).
  const UPPER = [
    '....kkkkkk..........',
    '...kHHHHHHk.........',
    '..khhhhhhhhk........',
    '..khhhhsssssk' + 'kkkkkkk',
    '..khhhssskssk' + 'kccwwwk',
    '..khhsssskssk' + 'kwwwxwk',
    '..khSsssssssk' + 'kllllwk',
    '...kssssSssk.' + 'kwwwwxk',
    '....kkkkkkk..' + 'klllwwk',
    '...ktttttttss' + 'kwwwwyk',
    '..kttttttTTk.' + 'kllwyyz',
    '..kttttttTTk.' + 'kkkkkzz',
    '..kttttttTk.........',
    '..kTttttTTk.........',
    '...kpppppk..........',
    '...kppkppk..........',
  ];
  const LEGS_A = [
    '..kppk.kppk.........',
    '.kppk...kppk........',
    '.kpk.....kpk........',
    'kook.....kook.......',
    'kkkk.....kkkk.......',
  ];
  const LEGS_B = [
    '...kppkppk..........',
    '...kppkpk...........',
    '...kpk.kpk..........',
    '..kook.kook.........',
    '..kkkk.kkkk.........',
  ];
  const TAIL = ['', '', 'qq', 'qqq', 'qq', 'q'];
  const CAP = ['', '....aaaaaa', '...aaaaaaaaa', '........aaaaa'];
  const GLASSES = ['', '', '', '.......ggggg', '........g.g', '........ggg'];

  // Recruiter on a video call: 16 × 16 hologram bust with a headset.
  const RECRUITER = [
    '.....CCCCCC.....',
    '....CBBBBBBC....',
    '...CBBBBBBBBC...',
    '..mCBAAAAAABCm..',
    '..mCAAAAAAAACm..',
    '..mCADAAAADACm..',
    '..mmAAAAAAAAmm..',
    '...CAAAAAAAAC...',
    '...CmAADDAAAC...',
    '....CAAAAAAC....',
    '.....CAAAAC.....',
    '...BBBBBBBBBB...',
    '..BBAAAAAAAABB..',
    '.BBBBBBBBBBBBBB.',
    'BBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBB',
  ];

  // Kestrel mark: a small pixel bird for the HQ sign.
  const KESTREL = ['c.......', 'cc......', '.ccccc..', '..ccccc.', '...cc.cc', '....c...'];

  const stepWindows = (x0, y0, cols, rows, dx, dy, w, h, lit) => {
    let out = '';
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const on = lit(r, c);
        out += `<rect x="${x0 + c * dx}" y="${y0 + r * dy}" width="${w}" height="${h}" fill="${on || '#2A2456'}"/>`;
      }
    }
    return out;
  };

  const svg = `
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <defs>
    <filter id="b-glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="6" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <pattern id="b-scan" width="8" height="8" patternUnits="userSpaceOnUse">
      <rect width="8" height="3" fill="rgba(45,226,230,.22)"/>
    </pattern>
    <linearGradient id="b-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0E0B1F"/>
      <stop offset=".7" stop-color="#1E1A3D"/>
      <stop offset="1" stop-color="#3B2F6E"/>
    </linearGradient>

    <symbol id="b-dev" viewBox="0 0 140 147" overflow="visible" shape-rendering="crispEdges">
      <g class="b-body">
        <g class="b-tail">${pixels(TAIL)}</g>
        ${pixels(UPPER)}
        ${pixels(CAP)}
        ${pixels(GLASSES)}
        <g class="b-frame-a">${pixels(LEGS_A, PX, 0, 16)}</g>
        <g class="b-frame-b">${pixels(LEGS_B, PX, 0, 16)}</g>
      </g>
    </symbol>

    <symbol id="b-recruiter" viewBox="0 0 112 112" overflow="visible" shape-rendering="crispEdges">
      ${pixels(RECRUITER)}
    </symbol>

    <!-- Kestrel Pay HQ: a glass tower with a neon crown. -->
    <symbol id="b-hq" viewBox="0 0 210 580" overflow="visible" shape-rendering="crispEdges">
      <rect x="20" y="96" width="170" height="484" fill="#231D4A"/>
      <rect x="20" y="96" width="170" height="484" fill="none" stroke="#3B2F6E" stroke-width="6"/>
      <rect x="34" y="80" width="142" height="16" fill="#3B2F6E"/>
      ${stepWindows(38, 120, 6, 18, 24, 25, 14, 14, (r, c) => ((r * 7 + c * 3) % 5 === 0 ? '#FFB547' : (r + c) % 4 === 0 ? '#2DE2E6' : ''))}
      <rect x="99" y="0" width="12" height="80" fill="#3B2F6E"/>
      <rect class="b-blink" x="97" y="-8" width="16" height="12" fill="#FF3E9A"/>
      <g filter="url(#b-glow)">
        <rect x="-14" y="22" width="238" height="56" fill="#0E0B1F" stroke="#2DE2E6" stroke-width="5"/>
        ${pixels(KESTREL, 4, -1, 10)}
        <text x="120" y="61" text-anchor="middle" font-family="Silkscreen" font-size="25" fill="#2DE2E6">KESTREL PAY</text>
      </g>
    </symbol>

    <!-- A holographic portal: stepped arch, scanlines inside. --ring sets the color. -->
    <symbol id="b-portal" viewBox="0 0 140 140" overflow="visible" shape-rendering="crispEdges">
      <path d="M14 140 V42 H28 V28 H42 V14 H98 V28 H112 V42 H126 V140 Z" fill="#0E0B1F"/>
      <g class="b-portal-inner">
        <path d="M14 140 V42 H28 V28 H42 V14 H98 V28 H112 V42 H126 V140 Z" fill="var(--ring, #2DE2E6)" opacity=".18"/>
        <path d="M14 140 V42 H28 V28 H42 V14 H98 V28 H112 V42 H126 V140 Z" fill="url(#b-scan)"/>
      </g>
      <path d="M14 140 V42 H28 V28 H42 V14 H98 V28 H112 V42 H126 V140" fill="none" stroke="var(--ring, #2DE2E6)" stroke-width="8"/>
      <rect x="8" y="132" width="124" height="8" fill="var(--ring, #2DE2E6)"/>
    </symbol>

    <!-- Server rack: platform and scenery. LEDs blink in steps. -->
    <symbol id="b-rack" viewBox="0 0 126 112" overflow="visible" shape-rendering="crispEdges">
      <rect x="0" y="0" width="126" height="112" fill="#2A2456" stroke="#8A8FB5" stroke-width="4"/>
      <rect x="0" y="0" width="126" height="10" fill="#2DE2E6"/>
      <g fill="#1E1A3D">
        <rect x="10" y="20" width="106" height="18"/><rect x="10" y="46" width="106" height="18"/><rect x="10" y="72" width="106" height="18"/>
      </g>
      <g class="b-leds">
        <rect x="16" y="26" width="6" height="6" fill="#B7F34B"/><rect x="28" y="26" width="6" height="6" fill="#2DE2E6"/>
        <rect x="16" y="52" width="6" height="6" fill="#FFB547"/><rect x="40" y="52" width="6" height="6" fill="#B7F34B"/>
        <rect x="28" y="78" width="6" height="6" fill="#B7F34B"/><rect x="16" y="78" width="6" height="6" fill="#FF3E9A"/>
      </g>
    </symbol>

    <!-- ATS 9000: a mainframe cabinet with a scanning eye. -->
    <symbol id="b-ats" viewBox="0 0 380 560" overflow="visible" shape-rendering="crispEdges">
      <rect x="0" y="40" width="380" height="520" fill="#231D4A" stroke="#8A8FB5" stroke-width="6"/>
      <rect x="0" y="40" width="380" height="20" fill="#FF3E9A"/>
      <rect x="30" y="0" width="320" height="56" fill="#0E0B1F" stroke="#FF3E9A" stroke-width="5"/>
      <text x="190" y="40" text-anchor="middle" font-family="Silkscreen" font-size="30" fill="#FF3E9A" filter="url(#b-glow)">ATS-9000</text>
      <!-- the eye -->
      <rect x="40" y="90" width="300" height="110" fill="#0E0B1F" stroke="#2DE2E6" stroke-width="5"/>
      <g class="b-eye">
        <rect x="90" y="118" width="56" height="56" fill="#FF3E9A"/>
        <rect x="234" y="118" width="56" height="56" fill="#FF3E9A"/>
        <rect x="104" y="132" width="20" height="20" fill="#F2F4FF"/>
        <rect x="248" y="132" width="20" height="20" fill="#F2F4FF"/>
      </g>
      <!-- LED matrix -->
      <g class="b-leds">
        ${stepWindows(40, 230, 6, 6, 25, 22, 12, 10, (r, c) => ((r * 5 + c * 7) % 6 === 0 ? '#B7F34B' : (r * 3 + c) % 7 === 0 ? '#2DE2E6' : ''))}
      </g>
      <!-- minimum match plate -->
      <rect x="220" y="216" width="130" height="58" fill="#0E0B1F" stroke="#FFB547" stroke-width="4"/>
      <text x="285" y="236" text-anchor="middle" font-family="Silkscreen" font-size="12" fill="#FFB547">MIN MATCH</text>
      <text x="285" y="265" text-anchor="middle" font-family="Silkscreen" font-size="24" fill="#FFB547">70%</text>
      <!-- reject slot -->
      <text x="285" y="298" text-anchor="middle" font-family="Silkscreen" font-size="13" fill="#FF3E9A">REJECT</text>
      <rect x="220" y="304" width="130" height="22" fill="#0E0B1F" stroke="#FF3E9A" stroke-width="4"/>
      <!-- tape reels -->
      <g fill="none" stroke="#8A8FB5" stroke-width="6">
        <rect x="210" y="380" width="56" height="56"/><rect x="290" y="380" width="56" height="56"/>
      </g>
      <g class="b-reel" fill="#8A8FB5"><rect x="232" y="402" width="12" height="12"/><rect x="312" y="402" width="12" height="12"/></g>
    </symbol>

    <!-- Delivery drone: "We'll get back to you", sending forever. -->
    <symbol id="b-drone" viewBox="0 0 300 90" overflow="visible" shape-rendering="crispEdges">
      <rect x="0" y="6" width="56" height="6" fill="#8A8FB5"/><rect x="100" y="6" width="56" height="6" fill="#8A8FB5"/>
      <rect x="24" y="12" width="8" height="12" fill="#8A8FB5"/><rect x="124" y="12" width="8" height="12" fill="#8A8FB5"/>
      <rect x="20" y="24" width="116" height="22" fill="#3B2F6E" stroke="#2DE2E6" stroke-width="3"/>
      <rect class="b-blink" x="70" y="30" width="10" height="10" fill="#FF3E9A"/>
      <rect x="60" y="46" width="4" height="12" fill="#8A8FB5"/><rect x="92" y="46" width="4" height="12" fill="#8A8FB5"/>
      <rect x="52" y="58" width="52" height="32" fill="#F2F4FF" stroke="#0E0B1F" stroke-width="3"/>
      <path d="M52 58 L78 76 L104 58" fill="none" stroke="#0E0B1F" stroke-width="3"/>
    </symbol>
  </defs>
</svg>`;
  document.body.insertAdjacentHTML('afterbegin', svg);

  /** Pixel stars for the night sky: deterministic so screenshots match. */
  window.pixelStars = function pixelStars(target, count, maxY) {
    let seed = 7;
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    let out = '';
    for (let i = 0; i < count; i++) {
      const size = rand() > 0.85 ? 6 : 3;
      out += `<rect class="${rand() > 0.7 ? 'b-twinkle' : ''}" style="--phase:-${(rand() * 3).toFixed(2)}s" x="${Math.round(rand() * 1600)}" y="${Math.round(rand() * maxY)}" width="${size}" height="${size}" fill="#F2F4FF" opacity="${(0.4 + rand() * 0.6).toFixed(2)}"/>`;
    }
    document.getElementById(target).innerHTML = out;
  };
})();
