/*
 * Direction A — Corporate Arcade: shared SVG symbols (prototype only).
 * Thick ink outlines, flat colors, chunky proportions (≈3 heads tall), hard offset shadows.
 * Variants (bots) come from CSS custom properties on each <use>.
 */
(function () {
  const INK = 'var(--ink)';
  const svg = `
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <defs>
    <pattern id="a-dots" width="10" height="10" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.6" fill="rgba(29,27,47,.18)"/>
    </pattern>

    <!-- The CV: a sheet in a clear sleeve. Damage layers switch on with --cv-*. -->
    <symbol id="a-cv" viewBox="0 0 48 60" overflow="visible">
      <g class="a-cv-sheet">
        <rect x="2" y="2" width="44" height="56" rx="5" fill="#fff" stroke="${INK}" stroke-width="4"/>
        <text x="11" y="18" font-family="Lilita One" font-size="13" fill="var(--tomato)">CV</text>
        <rect x="10" y="24" width="28" height="4" rx="2" fill="var(--ink-soft)"/>
        <rect x="10" y="32" width="22" height="4" rx="2" fill="var(--ink-soft)"/>
        <rect x="10" y="40" width="26" height="4" rx="2" fill="var(--ink-soft)"/>
        <g style="display: var(--cv-stain, none)">
          <circle cx="33" cy="46" r="8" fill="none" stroke="#B9783A" stroke-width="2.5" opacity=".75"/>
        </g>
        <g style="display: var(--cv-fold, none)">
          <path d="M46 2 L46 16 L32 2 Z" fill="var(--paper-shadow)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
        </g>
      </g>
    </symbol>

    <!-- A runner. Colors: --skin --hair --top --pants --shoe. Accessories: --glasses --cap --tail. -->
    <symbol id="a-dev" viewBox="0 0 150 190" overflow="visible">
      <ellipse cx="70" cy="184" rx="38" ry="7" fill="rgba(29,27,47,.18)"/>
      <g class="a-body">
        <g class="a-leg a-leg-back">
          <path d="M62 132 L58 166" stroke="${INK}" stroke-width="17" stroke-linecap="round"/>
          <path d="M62 132 L58 166" stroke="var(--pants)" stroke-width="8" stroke-linecap="round"/>
          <ellipse cx="54" cy="171" rx="15" ry="8" fill="var(--shoe)" stroke="${INK}" stroke-width="4"/>
        </g>
        <g class="a-arm a-arm-back">
          <path d="M52 100 L34 124" stroke="${INK}" stroke-width="15" stroke-linecap="round"/>
          <path d="M52 100 L34 124" stroke="var(--top)" stroke-width="7" stroke-linecap="round"/>
        </g>
        <rect x="42" y="90" width="52" height="50" rx="18" fill="var(--top)" stroke="${INK}" stroke-width="5"/>
        <path d="M54 92 Q68 104 82 92" fill="none" stroke="${INK}" stroke-width="3" opacity=".35"/>
        <g class="a-leg a-leg-front">
          <path d="M76 132 L82 166" stroke="${INK}" stroke-width="17" stroke-linecap="round"/>
          <path d="M76 132 L82 166" stroke="var(--pants)" stroke-width="8" stroke-linecap="round"/>
          <ellipse cx="88" cy="171" rx="15" ry="8" fill="var(--shoe)" stroke="${INK}" stroke-width="4"/>
        </g>
        <!-- Head -->
        <circle cx="70" cy="54" r="36" fill="var(--skin)" stroke="${INK}" stroke-width="5"/>
        <path d="M36 50 Q36 16 70 16 Q104 16 104 46 Q92 30 70 34 Q50 36 36 50 Z" fill="var(--hair)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
        <g style="display: var(--tail, none)">
          <path d="M38 40 Q14 56 26 86 Q34 66 44 52 Z" fill="var(--hair)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
        </g>
        <g style="display: var(--cap, none)">
          <path d="M34 40 Q36 12 70 12 Q100 12 104 34 L126 40 Q118 46 100 44 Q70 38 34 44 Z" fill="var(--cap-color, var(--tomato))" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
        </g>
        <ellipse cx="80" cy="56" rx="4.5" ry="6" fill="${INK}"/>
        <ellipse cx="98" cy="56" rx="4.5" ry="6" fill="${INK}"/>
        <g style="display: var(--glasses, none)">
          <circle cx="80" cy="56" r="10" fill="none" stroke="${INK}" stroke-width="3.5"/>
          <circle cx="99" cy="56" r="10" fill="none" stroke="${INK}" stroke-width="3.5"/>
          <path d="M90 56 L89 56" stroke="${INK}" stroke-width="3.5"/>
        </g>
        <path d="M84 74 Q92 80 100 72" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
        <circle cx="74" cy="70" r="5" fill="#FF8C7A" opacity=".55"/>
        <!-- Front arm holding the CV high: the CV is part of the silhouette -->
        <g class="a-arm a-arm-front">
          <path d="M86 100 L112 82" stroke="${INK}" stroke-width="15" stroke-linecap="round"/>
          <path d="M86 100 L112 82" stroke="var(--top)" stroke-width="7" stroke-linecap="round"/>
          <g class="a-cv-hold" transform="translate(100 36) rotate(-10)">
            <use href="#a-cv" width="48" height="60"/>
          </g>
          <circle cx="114" cy="80" r="8" fill="var(--skin)" stroke="${INK}" stroke-width="4"/>
        </g>
      </g>
    </symbol>

    <!-- The recruiter: friendly, headset, coffee; behind a pop-up screening booth. -->
    <symbol id="a-recruiter" viewBox="0 0 220 240" overflow="visible">
      <circle cx="96" cy="70" r="40" fill="#8C5A3C" stroke="${INK}" stroke-width="5"/>
      <path d="M56 70 Q52 24 98 24 Q144 26 138 74 Q128 44 98 46 Q70 46 56 70 Z" fill="#2B2235" stroke="${INK}" stroke-width="5"/>
      <circle cx="140" cy="60" r="20" fill="#2B2235" stroke="${INK}" stroke-width="5"/>
      <path d="M56 64 Q56 24 98 24 Q140 24 140 64" fill="none" stroke="${INK}" stroke-width="5"/>
      <rect x="48" y="62" width="14" height="24" rx="6" fill="var(--teal)" stroke="${INK}" stroke-width="4"/>
      <path d="M58 86 Q70 104 92 100" fill="none" stroke="${INK}" stroke-width="4"/>
      <circle cx="94" cy="100" r="5" fill="${INK}"/>
      <ellipse cx="84" cy="70" rx="4.5" ry="6" fill="${INK}"/>
      <ellipse cx="108" cy="70" rx="4.5" ry="6" fill="${INK}"/>
      <path d="M86 88 Q98 98 112 86" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
      <rect x="40" y="110" width="116" height="80" rx="26" fill="var(--sunflower)" stroke="${INK}" stroke-width="5"/>
      <path d="M150 128 L178 112" stroke="${INK}" stroke-width="15" stroke-linecap="round"/>
      <path d="M150 128 L178 112" stroke="var(--sunflower)" stroke-width="7" stroke-linecap="round"/>
      <rect x="168" y="84" width="30" height="34" rx="6" fill="#fff" stroke="${INK}" stroke-width="4"/>
      <path d="M198 92 Q210 100 198 110" fill="none" stroke="${INK}" stroke-width="4"/>
      <path d="M176 78 Q180 70 176 62 M186 78 Q190 70 186 62" fill="none" stroke="${INK}" stroke-width="3" opacity=".5"/>
    </symbol>

    <!-- Kestrel Pay HQ: the goal, always visible ahead. -->
    <symbol id="a-hq" viewBox="0 0 220 560" overflow="visible">
      <rect x="30" y="80" width="160" height="480" rx="10" fill="var(--hq)" stroke="${INK}" stroke-width="6"/>
      <rect x="30" y="80" width="160" height="480" rx="10" fill="url(#a-dots)"/>
      <g fill="#FFF3C4" stroke="${INK}" stroke-width="3">
        ${Array.from({ length: 9 }, (_, r) =>
          Array.from(
            { length: 4 },
            (_, c) =>
              `<rect x="${48 + c * 36}" y="${150 + r * 44}" width="22" height="26" rx="3"/>`,
          ).join(''),
        ).join('')}
      </g>
      <rect x="-20" y="8" width="260" height="68" rx="16" fill="var(--tomato)" stroke="${INK}" stroke-width="6"/>
      <path d="M-2 46 L24 30 L18 43 L38 41 L18 54 Z" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <text x="138" y="55" text-anchor="middle" font-family="Lilita One" font-size="30" fill="#fff" stroke="${INK}" stroke-width="1">KESTREL PAY</text>
      <rect x="86" y="500" width="48" height="60" rx="6" fill="var(--teal)" stroke="${INK}" stroke-width="5"/>
    </symbol>

    <!-- An elevator door for one answer. -->
    <symbol id="a-door" viewBox="0 0 150 150" overflow="visible">
      <rect x="10" y="20" width="130" height="126" rx="12" fill="#E9E3D6" stroke="${INK}" stroke-width="6"/>
      <g class="a-door-panels">
        <rect class="a-panel-l" x="24" y="34" width="51" height="112" fill="#C9D6E3" stroke="${INK}" stroke-width="4"/>
        <rect class="a-panel-r" x="75" y="34" width="51" height="112" fill="#C9D6E3" stroke="${INK}" stroke-width="4"/>
      </g>
    </symbol>

    <symbol id="a-takehome" viewBox="0 0 140 120" overflow="visible">
      <rect x="6" y="30" width="128" height="86" rx="8" fill="var(--lilac)" stroke="${INK}" stroke-width="6"/>
      <rect x="62" y="30" width="16" height="86" fill="var(--sunflower)" stroke="${INK}" stroke-width="4"/>
      <path d="M70 30 Q40 2 30 22 Q44 32 70 30 Q100 2 110 22 Q96 32 70 30" fill="var(--sunflower)" stroke="${INK}" stroke-width="4"/>
      <rect x="12" y="66" width="116" height="40" rx="8" fill="#fff" stroke="${INK}" stroke-width="3"/>
      <text x="70" y="83" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="12" fill="${INK}">TAKE-HOME TASK</text>
      <text x="70" y="99" text-anchor="middle" font-family="Nunito" font-weight="800" font-size="11" fill="${INK}">"just 8 hours"</text>
    </symbol>

    <!-- ATS 9000: a cheerful scanning gate the whole lane runs through. -->
    <symbol id="a-ats" viewBox="0 0 460 600" overflow="visible">
      <!-- antenna -->
      <path d="M230 40 V0" stroke="${INK}" stroke-width="6"/>
      <circle class="a-ats-lamp" cx="230" cy="0" r="14" fill="var(--tomato)" stroke="${INK}" stroke-width="5"/>
      <!-- pillars -->
      <rect x="0" y="150" width="96" height="450" rx="16" fill="var(--teal)" stroke="${INK}" stroke-width="6"/>
      <rect x="364" y="150" width="96" height="450" rx="16" fill="var(--teal)" stroke="${INK}" stroke-width="6"/>
      <rect x="0" y="150" width="96" height="450" rx="16" fill="url(#a-dots)"/>
      <rect x="364" y="150" width="96" height="450" rx="16" fill="url(#a-dots)"/>
      <!-- the inside of the gate -->
      <rect x="96" y="170" width="268" height="430" fill="rgba(29,27,47,.08)"/>
      <!-- head -->
      <rect x="-20" y="34" width="500" height="146" rx="28" fill="var(--sunflower)" stroke="${INK}" stroke-width="6"/>
      <rect x="40" y="58" width="200" height="98" rx="18" fill="${INK}"/>
      <g class="a-ats-eyes">
        <circle cx="96" cy="107" r="22" fill="#fff"/>
        <circle cx="184" cy="107" r="22" fill="#fff"/>
        <circle class="a-ats-pupil" cx="100" cy="107" r="10" fill="${INK}"/>
        <circle class="a-ats-pupil" cx="188" cy="107" r="10" fill="${INK}"/>
      </g>
      <text x="350" y="96" text-anchor="middle" font-family="Lilita One" font-size="44" fill="${INK}">ATS</text>
      <text x="350" y="140" text-anchor="middle" font-family="Lilita One" font-size="40" fill="var(--tomato)" stroke="${INK}" stroke-width="1.5">9000</text>
      <!-- threshold plaque on the left pillar -->
      <rect x="10" y="230" width="76" height="86" rx="12" fill="#fff" stroke="${INK}" stroke-width="4"/>
      <text x="48" y="256" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="13" fill="${INK}">MIN</text>
      <text x="48" y="294" text-anchor="middle" font-family="Lilita One" font-size="30" fill="${INK}">70%</text>
      <!-- pass / fail lamps on the right pillar -->
      <circle cx="412" cy="250" r="22" fill="#9be8a0" stroke="${INK}" stroke-width="5"/>
      <path d="M401 250 l8 8 l14 -16" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="412" cy="314" r="22" fill="#ffb3ad" stroke="${INK}" stroke-width="5"/>
      <path d="M403 305 l18 18 M421 305 l-18 18" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      <!-- the scan beam sweeping the gate -->
      <g class="a-ats-beam">
        <rect x="96" y="186" width="268" height="20" fill="var(--tomato)" opacity=".85"/>
        <rect x="96" y="176" width="268" height="40" fill="var(--tomato)" opacity=".2"/>
      </g>
    </symbol>

    <!-- The recruiter's pop-up booth (awning + counter). -->
    <symbol id="a-booth" viewBox="0 0 320 300" overflow="visible">
      <path d="M20 60 V300 M300 60 V300" stroke="${INK}" stroke-width="8"/>
      <path d="M0 20 H320 L306 70 H14 Z" fill="#fff" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
      <path d="M40 20 L36 70 M100 20 L96 70 M160 20 V70 M220 20 L224 70 M280 20 L284 70" stroke="${INK}" stroke-width="4"/>
      <path d="M40 20 H100 L96 70 H36 Z M160 20 H220 L224 70 H160 Z M280 20 H320 L306 70 H284 Z" fill="var(--tomato)"/>
      <path d="M0 20 H320 L306 70 H14 Z" fill="none" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
      <rect x="-6" y="190" width="332" height="110" rx="12" fill="var(--teal)" stroke="${INK}" stroke-width="6"/>
      <rect x="-6" y="190" width="332" height="110" rx="12" fill="url(#a-dots)"/>
      <rect x="40" y="214" width="240" height="56" rx="12" fill="#fff" stroke="${INK}" stroke-width="4"/>
      <text x="160" y="252" text-anchor="middle" font-family="Lilita One" font-size="28" fill="${INK}">TALENT TEAM</text>
    </symbol>

    <symbol id="a-cloud" viewBox="0 0 200 80" overflow="visible">
      <path d="M30 70 Q4 70 10 48 Q16 28 42 34 Q50 6 86 12 Q112 0 130 26 Q170 18 176 46 Q198 52 186 70 Z" fill="#fff" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    </symbol>
  </defs>
</svg>`;
  document.body.insertAdjacentHTML('afterbegin', svg);
})();
