import { RECOVERY_SAMPLES, DAILY_PLANS, LIVE_SAMPLES, recoveryProposal, currentDailyPlan, liveReading } from './premium.mjs?v=20261106-devices-office';
import { escapeHtml as e } from './illustrations.mjs?v=20261106-devices-office';

const btn = (text, action, value = '', cls = 'primary', extra = '') => `<button class="${cls}" data-action="${action}" data-value="${e(value)}" ${extra}>${text}</button>`;
const go = (text, id, cls = 'primary') => btn(text, 'navigate', id, cls);
const chips = (items, selected, action) => `<div class="choice-row">${items.map(([id, label]) => btn(label, action, id, `chip ${id === selected ? 'selected' : ''}`, `aria-pressed="${id === selected}"`)).join('')}</div>`;
const title = (eyebrow, text, sub) => `<div class="page-heading"><span class="eyebrow">${eyebrow}</span><h1>${text}</h1><p>${sub}</p></div>`;
const back = (id, text) => `<div class="back-row">${btn('←', 'navigate', id, 'icon-button', 'aria-label="前の画面へ"')}<span>${text}</span><span class="tag premium-tag">PREMIUM</span></div>`;
const privacy = '<p class="premium-privacy">◈ 身体データは自分だけ。チーム・SNSには共有しません。</p>';
const disclaimer = '<p class="fine-print">すべて架空のサンプルです。実際の時計との接続・計測・回復判定・音声通知は行いません。対応機種と料金は未確定です。</p>';

export function premiumEntry(state) {
  const p = state.premium; const proposal = recoveryProposal(p);
  const plan = DAILY_PLANS[currentDailyPlan(p)]; const sample = RECOVERY_SAMPLES[p.sample];
  const sleepReady = p.connected && p.sleepAvailable;
  return `<section class="premium-entry"><div class="between"><span class="eyebrow">PREMIUM / からだ連動コーチ</span><span aria-hidden="true">✧</span></div><h2>今日のからだに、<br>今日の練習を。</h2><div class="premium-entry-status"><span class="status-dot"></span>${p.connected ? proposal.status : '時計は未接続 / 回復状況は不明'}</div><div class="home-recovery-summary"><span>昨夜の睡眠<strong>${sleepReady ? sample.sleep : '未取得'}</strong></span><span>${p.acceptedPlan ? '選んだプラン' : '今日のプラン案'}<strong>${plan.minutes} · ${plan.intensity}</strong></span></div><p>${plan.name}</p><details class="premium-reason"><summary>このプランを提案する理由</summary><p>${e(proposal.reason)}</p></details>${go('睡眠と回復を確認する ↗', 'P01', 'primary small')}${go('今日のプランを見る →', 'P02', 'text-button')}${p.active ? go('練習中の画面に戻る', 'P03', 'text-button') : p.recap ? go('前回の振り返りを見る', 'P04', 'text-button') : ''}<small>計測値・提案はサンプルです。身体データは自分だけ。</small></section>`;
}
function P01(state) {
  const p = state.premium; const sample = RECOVERY_SAMPLES[p.sample]; const proposal = recoveryProposal(p);
  const sleepReady = p.connected && p.sleepAvailable;
  return `${back('M01', '睡眠と回復')}${title('REST IS PART OF PROGRESS', '昨夜の休息が、<br>今日の一歩になる。', '睡眠・運動履歴・あなたの実感を、一緒に。')}
  ${p.active ? `<div class="notice">練習中です。プランの見直しは練習後にできます。</div>${go('練習に戻る →', 'P03')}` : `<div class="watch-connect"><span class="watch-icon" aria-hidden="true">◷</span><div><strong>${p.connected ? '時計接続中のサンプル' : '時計は未接続の想定'}</strong><small>実機へのアクセスはありません</small></div>${btn(p.connected ? '切断' : '接続を試す', 'watch', p.connected ? 'disconnected' : 'connected', 'secondary small')}</div>`}
  ${p.connected ? btn('時計データのサンプルを同期する', 'deviceWatchRead', 'synced', 'secondary') : ''}
  <div class="recovery-card"><span class="eyebrow">TODAY’S RECOVERY / 推定の例</span><h2>${proposal.status}</h2><div class="sleep-moon" aria-hidden="true">☾<span>✧</span></div><div class="sleep-metrics"><div><span>昨夜の睡眠</span><strong>${sleepReady ? sample.sleep : '取得できていません'}</strong></div><div><span>睡眠の質</span><strong>${sleepReady ? sample.quality : '評価できません'}</strong></div></div><p>${e(proposal.reason)}</p><p class="fine-print">データ元：時計のサンプル / 同期：${sleepReady ? state.devices.watchTime : '未確認'}</p></div>
  <div class="source-row"><span class="source-label">直近の運動</span><p>${sleepReady ? sample.activity : '新しいデータを確認できていません'}</p></div>
  ${p.active ? '' : `<section class="question"><h2>今の疲れは、どうですか？</h2>${chips([['fresh', '疲れは少ない'], ['some', '少し疲れている'], ['tired', '休みたい']], p.fatigue, 'fatigue')}<p class="fine-print">あなたの実感も、今日のプランに反映します。</p></section>`}
  <div class="source-row"><span class="source-label">本人の回答</span><p>${proposal.fatigue}</p></div>${go('今日のおすすめを確認する →', 'P02')}
  ${p.active ? '' : `<details class="disclosure"><summary>回復状況のサンプルを切り替える <span>＋</span></summary>${chips(Object.entries(RECOVERY_SAMPLES).map(([id, value]) => [id, value.name]), p.sample, 'recoverySample')}<p>数値は架空です。実際の回復スコアや判定基準を示すものではありません。</p></details>`}${privacy}${disclaimer}`;
}
function P02(state) {
  const p = state.premium; const proposal = recoveryProposal(p); const chosen = currentDailyPlan(p); const plan = DAILY_PLANS[chosen];
  return `${back('P01', '今日のプラン')}${title('YOUR BODY, YOUR CHOICE', 'がんばる日も、<br>休む日も。', '提案を確かめて、自分で選び直せます。')}<div class="daily-plan-card"><span class="eyebrow">${p.selectedPlan ? 'あなたが選んだプラン' : '今日のおすすめ / サンプル'}</span><h2>${plan.name}</h2><div class="plan-pills"><span>${plan.minutes}</span><span>${plan.intensity}</span><span>${plan.rest}</span></div><ol class="plan-steps">${plan.steps.map((step) => `<li>${step}</li>`).join('')}</ol></div><div class="source-row"><span class="source-label">提案の理由</span><p>${e(proposal.reason)}<br>本人の回答：${proposal.fatigue}。${proposal.unknown ? 'データ不足を、回復良好とは扱いません。' : ''}</p></div>
  ${p.active ? `${go('練習中の画面に戻る →', 'P03')}<p class="fine-print">プランの変更は練習終了後にできます。</p>` : `<section class="question"><h2>今日の体調に合わせて変更</h2>${chips(Object.entries(DAILY_PLANS).map(([id, value]) => [id, value.name]), chosen, 'dailyPlan')}<p class="fine-print">変更すると確定前に戻ります。いつでも休養を選べます。</p></section>${p.acceptedPlan ? `<div class="success-note">✓ このプランを選びました。${chosen === 'rest' ? '今日は練習を始めず、休む選択です。' : '次に時計連動の練習例を体験できます。'}</div>${chosen === 'rest' ? go('ホームに戻る →', 'M01') : btn('このプランで練習の例を見る →', 'startLive')}` : btn('このプランにする', 'acceptDailyPlan')}`}
  ${p.recap ? go('前回の振り返りを見る', 'P04', 'text-button') : ''}${privacy}${disclaimer}`;
}
function P03(state) {
  const p = state.premium;
  if (!p.active) return `${back('P02', 'からだ連動の練習')}${title('READY WHEN YOU ARE', '今日のプランから、<br>はじめよう。', '練習中のアドバイスをサンプルで体験できます。')}${go('今日のプランへ →', 'P02')}${disclaimer}`;
  const reading = liveReading(p); const plan = DAILY_PLANS[p.acceptedPlan];
  return `${back('P02', 'からだ連動の練習')}${title('LISTEN TO YOUR BODY', '今のペースを、<br>からだと相談。', `${plan.name} / 練習中のサンプル`)}<div class="between"><span class="live-label"><i></i> ${p.connected ? '接続中の表示例' : '接続が切れた表示例'}</span>${btn(p.connected ? '切断を試す' : '再接続を試す', 'watch', p.connected ? 'disconnected' : 'connected', 'inline-link')}</div><div class="live-heart ${reading.priority}"><span>心拍数 / 架空の値</span><strong>${reading.heart ?? '—'}<small>${reading.heart ? 'bpm' : '計測できません'}</small></strong><svg viewBox="0 0 280 48" aria-hidden="true"><path d="M0 30H45l8-8 9 17 9-31 10 35 10-13h47l8-8 9 17 9-31 10 35 10-13h96"/></svg><span>${reading.heart ? '数値から自動判定している表示ではありません' : '古い値を現在値として表示しません'}</span></div><div class="live-coaching ${reading.priority}" role="status"><span class="eyebrow">${reading.priority === 'unknown' ? 'DATA STATUS' : 'COACHING SAMPLE'}</span><h2>${reading.label}</h2><p>${reading.cue}</p></div><div class="small-stats"><span>ランニング時のペース例<strong>${reading.pace ? `${reading.pace} /km` : '取得できません'}</strong></span><span>表示を進めた回数<strong>${p.tick}<small>ステップ</small></strong></span></div>
  <div class="respiration-card"><span>呼吸数 / 推定値のサンプル</span><strong>${reading.respiration ?? '—'}<small>${reading.respiration ? '回/分' : '取得できません'}</small></strong><p>${reading.respiration ? '対応機器が運動中の推定呼吸数を提供できる場合の表示例です。' : '非対応・欠測・接続切断のときは推定値を表示しません。'} 機種・運動種別・アプリへのデータ提供条件によって異なります。</p></div>
  <section class="question"><h2>練習中の変化を試す</h2>${chips(Object.entries(LIVE_SAMPLES).map(([id, value]) => [id, value.name]), p.live, 'liveSample')}<p class="fine-print">ボタンで架空の場面を進めます。同じ助言は連続表示を抑え、データ不足を優先します。自動計測・音声再生はありません。</p></section>
  <div class="card compact"><h2>フォームも、一緒に確かめる。</h2><p>新しい比較サンプルを開き、同じ場面の動き・心拍・推定呼吸数を見られます。進行中の練習は保ちます。</p>${btn('フォームと身体データの例を見る →', 'watchCompare', '', 'secondary')}</div>
  <details class="disclosure"><summary>呼吸・歩幅・左右バランスについて <span>＋</span></summary><p>呼吸の声かけはリマインダーです。息が止まったことを検出した表示ではありません。歩幅だけでフォームを判定せず、左右の接地時間などは対応機種・外部センサーや動画での確認が必要です。実機での取得方法は未確定です。</p></details>${btn('練習の例を終了して振り返る →', 'finishLive')}${privacy}${disclaimer}`;
}
function P04(state) {
  const p = state.premium; const recap = p.recap;
  if (!recap) return `${back('M15', 'からだの振り返り')}${title('ONE SESSION, ONE LITTLE STEP', '今日の気づきを、<br>次の一回へ。', 'まだ時計連動の練習記録はありません。')}${go('今日のプランを確認 →', 'P01')}${disclaimer}`;
  const plan = DAILY_PLANS[recap.plan];
  return `${back('M15', 'からだの振り返り')}${title('A LITTLE MORE ABOUT YOU', '動いた自分にも、<br>休む自分にも。', '身体の反応と動きを、振り返るサンプル。')}<div class="daily-plan-card"><span class="eyebrow">SESSION SUMMARY / 自分だけ</span><h2>${plan.name}</h2><p>計画：${plan.minutes} / ${plan.intensity}<br>経過時間・消費カロリーは実測していません。</p><p>${RECOVERY_SAMPLES[recap.sleepSample].name} / 本人の回答：${{ fresh: '疲れは少ない', some: '少し疲れている', tired: '休みたい' }[recap.fatigue]}</p></div><div class="section-label"><h2>練習中に確認したこと</h2><span class="tag">${recap.sampleSteps}ステップ</span></div>${recap.alerts.length ? recap.alerts.map((alert) => `<div class="recap-event"><span>${alert.step}</span><div><strong>${e(alert.label)}</strong><p>${e(alert.cue)}</p></div></div>`).join('') : '<p class="body-copy">変化のサンプルは選んでいません。身体の状態を評価した記録ではありません。</p>'}<div class="card compact"><h2>次回も、今日の体調から。</h2><p>次の練習は、新しい睡眠データと疲労感を確認して選びましょう。今日は一つの気づきを持ち帰れたら十分です。</p></div>${state.result ? go('動画の比較結果も見る →', 'M06') : go('動画でも動きを確かめる →', 'M02')}${go('今日のプランを見直す', 'P01', 'secondary')}${privacy}${disclaimer}`;
}
export const PREMIUM_VIEWS = { P01, P02, P03, P04 };
