export function escapeHtml(value) { return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])); }

export function portrait(coach, size = '') {
  const hair = coach.id === 'mina' ? '<path d="M29 46c-8-36 48-42 44-10l-7 27-6-34-24 18-5 22Z" fill="#354338"/>' : coach.id === 'ryo' ? '<path d="M30 39q-1-26 23-25 28 0 19 27L59 29 32 45Z" fill="#354338"/>' : '<path d="M28 45q-5-31 23-31 28 1 22 34L63 31l-12 8-18 7Z" fill="#6a503d"/>';
  return `<svg class="portrait ${size}" viewBox="0 0 100 100" role="img" aria-label="${escapeHtml(coach.name)}のサンプルイラスト"><rect width="100" height="100" rx="28" fill="${coach.color}" opacity=".13"/><path d="M16 104q0-43 35-39 34-3 34 39" fill="${coach.color}"/><path d="M44 59v13h14V59" fill="#d9ac91"/><ellipse cx="51" cy="43" rx="20" ry="25" fill="#dfb699"/>${hair}<path d="M43 46v2m16-2v2" stroke="#34483c" stroke-width="2" stroke-linecap="round"/><path d="M46 57q6 4 11-1" stroke="#936e59" stroke-width="2" fill="none"/></svg>`;
}

export function movement({ pose = 'squat', phase = 0, color = '#b96e58', label = '動作のサンプル', self = false, guide = false } = {}) {
  if (!['squat', 'hinge', 'reach'].includes(pose) || ![0, 1, 2].includes(phase)) throw new RangeError('不明な動作・場面です。');
  if (typeof color !== 'string' || !/^#[\da-f]{6}$/i.test(color)) throw new TypeError('人物の色は6桁のHEX値で指定してください。');
  const model = movementJoints(pose, phase, self);
  const { shoulder, hip, farArm, nearArm, farLeg, nearLeg } = model;
  const dx = shoulder[0] - hip[0], dy = shoulder[1] - hip[1];
  const length = Math.hypot(dx, dy), up = [dx / length, dy / length];
  const angle = Math.atan2(dx, -dy) * 180 / Math.PI;
  const head = [shoulder[0] + up[0] * 34, shoulder[1] + up[1] * 34];
  const neck = [shoulder[0] + up[0] * 15, shoulder[1] + up[1] * 15];
  const skin = self ? '#c99a78' : '#d9ad8c';
  const skinShade = self ? '#b78666' : '#c39273';
  const pants = self ? '#61745e' : '#43594f';
  const limb = (points, widths, fill) => points.slice(1).map((end, i) => taperedLimb(points[i], end, widths[i], widths[i + 1], fill)).join('');
  const leg = (points, far = false) => `${limb(points, [12, 9, 5], far ? '#344a42' : pants)}${taperedLimb([points[1][0] + 2, points[1][1] + 8], [points[2][0] + 1, points[2][1] - 8], 3.5, 2, far ? '#3a5047' : '#53695c')}${shoe(points[2], far)}`;
  const arm = (points, far = false) => `${limb(points, [7, 5.2, 3.5], far ? skinShade : skin)}<ellipse cx="${points[2][0]}" cy="${points[2][1] + 3}" rx="4" ry="6" fill="${far ? skinShade : skin}"/>`;
  const torso = `<g transform="translate(${shoulder.join(' ')}) rotate(${angle})"><path d="M-14 1Q-10-5-5-4L5-4Q11-4 15 3L21 17 13 23 11 ${length - 7}Q1 ${length + 4}-13 ${length - 3}L-14 24-21 19Z" fill="${color}"/><path d="M-14 24-10 ${length - 10}Q-2 ${length - 6} 10 ${length - 9}L11 ${length - 3}Q-1 ${length + 3}-13 ${length - 3}Z" fill="#304738" opacity=".15"/><path d="M5 25Q0 40 4 ${length - 17}M-9 ${length - 15}l13 3" stroke="#fff7e9" stroke-width="1.3" fill="none" opacity=".25"/><path d="M-6-3Q0 4 6-3" stroke="#6e4d3d" stroke-width="2" fill="none" opacity=".45"/></g>`;
  const headArt = `<g transform="translate(${head.join(' ')}) rotate(${angle})"><path d="M-10-10Q-8-17 2-16 12-15 12-5L15 1Q16 3 12 4L11 11Q7 18-2 15L-9 9Z" fill="${skin}"/><path d="M-10-8Q-18-17-5-20 9-24 14-13L11-6Q7-7 5-13L-2-10-6-1-10 0Z" fill="#34453a"/><path d="M-10-11Q-14-18-7-22-2-26 2-22L1-17Z" fill="#34453a"/><ellipse cx="-7" cy="2" rx="3" ry="4" fill="${skinShade}"/><path d="M8-1l2 .5" stroke="#475146" stroke-width="1.4" stroke-linecap="round"/><path d="M9 9l-4 .5" stroke="#a1735b" stroke-width="1.2" stroke-linecap="round"/><path d="M-1 14l7-1" stroke="${skinShade}" stroke-width="2" opacity=".6"/></g>`;
  const chain = (points) => points.map((point, index) => `${index ? 'L' : 'M'}${point.join(' ')}`).join('');
  const skeleton = guide ? `<g class="pose-guide" fill="none" stroke="#698a73" stroke-width="1.3" opacity=".65"><path d="${chain([head, shoulder, hip])}${chain(nearArm)}${chain(farArm)}${chain(nearLeg)}${chain(farLeg)}" stroke-dasharray="3 4"/>${[shoulder, hip, nearArm[1], nearLeg[1], nearLeg[2]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4" fill="#f6f6e9"/>`).join('')}</g>` : '';
  return `<svg class="movement" viewBox="0 0 280 300" role="img" aria-label="${escapeHtml(label)}"><ellipse cx="142" cy="278" rx="72" ry="7" fill="#526849" opacity=".12"/><path d="M48 279h184" stroke="#bcc9af" stroke-width="1"/>${arm(farArm, true)}${leg(farLeg, true)}${leg(nearLeg)}${taperedLimb(shoulder, neck, 6, 5, skin)}${torso}${arm(nearArm)}${headArt}${skeleton}</svg>`;
}

// Every pose shares grounded ankles and limb chains; the guide uses these exact joints.
export function movementJoints(pose, phase, self = false) {
  const base = { shoulder: [143, 98], hip: [139, 165], farArm: [[135, 101], [118, 135], [112, 170]], nearArm: [[151, 103], [160, 139], [159, 175]], farLeg: [[132, 165], [126, 215], [122, 265]], nearLeg: [[146, 166], [151, 216], [156, 265]] };
  if (pose === 'squat' && phase === 1) Object.assign(base, { shoulder: [145, 120], hip: [110, 182], farArm: [[137, 121], [172, 130], [205, 128]], nearArm: [[151, 126], [186, 139], [221, 140]], farLeg: [[103, 182], [142, 210], [122, 265]], nearLeg: [[117, 184], [169, 211], [156, 265]] });
  if (pose === 'squat' && phase === 2) Object.assign(base, { shoulder: [146, 102], hip: [134, 167], farArm: [[138, 104], [163, 130], [192, 140]], nearArm: [[154, 107], [178, 139], [207, 148]], farLeg: [[127, 167], [125, 216], [122, 265]], nearLeg: [[141, 168], [155, 217], [156, 265]] });
  if (pose === 'hinge' && phase === 1) Object.assign(base, { shoulder: [169, 123], hip: [111, 168], farArm: [[160, 120], [158, 159], [150, 194]], nearArm: [[175, 129], [180, 169], [174, 205]], farLeg: [[104, 168], [127, 215], [122, 265]], nearLeg: [[118, 169], [144, 214], [156, 265]] });
  if (pose === 'hinge' && phase === 2) Object.assign(base, { shoulder: [154, 103], hip: [130, 166], farArm: [[145, 104], [137, 143], [135, 178]], nearArm: [[160, 109], [161, 148], [158, 184]], farLeg: [[123, 166], [126, 215], [122, 265]], nearLeg: [[137, 167], [151, 216], [156, 265]] });
  if (pose === 'reach' && phase === 1) Object.assign(base, { farArm: [[134, 99], [115, 64], [116, 26]], nearArm: [[152, 101], [174, 67], [177, 29]] });
  if (pose === 'reach' && phase === 2) Object.assign(base, { farArm: [[134, 100], [102, 95], [75, 76]], nearArm: [[152, 103], [186, 99], [214, 83]] });
  if (self) { base.nearArm[1][0] -= 3; base.nearArm[2][0] -= 4; }
  return base;
}

function taperedLimb(start, end, startRadius, endRadius, fill = '#53695c') {
  const distance = Math.hypot(end[0] - start[0], end[1] - start[1]);
  const n = [-(end[1] - start[1]) / distance, (end[0] - start[0]) / distance];
  const p = (point, radius, sign) => [point[0] + n[0] * radius * sign, point[1] + n[1] * radius * sign].join(' ');
  return `<path d="M${p(start, startRadius, 1)}L${p(end, endRadius, 1)}A${endRadius} ${endRadius} 0 0 0 ${p(end, endRadius, -1)}L${p(start, startRadius, -1)}A${startRadius} ${startRadius} 0 0 0 ${p(start, startRadius, 1)}Z" fill="${fill}"/>`;
}
function shoe([x, y], far) {
  return `<g transform="translate(${x} ${y})"><path d="M-5-5 5-5 8 0 18 3Q22 5 20 10H-8L-9 5Z" fill="${far ? '#d9decd' : '#f7f5eb'}"/><path d="M-8 9H20" stroke="${far ? '#82937d' : '#a1ac95'}" stroke-width="2.5" stroke-linecap="round"/><path d="M4 0l5 1M3 3l7 1" stroke="#a0ad96" stroke-width="1.2"/><path d="M-6-4 3-4" stroke="#d5a888" stroke-width="3"/></g>`;
}

export function groupArt() {
  return `<svg class="group-art" viewBox="0 0 360 190" role="img" aria-label="公園で一緒に動く仲間のサンプルイラスト"><rect width="360" height="190" rx="20" fill="#dfe7d6"/><circle cx="281" cy="44" r="23" fill="#f0d69e"/><path d="M0 161q155-45 360-2v31H0" fill="#bdccad"/><path d="M44 156V55m0 48Q3 85 25 55q24 4 19 48m1-18q40-20 24-43-24 3-24 43" fill="#89a077" stroke="#89a077" stroke-width="4"/><g transform="translate(58 19) scale(.53)">${movement().replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g><g transform="translate(163 31) scale(.48)">${movement({ pose: 'reach', phase: 1, color: '#b99b52' }).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g></svg>`;
}
