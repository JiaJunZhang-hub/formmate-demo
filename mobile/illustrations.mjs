export function escapeHtml(value) { return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])); }

export function portrait(coach, size = '') {
  const hair = coach.id === 'mina' ? '<path d="M29 46c-8-36 48-42 44-10l-7 27-6-34-24 18-5 22Z" fill="#354338"/>' : coach.id === 'ryo' ? '<path d="M30 39q-1-26 23-25 28 0 19 27L59 29 32 45Z" fill="#354338"/>' : '<path d="M28 45q-5-31 23-31 28 1 22 34L63 31l-12 8-18 7Z" fill="#6a503d"/>';
  return `<svg class="portrait ${size}" viewBox="0 0 100 100" role="img" aria-label="${escapeHtml(coach.name)}のサンプルイラスト"><rect width="100" height="100" rx="28" fill="${coach.color}" opacity=".13"/><path d="M16 104q0-43 35-39 34-3 34 39" fill="${coach.color}"/><path d="M44 59v13h14V59" fill="#d9ac91"/><ellipse cx="51" cy="43" rx="20" ry="25" fill="#dfb699"/>${hair}<path d="M43 46v2m16-2v2" stroke="#34483c" stroke-width="2" stroke-linecap="round"/><path d="M46 57q6 4 11-1" stroke="#936e59" stroke-width="2" fill="none"/></svg>`;
}

export function movement({ pose = 'squat', phase = 0, color = '#b96e58', label = '動作のサンプル', self = false, guide = false } = {}) {
  let legs = 'M126 151 114 208 101 266M145 151l15 57 14 58';
  let arms = 'M124 90 99 132 67 116M149 90l27 41 31-15';
  let torso = 'M124 79q16-10 29 4l8 76q-20 11-46-2Z';
  let headY = 49;
  if (pose === 'squat' && phase === 1) { legs = 'm119 173-42 36 39 57m43-91 39 32-32 59'; torso = 'M124 105q17-8 30 5l18 70q-27 14-58-2Z'; arms = 'M130 119 93 141 59 134M154 119l23 24 34-10'; headY = 75; }
  if (pose === 'hinge' && phase === 1) { torso = 'M127 101q7-20 22-10l50 43-33 31-52-48Z'; arms = 'm173 125 11 50-6 25m-27-74 8 48-9 23'; headY = 103; legs = 'm128 151-14 57-13 58m34-110 24 51 15 59'; }
  if (pose === 'reach' && phase === 1) arms = 'M125 90 100 61 91 17M150 90l26-30 10-43';
  if (phase === 2) arms = pose === 'reach' ? 'M125 90 91 92 61 74M150 90l35 2 28-18' : 'M125 90 99 129 70 142M149 90l27 39 30 13';
  const headX = pose === 'hinge' && phase === 1 ? 204 : 140;
  const skeleton = guide ? `<path d="M140 ${headY + 25}v72m0-52-42 39m42-39 42 39m-42 13-20 50-17 52m37-102 20 50 15 52" fill="none" stroke="#668b6d" stroke-width="2" stroke-dasharray="4 5" opacity=".6"/>` : '';
  return `<svg class="movement" viewBox="0 0 280 300" role="img" aria-label="${escapeHtml(label)}"><ellipse cx="140" cy="277" rx="98" ry="10" fill="#5c6b4720"/><path d="M35 227h211M35 166h211M35 105h211" stroke="#fff" stroke-width="1" opacity=".4"/><g ${self ? 'transform="translate(5 0) rotate(2 140 260)"' : ''}><path d="${legs}" fill="none" stroke="#40584e" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/><path d="M94 265h23m48 0h25" stroke="#f9f6ec" stroke-width="12" stroke-linecap="round"/><path d="${torso}" fill="${color}"/><path d="${arms}" stroke="#d7ad91" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M${headX} ${headY + 19}v13" stroke="#d7ad91" stroke-width="14"/><ellipse cx="${headX}" cy="${headY}" rx="21" ry="25" fill="#d7ad91"/><path d="M${headX - 21} ${headY}q-8-33 27-29 25 4 14 31l-6-19-30 20Z" fill="#33473a"/></g>${skeleton}</svg>`;
}

export function groupArt() {
  return `<svg class="group-art" viewBox="0 0 360 190" role="img" aria-label="公園で一緒に動く仲間のサンプルイラスト"><rect width="360" height="190" rx="20" fill="#dfe7d6"/><circle cx="281" cy="44" r="23" fill="#f0d69e"/><path d="M0 161q155-45 360-2v31H0" fill="#bdccad"/><path d="M44 156V55m0 48Q3 85 25 55q24 4 19 48m1-18q40-20 24-43-24 3-24 43" fill="#89a077" stroke="#89a077" stroke-width="4"/><g transform="translate(58 19) scale(.53)">${movement().replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g><g transform="translate(163 31) scale(.48)">${movement({ pose: 'reach', phase: 1, color: '#b99b52' }).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g></svg>`;
}
