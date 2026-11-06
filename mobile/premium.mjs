// These fictional scenarios demonstrate the experience, not a health scoring algorithm.
export const RECOVERY_SAMPLES = Object.freeze({
  recovered: { name: 'よく眠れた日', sleep: '7時間40分', quality: '中途覚醒が少ない例', activity: '昨日は軽い運動20分', status: 'いつもの練習を提案', reason: '昨夜はまとまった睡眠が取れ、昨日の運動量も少なめというサンプルです。', plan: 'usual' },
  limited: { name: '少し休みたい日', sleep: '6時間10分', quality: '途中で何度か目覚めた例', activity: '昨日は運動45分', status: '今日は軽めを提案', reason: '睡眠が短めで、昨日の運動量も多いというサンプルのため、今日は軽めを提案します。', plan: 'light' },
  low: { name: '回復を優先する日', sleep: '4時間50分', quality: '眠りが途切れた例', activity: '昨日も練習した例', status: '休養を選べる日', reason: '睡眠が十分でないというサンプルです。練習を増やさず、休む選択を提案します。', plan: 'rest' },
  missing: { name: '睡眠データなし', sleep: '取得できていません', quality: '評価できません', activity: '昨日の運動記録なし', status: '回復状況は不明', reason: 'データが不足しているため回復状況は推定していません。今日の体調を答えて、自分で内容を選べます。', plan: 'light' },
});
export const DAILY_PLANS = Object.freeze({
  usual: { name: 'いつもの基本練習', minutes: '20分', intensity: 'いつもの強度', rest: 'セット間に休憩', steps: ['ゆっくりウォームアップ / 5分', '好きなコーチの基本練習 / 10分', 'クールダウン / 5分'] },
  light: { name: 'ていねいに、軽めの日', minutes: '10分', intensity: '軽め', rest: 'こまめに休憩', steps: ['ゆっくりウォームアップ / 3分', 'フォームを確かめる練習 / 4分', 'クールダウン / 3分'] },
  rest: { name: '今日は、休むことも一歩', minutes: '練習なし', intensity: '休養', rest: '回復を優先', steps: ['運動の予定を入れずに休む', '明日の体調を見て、もう一度選ぶ'] },
});
export const LIVE_SAMPLES = Object.freeze({
  steady: { name: '一定のペースの例', heart: '118', pace: '6:40', respiration: '20', cue: '自分のペースで。息を止めずに動きましょう。', label: '呼吸のリマインダー', priority: 'gentle' },
  elevated: { name: '目標範囲を上回る例', heart: '152', pace: '5:50', respiration: '28', cue: '目標範囲を上回った想定です。ペースを落とし、体調を確認しましょう。', label: 'ペースを見直す', priority: 'attention' },
  stride: { name: '歩幅を振り返る例', heart: '126', pace: '6:10', respiration: null, cue: 'いつもとの歩幅の違いを確認する例です。次回、動画で着地の位置を見比べましょう。', label: 'フォームの確認候補', priority: 'gentle' },
  respiration: { name: '推定呼吸数の変化の例', heart: '130', pace: '6:20', respiration: '32', cue: '推定呼吸数が変化した想定です。呼吸のペースも確認しましょう。', label: '呼吸のペースを確認', priority: 'gentle' },
  missing: { name: 'データが届かない例', heart: null, pace: null, respiration: null, cue: '新しいデータが届いていません。計測値による助言を一時停止しています。', label: '計測できていません', priority: 'unknown' },
});
export function createPremium() {
  return { sample: 'limited', fatigue: 'some', connected: false, sleepAvailable: false, selectedPlan: null, acceptedPlan: null, active: false, live: 'steady', tick: 0, lastAlert: null, alerts: [], recap: null, privacy: 'private' };
}
function valid(value, options, name) {
  if (!options.includes(value)) throw new RangeError(`${name}の選択が不正です。`);
  return value;
}
export function recoveryProposal(premium) {
  const sample = RECOVERY_SAMPLES[premium.sample];
  const unavailable = !premium.connected || !premium.sleepAvailable || premium.sample === 'missing';
  const plan = premium.fatigue === 'tired' || (!unavailable && sample.plan === 'rest') ? 'rest' : unavailable || premium.fatigue === 'some' ? 'light' : sample.plan;
  return {
    status: unavailable ? '回復状況は不明' : { usual: 'いつもの練習を提案', light: '今日は軽めを提案', rest: '休養を選べる日' }[plan],
    reason: (unavailable ? '時計が未接続、または睡眠データが不足しているため、回復状況は推定していません。本人の体調の回答から内容を選ぶ例です。' : sample.reason) + (premium.fatigue === 'tired' ? ' 本人の「休みたい」という回答を優先し、休養を提案します。' : premium.fatigue === 'some' ? ' 本人の「少し疲れている」という回答も参考に、負荷を抑える案です。' : ' 本人の「疲れは少ない」という回答も参考にしています。') + ' 睡眠だけで回復を断定しません。',
    fatigue: { fresh: '疲れは少ない', some: '少し疲れている', tired: '休みたい' }[premium.fatigue],
    plan, unknown: unavailable,
  };
}
export function currentDailyPlan(premium) { return premium.active && premium.acceptedPlan ? premium.acceptedPlan : premium.selectedPlan ?? recoveryProposal(premium).plan; }
export function liveReading(premium) {
  if (!premium.connected || premium.live === 'missing') return { ...LIVE_SAMPLES.missing, disconnected: !premium.connected };
  return LIVE_SAMPLES[premium.live];
}
export function reducePremium(premium, action) {
  const next = structuredClone(premium);
  if (next.active && ['recoverySample', 'fatigue', 'dailyPlan', 'acceptDailyPlan', 'startLive'].includes(action.type)) throw new Error('練習を終了してから、今日のプランを見直してください。');
  const invalidatePlan = () => { next.selectedPlan = null; next.acceptedPlan = null; };
  switch (action.type) {
    case 'recoverySample': next.sample = valid(action.value, Object.keys(RECOVERY_SAMPLES), '回復サンプル'); invalidatePlan(); break;
    case 'fatigue': next.fatigue = valid(action.value, ['fresh', 'some', 'tired'], '疲労感'); invalidatePlan(); break;
    case 'watch':
      next.connected = valid(action.value, ['connected', 'disconnected'], '時計接続') === 'connected';
      next.sleepAvailable = false;
      if (!next.active) invalidatePlan();
      next.live = 'missing';
      break;
    case 'dailyPlan': next.selectedPlan = valid(action.value, Object.keys(DAILY_PLANS), '今日のプラン'); next.acceptedPlan = null; break;
    case 'acceptDailyPlan': next.acceptedPlan = currentDailyPlan(next); break;
    case 'startLive':
      if (!next.acceptedPlan) throw new Error('今日のプランを確認してください。');
      if (next.acceptedPlan === 'rest') throw new Error('休養プランでは練習を開始しません。');
      next.active = true; next.recap = null; next.tick = 0; next.alerts = []; next.lastAlert = null; next.live = next.connected ? 'steady' : 'missing'; break;
    case 'liveSample': {
      if (!next.active) throw new Error('先に練習サンプルを開始してください。');
      next.live = valid(action.value, Object.keys(LIVE_SAMPLES), '練習サンプル');
      next.tick += 1;
      const reading = liveReading(next);
      // Same cue is suppressed for two sample steps; missing data takes priority over coaching.
      const key = reading.priority === 'unknown' ? 'missing' : next.live;
      if (!next.lastAlert || next.lastAlert.key !== key || next.tick - next.lastAlert.tick >= 3) {
        next.alerts.push({ key, label: reading.label, cue: reading.cue, step: next.tick, priority: reading.priority });
        next.lastAlert = { key, tick: next.tick };
      }
      break;
    }
    case 'finishLive':
      if (!next.active) throw new Error('終了する練習がありません。');
      next.active = false;
      next.recap = { plan: next.acceptedPlan, sampleSteps: next.tick, alerts: structuredClone(next.alerts), sleepSample: next.sample, fatigue: next.fatigue, private: true };
      break;
    default: throw new RangeError('不明なプレミアム操作です。');
  }
  return next;
}
