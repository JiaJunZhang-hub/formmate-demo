// A prerecorded fictional timeline, not live measurements or a medical rule engine.
export const BODY_SCENARIOS = Object.freeze({
  normal: { label: '一定のペース', heart: [108, 118, 112], respiration: [18, 22, 20] },
  elevated: { label: '負荷を見直す場面', heart: [126, 152, 144], respiration: [24, 30, 28] },
  missing: { label: 'データが届かない', heart: [null, null, null], respiration: [null, null, null] },
  respUnavailable: { label: '呼吸数に非対応', heart: [108, 118, 112], respiration: [null, null, null] },
});
const PHASE_TIME = ['00:00', '00:04', '00:08'];
const PHASE_NAMES = ['はじめの姿勢', '動きの途中', '戻る場面'];
const FORM_NOTES = Object.freeze({
  form: ['始める前の体の位置を、お手本と同じ場面で確認。', '動きの途中で、体の位置をお手本と見比べる例です。', '戻った位置を、最初の姿勢と見比べる例です。'],
  control: ['左右の位置をそろえて、動き出す準備を確認。', '途中でどこが動くか、揺れとつながりを見る例です。', '戻りきるまでの動きのつながりを確認する例です。'],
  rhythm: ['動き始めるタイミングを、お手本と確認。', '途中の速さを、お手本と同じ場面で比べる例です。', '動作を切り替えるタイミングを確認する例です。'],
});
export function createComparisonBody() { return { scenario: 'normal', fresh: false, captureId: null, history: false }; }

export function comparisonBodyReading(state) {
  const sample = state.comparisonBody;
  const scenario = BODY_SCENARIOS[sample.scenario];
  const phase = state.phase;
  const history = sample.history;
  const fresh = sample.fresh && sample.captureId === state.result?.captureId;
  const available = Boolean(state.result) && state.premium.connected && fresh && !history && sample.scenario !== 'missing';
  const heart = available ? scenario.heart[phase] : null;
  const respiration = available ? scenario.respiration[phase] : null;
  const form = FORM_NOTES[state.focus][phase];
  const status = history ? 'この履歴には身体データを記録していません' : !state.premium.connected ? '時計は未接続です' : !fresh ? 'サンプルの読み込み待ち' : sample.scenario === 'missing' ? 'データが届いていません' : '同じ場面のデータ例';
  const body = heart === null ? '身体データがないため、数値を使った助言は控えます。フォームの比較は続けられます。' : sample.scenario === 'elevated' ? '負荷を見直す想定の場面です。動きの確認と合わせ、ペースを落として体調を確認しましょう。' : respiration === null ? '心拍の変化を確認する例です。呼吸数は取得できないため、呼吸に関する数値の判断はしていません。' : `心拍${heart} bpm・推定呼吸数${respiration} 回/分のサンプルです。今の体感と合わせて、自分のペースを確認しましょう。`;
  const next = heart === null ? 'まずは動きを一つ確認。身体データは使わず、無理のない範囲で。' : sample.scenario === 'elevated' ? `「${PHASE_NAMES[phase]}」のフォーム確認は一旦止めても大丈夫。休憩を選び、体調が整ってから見直しましょう。` : state.focus === 'rhythm' ? '画面のタイミングだけに合わせず、呼吸を意識しながら自分の速さで次の一回へ。' : state.focus === 'control' ? '一度止まって動きのつながりを確かめ、体感に合わせて次の一回へ。' : '同じ場面の体の位置を一つだけ確かめ、今の体感に合わせて次の一回へ。';
  return { heart, respiration, form, body, next, status, history, available, time: PHASE_TIME[phase], phaseName: PHASE_NAMES[phase], attention: available && sample.scenario === 'elevated' };
}
