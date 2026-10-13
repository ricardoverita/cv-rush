/*
 * Direction C — Paper Trail: shared SVG symbols (prototype only).
 * A paper-craft world built from office documents: cut card shapes, split pins at the joints,
 * tape, stamps and crisp paper shadows. Tall paper-doll proportions (≈6 heads). Animation is
 * stop-motion: limbs swap poses in steps instead of tweening.
 */
(function () {
  const INK = 'var(--ink)';

  const svg = `
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <defs>
    <!-- Paper layers cast a short, crisp shadow. -->
    <filter id="c-shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="3" dy="4" stdDeviation="0.8" flood-color="#22304A" flood-opacity=".22"/>
    </filter>
    <filter id="c-shadow-lg" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="6" dy="8" stdDeviation="1.5" flood-color="#22304A" flood-opacity=".2"/>
    </filter>
    <pattern id="c-grid" width="28" height="28" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.4" fill="rgba(34,48,74,.12)"/>
    </pattern>
    <pattern id="c-lines" width="40" height="22" patternUnits="userSpaceOnUse">
      <rect y="20" width="40" height="2" fill="rgba(110,155,201,.45)"/>
    </pattern>

    <!-- The CV on a clipboard. Damage (coffee ring, torn corner, tape) shows with --cv-dmg. -->
    <symbol id="c-clipboard" viewBox="0 0 44 58" overflow="visible">
      <rect x="0" y="4" width="44" height="54" rx="3" fill="#B98A55"/>
      <rect x="4" y="10" width="36" height="44" fill="var(--card)"/>
      <text x="8" y="23" font-family="Fraunces" font-weight="800" font-size="10" fill="${INK}">CV</text>
      <g fill="${INK}" opacity=".35">
        <rect x="8" y="28" width="26" height="2"/><rect x="8" y="34" width="20" height="2"/>
        <rect x="8" y="40" width="24" height="2"/><rect x="8" y="46" width="16" height="2"/>
      </g>
      <g style="display: var(--cv-dmg, none)">
        <circle cx="30" cy="44" r="6.5" fill="none" stroke="#A0703F" stroke-width="1.8" opacity=".75"/>
        <path d="M40 40 L40 54 L28 54 L31 51 L29 48 L33 47 L32 44 L36 43 Z" fill="#B98A55"/>
        <rect x="2" y="16" width="20" height="7" fill="#FFF0A0" opacity=".75" transform="rotate(-24 12 19)"/>
      </g>
      <rect x="14" y="0" width="16" height="9" rx="2" fill="#AAB3BE" stroke="${INK}" stroke-width=".8"/>
    </symbol>

    <!-- A paper-doll runner. Colors: --skin --hair --top --top-d --pants --shoe. Accessories: --tail --cap --glasses. -->
    <symbol id="c-dev" viewBox="0 0 130 210" overflow="visible">
      <ellipse cx="58" cy="203" rx="30" ry="4" fill="rgba(34,48,74,.16)"/>
      <g class="c-body" filter="url(#c-shadow)">
        <g class="c-leg c-leg-back">
          <path d="M47 118 L58 118 L56 190 L48 190 Z" fill="var(--pants-d)"/>
          <path d="M44 188 L58 188 L62 197 L42 197 Z" fill="var(--shoe)"/>
        </g>
        <g class="c-arm c-arm-back">
          <path d="M42 56 L50 56 L47 112 L40 112 Z" fill="var(--top-d)"/>
          <circle cx="43.5" cy="114" r="4.2" fill="var(--skin)"/>
        </g>
        <g style="display: var(--tail, none)">
          <path d="M42 22 Q28 40 34 74 Q40 60 46 40 Z" fill="var(--hair)"/>
        </g>
        <path d="M42 52 L74 52 L69 124 L46 124 Z" fill="var(--top)"/>
        <path d="M52 52 L58 61 L64 52 Z" fill="var(--card)"/>
        <rect x="54" y="42" width="8" height="12" fill="var(--skin)"/>
        <circle cx="58" cy="30" r="16" fill="var(--skin)"/>
        <path d="M41 32 Q38 10 58 11 Q78 11 75 26 Q66 19 56 21 Q47 23 45 36 Z" fill="var(--hair)"/>
        <g style="display: var(--cap, none)">
          <path d="M41 26 Q42 6 60 7 Q77 8 76 24 Z" fill="var(--cap-color)"/>
          <rect x="40" y="22" width="37" height="6" rx="2" fill="var(--cap-color)" opacity=".8"/>
        </g>
        <circle cx="66" cy="29" r="2.2" fill="${INK}"/>
        <g style="display: var(--glasses, none)">
          <circle cx="66" cy="29" r="6" fill="none" stroke="${INK}" stroke-width="1.8"/>
          <path d="M60 28 L50 27" stroke="${INK}" stroke-width="1.6"/>
        </g>
        <path d="M64 38 Q68 40 72 37" fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/>
        <circle cx="62" cy="35" r="3" fill="#E98A7A" opacity=".45"/>
        <g class="c-leg c-leg-front">
          <path d="M57 118 L68 118 L66 190 L58 190 Z" fill="var(--pants)"/>
          <path d="M55 188 L69 188 L74 197 L54 197 Z" fill="var(--shoe)"/>
        </g>
        <!-- front arm holding the clipboard up: the CV is part of the silhouette -->
        <path d="M66 54 L74 56 L88 84 L81 88 Z" fill="var(--top)"/>
        <path d="M81 84 L88 89 L100 76 L95 71 Z" fill="var(--top)"/>
        <g class="c-cv-hold">
          <use href="#c-clipboard" x="78" y="42" width="52" height="68" transform="rotate(-8 104 76)"/>
        </g>
        <circle cx="97" cy="74" r="4.6" fill="var(--skin)"/>
        <!-- split pins -->
        <g fill="#C8A24A" stroke="${INK}" stroke-width=".8">
          <circle cx="52" cy="122" r="2.4"/><circle cx="63" cy="122" r="2.4"/>
          <circle cx="46" cy="58" r="2.4"/><circle cx="70" cy="58" r="2.4"/><circle cx="84" cy="86" r="2.2"/>
        </g>
      </g>
    </symbol>

    <!-- The recruiter: paper cutout with headset and a #1 mug. -->
    <symbol id="c-recruiter" viewBox="0 0 170 170" overflow="visible">
      <g filter="url(#c-shadow)">
        <path d="M44 92 L106 92 L114 170 L36 170 Z" fill="#B8A6D9"/>
        <path d="M64 92 L75 106 L86 92 Z" fill="var(--card)"/>
        <rect x="70" y="76" width="10" height="18" fill="#8E5B3E"/>
        <circle cx="75" cy="56" r="24" fill="#8E5B3E"/>
        <path d="M50 58 Q46 28 76 30 Q102 30 100 54 Q90 42 74 44 Q58 44 54 62 Z" fill="#2B2235"/>
        <circle cx="96" cy="32" r="12" fill="#2B2235"/>
        <path d="M50 56 Q50 26 76 26 Q102 26 102 56" fill="none" stroke="${INK}" stroke-width="3"/>
        <rect x="45" y="50" width="9" height="16" rx="3" fill="var(--mint)"/>
        <path d="M50 66 Q56 80 70 78" fill="none" stroke="${INK}" stroke-width="2.4"/>
        <circle cx="71" cy="78" r="3" fill="${INK}"/>
        <circle cx="86" cy="54" r="2.4" fill="${INK}"/>
        <path d="M80 66 Q86 70 92 64" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
        <!-- arm + mug -->
        <path d="M104 100 L132 86 L136 94 L110 110 Z" fill="#B8A6D9"/>
        <rect x="128" y="64" width="26" height="30" rx="3" fill="var(--card)"/>
        <path d="M154 70 Q164 78 154 88" fill="none" stroke="var(--card)" stroke-width="4"/>
        <text x="141" y="84" text-anchor="middle" font-family="Fraunces" font-weight="800" font-size="11" fill="var(--stamp)">#1</text>
      </g>
    </symbol>

    <!-- Kestrel Pay HQ: a tall tower cut from a blue folder, label on a folder tab. -->
    <symbol id="c-hq" viewBox="0 0 220 560" overflow="visible">
      <g filter="url(#c-shadow-lg)">
        <path d="M14 70 L120 70 L132 52 L206 52 L206 560 L14 560 Z" fill="var(--folder)"/>
        <g fill="none" stroke="${INK}" stroke-width="2" opacity=".55">
          ${Array.from({ length: 10 }, (_, r) =>
            Array.from(
              { length: 4 },
              (_, c) =>
                `<rect x="${34 + c * 42}" y="${104 + r * 44}" width="24" height="28" rx="2"/>`,
            ).join(''),
          ).join('')}
        </g>
        <rect x="-6" y="10" width="232" height="58" rx="4" fill="var(--card)"/>
        <path d="M8 46 L26 28 L24 38 L42 34 L26 48 L30 58 Z" fill="var(--stamp)"/>
        <text x="128" y="49" text-anchor="middle" font-family="Fraunces" font-weight="800" font-size="27" fill="${INK}">Kestrel Pay</text>
        <rect x="88" y="0" width="54" height="16" fill="#F3E7B5" opacity=".85" transform="rotate(-4 115 8)"/>
        <rect x="84" y="500" width="52" height="60" fill="var(--card)"/>
      </g>
    </symbol>

    <!-- ATS 9000: a giant office copier that scans and shreds. -->
    <symbol id="c-ats" viewBox="0 0 460 560" overflow="visible">
      <g filter="url(#c-shadow-lg)">
        <!-- input tray with a stack of CVs -->
        <path d="M-40 150 L80 150 L80 168 L-40 168 Z" fill="#D8D0BE"/>
        <rect x="-30" y="128" width="96" height="22" fill="var(--card)"/>
        <rect x="-26" y="122" width="96" height="10" fill="var(--card)" transform="rotate(-3 20 127)"/>
        <!-- body -->
        <rect x="20" y="170" width="420" height="390" rx="10" fill="#E4DED0"/>
        <rect x="10" y="120" width="440" height="56" rx="8" fill="#D2CAB8"/>
        <!-- glass window with the scanning bar -->
        <rect x="40" y="196" width="380" height="74" rx="4" fill="#2E3B55"/>
        <g class="c-scanbar"><rect x="48" y="202" width="26" height="62" fill="var(--hl)"/><rect x="40" y="202" width="60" height="62" fill="var(--hl)" opacity=".3"/></g>
        <!-- name plate -->
        <text x="230" y="352" text-anchor="middle" font-family="Fraunces" font-weight="900" font-size="58" fill="${INK}">ATS 9000</text>
        <text x="230" y="294" text-anchor="middle" font-family="IBM Plex Mono" font-weight="600" font-size="15" fill="${INK}" opacity=".7">APPLICANT TRACKING · SINCE 1998</text>
        <!-- control panel -->
        <rect x="60" y="392" width="150" height="70" rx="6" fill="#C9C1AE"/>
        <rect x="72" y="404" width="96" height="30" rx="3" fill="#B5D6B0"/>
        <text x="120" y="425" text-anchor="middle" font-family="IBM Plex Mono" font-weight="700" font-size="14" fill="${INK}">MIN 70%</text>
        <circle class="c-blink" cx="188" cy="419" r="10" fill="var(--mint)"/>
        <rect x="72" y="442" width="40" height="12" rx="3" fill="#9AA3AE"/><rect x="120" y="442" width="40" height="12" rx="3" fill="#9AA3AE"/>
        <!-- output slot -->
        <rect x="250" y="410" width="170" height="16" rx="3" fill="${INK}" opacity=".8"/>
        <text x="335" y="402" text-anchor="middle" font-family="IBM Plex Mono" font-weight="700" font-size="13" fill="var(--stamp)">REJECTED</text>
        <rect x="20" y="500" width="420" height="10" fill="#D2CAB8"/>
      </g>
    </symbol>

    <!-- A paper cloud pinned to the kraft sky. -->
    <symbol id="c-cloud" viewBox="0 0 200 80" overflow="visible">
      <path d="M24 70 Q2 68 10 50 Q14 32 38 36 Q46 10 80 14 Q108 2 126 26 Q164 18 172 44 Q196 50 184 70 Z" fill="var(--card)" filter="url(#c-shadow)"/>
      <circle cx="96" cy="26" r="5" fill="var(--stamp)"/><circle cx="94" cy="24" r="1.6" fill="#fff" opacity=".6"/>
    </symbol>
  </defs>
</svg>`;
  document.body.insertAdjacentHTML('afterbegin', svg);
})();
