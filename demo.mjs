/** All profiles and evaluations are fictional, presentation-only samples. */
export const TRAINERS = Object.freeze([
  Object.freeze({ id: 'mina', name: 'MINA', role: 'ていねいに、フォームから。', tag: 'フォーム重視', color: '#bb6c54', level: 'はじめてのスクワット', cue: 'お手本と並べると、動きの違いが見えてくる。', advice: '次の一回で意識することを、一つずつ。', description: '基本の動きをじっくり確かめたいあなたへ。', initial: 'M' }),
  Object.freeze({ id: 'ryo', name: 'RYO', role: '自分のペースで、少しずつ。', tag: '自重トレーニング', color: '#5f8073', level: '自重トレーニング入門', cue: '自分のペースと、お手本のリズムを比べよう。', advice: '前回の自分と比べながら、小さな変化を見つけよう。', description: '道具をそろえる前に、からだを動かしてみたいあなたへ。', initial: 'R' }),
  Object.freeze({ id: 'haru', name: 'HARU', role: '続けられる、わたしの習慣。', tag: 'ゆっくり習慣づくり', color: '#9c7b44', level: 'ゆっくり動作チャレンジ', cue: '動き出しから戻るまでを、ゆっくり見比べよう。', advice: '今日できたことを記録して、次の一歩につなげよう。', description: 'がんばりすぎず、運動を暮らしに取り入れたいあなたへ。', initial: 'H' }),
]);

export const PHASES = Object.freeze(['はじめの姿勢', 'しゃがむ動き', '戻る動き']);

export const PRACTICE_TYPES = Object.freeze([
  Object.freeze({ id: 'form', name: 'フォームを整える', point: '姿勢・動きの位置', description: 'お手本と並べて、姿勢や動きの位置に注目。', cues: Object.freeze(['始める前の姿勢を、お手本と並べて確認。', 'しゃがむ場面で、体の位置の違いを確認。', '戻ったときの姿勢を、最初の場面と見比べよう。']), advice: '同じ場面で止めて、一つの違いから見てみよう。' }),
  Object.freeze({ id: 'control', name: '動きを安定させる', point: '左右の揺れ・動きのつながり', description: '動きの途中の揺れや、つながりに注目。', cues: Object.freeze(['動き始める前の、左右の位置を見比べよう。', '途中で体の位置がどう変わるか、見てみよう。', '戻る場面まで、動きのつながりを見比べよう。']), advice: '始め・途中・終わりの3場面を行き来して確認しよう。' }),
  Object.freeze({ id: 'rhythm', name: 'リズムを整える', point: '動く速さ・切り替えのタイミング', description: 'お手本のペースと、動くタイミングに注目。', cues: Object.freeze(['お手本が動き始めるタイミングを確認。', '下がる場面のペースを、再生で見比べよう。', '下がる動きから戻る動きへの切り替えに注目。']), advice: '再生と一時停止を使い、自分に合うペースを考えよう。' }),
]);

export function getComparison(trainerId = 'mina', phase = 0, practiceId = 'form') {
  const trainer = TRAINERS.find((entry) => entry.id === trainerId);
  if (!trainer) throw new RangeError(`Unknown sample trainer: ${trainerId}`);
  const practice = PRACTICE_TYPES.find((entry) => entry.id === practiceId);
  if (!practice) throw new RangeError(`Unknown sample practice type: ${practiceId}`);
  if (!Number.isInteger(phase) || phase < 0 || phase >= PHASES.length) {
    throw new RangeError('Sample phase must be an integer from 0 to 2.');
  }
  return {
    trainer, practice, phase, phaseLabel: PHASES[phase], progress: (phase + 1) / PHASES.length, isSample: true,
    feedback: {
      context: `${practice.name} / ${trainer.name}のお手本 / ${PHASES[phase]}`,
      cue: practice.cues[phase],
      advice: `${trainer.role} ${practice.advice}`,
      point: practice.point,
    },
  };
}

export function nextPhase(phase) {
  getComparison('mina', phase);
  return (phase + 1) % PHASES.length;
}
