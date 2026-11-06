import { BODY_SCENARIOS, comparisonBodyReading } from './comparison-body.mjs?v=20261106-form-body';
import { escapeHtml as e } from './illustrations.mjs?v=20261106-form-body';

const button = (label, action, value = '', cls = 'chip', extra = '') => `<button class="${cls}" data-action="${action}" data-value="${e(value)}" ${extra}>${label}</button>`;
export function renderComparisonBody(state) {
  const reading = comparisonBodyReading(state);
  const connected = state.premium.connected;
  const sample = state.comparisonBody;
  return `<section class="form-body-panel ${reading.attention ? 'form-body-attention' : ''}" aria-label="フォームと身体データを同じ場面で確認"><div class="form-body-heading"><span class="eyebrow">PREMIUM / FORM × BODY</span><span class="tag">自分だけ</span></div><h2>動きと、からだの反応を。<br>同じ場面で、確かめる。</h2><div class="form-body-position"><span>◷ サンプル再生 ${reading.time}</span><span>${reading.phaseName}</span></div><p class="form-body-status" role="status">${reading.status}</p>
  ${reading.history ? '<p class="fine-print">過去の比較に、今の時計データを重ねません。新しく撮影サンプルを選ぶと、身体データの例も確認できます。</p>' : `<div class="form-body-connect">${button(connected ? '時計の切断を試す' : '時計の接続を試す', 'watch', connected ? 'disconnected' : 'connected', 'secondary small')}${connected ? button('サンプルを読み込む', 'comparisonRead', '', 'secondary small') : ''}</div>`}
  <div class="form-body-metrics"><div><span>心拍数</span><strong>${reading.heart ?? '—'}<small>${reading.heart === null ? '未取得' : 'bpm'}</small></strong></div><div><span>呼吸数 / 推定</span><strong>${reading.respiration ?? '—'}<small>${reading.respiration === null ? '未取得・非対応' : '回/分'}</small></strong></div></div>
  <div class="form-body-observation"><span>動きの確認 / サンプル</span><p>${reading.form}</p></div><div class="form-body-observation"><span>身体の反応 / サンプル</span><p>${reading.body}</p></div><div class="form-body-advice" role="status"><span>次の一回へのヒント</span><p>${reading.next}</p></div>
  ${reading.history ? '' : `<details class="disclosure"><summary>身体データの状態例を切り替える <span>＋</span></summary><div class="choice-row">${Object.entries(BODY_SCENARIOS).map(([id, value]) => button(value.label, 'comparisonScenario', id, `chip ${sample.scenario === id ? 'selected' : ''}`, `aria-pressed="${sample.scenario === id}"`)).join('')}</div><p class="fine-print">場面ボタンで動き・数値・ヒントを同時に切り替えます。再接続後はサンプルを読み込むまで値を表示しません。</p></details>`}
  <p class="form-body-note">固定のサンプル時間軸です。実際の計測・動画同期・AI解析は行いません。フォームと身体反応の因果関係を判定したものではありません。推定呼吸数の取得は機種・運動種別・データ提供条件によります。</p><p class="premium-privacy">◈ 身体データは共有カード・SNSに含めません。</p>${state.premium.active ? button('進行中の時計連動の練習へ戻る →', 'navigate', 'P03', 'text-button') : ''}</section>`;
}
