import { SCREENS, createState, reduce, initialScreen } from './state.mjs?v=20261106-form-body';
import { renderScreen, renderTabs } from './views.mjs?v=20261106-form-body';

let state = createState();
let ui = { unassessable: false, busy: false };
const app = document.querySelector('#app');
const tabs = document.querySelector('#tabs');
const list = document.querySelector('#screen-list');
document.querySelector('.inspector-heading>span').textContent = `${SCREENS.length} screens`;
let toastTimer;

function notify(text) {
  const toast = document.querySelector('#toast');
  toast.textContent = text; toast.hidden = false;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => { toast.hidden = true; }, 4000);
}

function render({ move = false } = {}) {
  const top = app.scrollTop;
  const active = document.activeElement;
  const focusedControl = active?.dataset?.action ? { action: active.dataset.action, field: active.dataset.field, value: active.dataset.value, tagName: active.tagName } : null;
  const openDisclosures = [...app.querySelectorAll('details[open]')].map((item) => item.querySelector('summary').textContent);
  app.innerHTML = renderScreen(state.screen, state, ui);
  if (ui.busy) app.insertAdjacentHTML('beforeend', '<div class="loading-overlay" role="status"><span>✧</span><strong>サンプルを確認しています…</strong><p>実際の撮影・AI解析は行っていません。</p></div>');
  tabs.innerHTML = renderTabs(state);
  list.innerHTML = SCREENS.map(({ id, title }) => `<button class="screen-jump ${id === state.screen ? 'active' : ''}" data-action="navigate" data-value="${id}" ${id === state.screen ? 'aria-current="page"' : ''}><span>${id}</span>${title}<i>›</i></button>`).join('');
  document.querySelectorAll('[data-action]').forEach((node) => {
    node.dataset.testid = `${node.dataset.action}-${node.dataset.field || ''}-${node.dataset.value || 'control'}`;
  });
  if (!move) app.querySelectorAll('details').forEach((item) => { if (openDisclosures.includes(item.querySelector('summary').textContent)) item.open = true; });
  app.scrollTop = move ? 0 : top;
  if (!move && focusedControl) {
    const replacement = [...app.querySelectorAll('[data-action]')].find((node) => node.tagName === focusedControl.tagName && node.dataset.action === focusedControl.action && node.dataset.field === focusedControl.field && node.dataset.value === focusedControl.value);
    replacement?.focus({ preventScroll: true });
  }
  if (move) { app.focus({ preventScroll: true }); window.history.replaceState(null, '', `#${state.screen}`); }
  document.title = `${SCREENS.find(({ id }) => id === state.screen).title} | FormMate モック`;
}

function dispatch(action) {
  const oldScreen = state.screen;
  state = reduce(state, action);
  render({ move: state.screen !== oldScreen || action.type === 'reset' });
}

function previewCheck() {
  ui.busy = true; render();
  window.setTimeout(() => { ui.busy = false; dispatch({ type: 'check', value: 'sample' }); }, 850);
}
function previewCapture() {
  ui.busy = true; render();
  window.setTimeout(() => {
    ui.busy = false; ui.unassessable = false;
    state = reduce(state, { type: 'capture' });
    state = reduce(state, { type: 'analyze' });
    render({ move: true });
  }, 850);
}

function act(node) {
  const type = node.dataset.action;
  let value = node.type === 'checkbox' ? node.checked : node.dataset.value ?? node.value;
  if (type === 'phase' || type === 'history') value = Number(value);
  if (type === 'busyCheck') return previewCheck();
  if (type === 'busyCapture') return previewCapture();
  if (type === 'advance') return dispatch({ type: 'phase', value: (state.phase + 1) % 3 });
  if (type === 'navigate') {
    if (value === 'M13') return dispatch({ type: 'lesson', value: 'lesson' });
    document.body.classList.remove('inspector-open');
    document.querySelector('.mobile-guide-toggle')?.setAttribute('aria-expanded', 'false');
    return dispatch({ type, screen: value });
  }
  if (type === 'toggleInspector') {
    const expanded = document.body.classList.toggle('inspector-open');
    node.setAttribute('aria-expanded', String(expanded)); return;
  }
  if (type === 'unassessable') ui.unassessable = true;
  if (type === 'check' && value !== 'insufficient') ui.unassessable = false;
  dispatch({ type, field: node.dataset.field, value });
  if (type === 'team') notify('チームの参加状態を、このモック内で更新しました。');
  if (type === 'plan' || type === 'event') notify('予定の表示を更新しました。実際の申込はしていません。');
  if (type === 'schedule') notify('日程の選択・状態をモック内で更新しました。');
  if (type === 'reward') notify('特典の状態例を更新しました。受取権利は発生しません。');
  if (type === 'reset') notify('記録をリセットしました。');
}

document.addEventListener('click', (event) => {
  const node = event.target.closest('button[data-action]');
  if (!node || ui.busy) return;
  try { act(node); } catch (error) { notify(error.message); }
});
document.addEventListener('change', (event) => {
  const node = event.target.closest('select[data-action], input[data-action]');
  if (!node || ui.busy) return;
  try { act(node); } catch (error) { notify(error.message); }
});
document.addEventListener('submit', (event) => {
  event.preventDefault();
  try {
    if (event.target.id === 'comment-form') { dispatch({ type: 'comment', value: new FormData(event.target).get('comment') }); notify('画面内にコメントを追加しました。誰にも送信していません。'); }
    if (event.target.id === 'question-form') {
      const question = String(new FormData(event.target).get('question') || '').trim();
      if (!question || question.length > 120) throw new RangeError('質問は1〜120文字で入力してください。');
      notify('質問の下書きを確認しました。コーチには送信していません。');
    }
  } catch (error) { notify(error.message); }
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    document.body.classList.remove('inspector-open');
    document.querySelector('.mobile-guide-toggle')?.setAttribute('aria-expanded', 'false');
  }
});
state = reduce(state, { type: 'navigate', screen: initialScreen(window.location.hash) });
render();

// On small screens, prototype controls are explicitly separated from the product UI.
const control = document.createElement('button');
control.className = 'mobile-guide-toggle'; control.dataset.action = 'toggleInspector'; control.textContent = '画面一覧 / 状態例';
control.setAttribute('aria-label', 'モックの画面一覧と状態例を開閉する');
control.setAttribute('aria-expanded', 'false');
control.setAttribute('aria-controls', 'screen-list');
document.querySelector('.statusbar').append(control);
