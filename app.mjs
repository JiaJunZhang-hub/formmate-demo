import { getComparison, nextPhase } from './demo.mjs';

let trainerId = 'mina';
let practiceId = 'form';
let hasFeedback = false;
let phase = 0;
let playbackTimer = null;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const trainerButtons = [...document.querySelectorAll('[data-trainer]')];
const practiceButtons = [...document.querySelectorAll('[data-practice]')];
const phaseButtons = [...document.querySelectorAll('button[data-phase]')];
const playButton = document.querySelector('#play-demo');

function renderComparison() {
  const comparison = getComparison(trainerId, phase, practiceId);
  const { trainer } = comparison;
  for (const button of practiceButtons) {
    const selected = button.dataset.practice === practiceId;
    button.setAttribute('aria-pressed', String(selected));
    button.classList.toggle('is-selected', selected);
  }
  for (const button of trainerButtons) {
    const selected = button.dataset.trainer === trainerId;
    button.setAttribute('aria-pressed', String(selected));
    button.classList.toggle('is-selected', selected);
  }
  for (const button of phaseButtons) button.setAttribute('aria-pressed', String(Number(button.dataset.phase) === phase));
  document.querySelector('#trainer-description').textContent = trainer.description;
  document.querySelector('#reference-name').textContent = `${trainer.name} のお手本`;
  document.querySelector('#course-title').textContent = trainer.level;
  document.querySelector('#practice-description').textContent = comparison.practice.description;
  document.querySelector('#comparison-selection').textContent = `${comparison.practice.name} × ${trainer.name}のお手本`;
  document.querySelector('#feedback-result').hidden = !hasFeedback;
  document.querySelector('#feedback-empty').hidden = hasFeedback;
  document.querySelector('#feedback-context').textContent = comparison.feedback.context;
  document.querySelector('#feedback-point').textContent = `今回見るポイント：${comparison.feedback.point}`;
  document.querySelector('#feedback-cue').textContent = comparison.feedback.cue;
  document.querySelector('#feedback-advice').textContent = comparison.feedback.advice;
  document.querySelector('#phase-count').textContent = `0${phase + 1} / 03`;
  document.querySelector('.comparison-frames').dataset.phase = String(phase);
  const symbol = phase === 1 ? '#squat-person' : '#standing-person';
  document.querySelector('#reference-person use').setAttribute('href', symbol);
  document.querySelector('#your-person use').setAttribute('href', symbol);
  document.querySelector('#reference-person').style.color = trainer.color;
  document.querySelector('#reference-person').setAttribute('aria-label', `${trainer.name}のお手本：${comparison.phaseLabel}（イラスト）`);
  document.querySelector('#your-person').setAttribute('aria-label', `あなたの動き：${comparison.phaseLabel}（サンプル）`);
}

function stopPlayback() {
  window.clearInterval(playbackTimer);
  playbackTimer = null;
  playButton.setAttribute('aria-pressed', 'false');
  playButton.setAttribute('aria-label', '比較デモを再生する');
  document.querySelector('#play-icon').textContent = '▶';
}

function advancePhase() {
  phase = nextPhase(phase);
  renderComparison();
}

trainerButtons.forEach((button) => button.addEventListener('click', () => {
  stopPlayback();
  trainerId = button.dataset.trainer;
  hasFeedback = false;
  phase = 0;
  renderComparison();
}));

practiceButtons.forEach((button) => button.addEventListener('click', () => {
  stopPlayback();
  practiceId = button.dataset.practice;
  hasFeedback = false;
  phase = 0;
  renderComparison();
}));

document.querySelector('#compare-demo').addEventListener('click', () => {
  stopPlayback();
  hasFeedback = true;
  renderComparison();
});

phaseButtons.forEach((button) => button.addEventListener('click', () => {
  stopPlayback();
  phase = Number(button.dataset.phase);
  renderComparison();
}));

playButton.addEventListener('click', () => {
  if (playbackTimer !== null) return stopPlayback();
  if (reducedMotion.matches) return advancePhase();
  advancePhase();
  playButton.setAttribute('aria-pressed', 'true');
  playButton.setAttribute('aria-label', '比較デモを一時停止する');
  document.querySelector('#play-icon').textContent = 'Ⅱ';
  playbackTimer = window.setInterval(advancePhase, 1200);
});

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() {
  navigation.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'メニューを開く');
}
menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') !== 'true';
  navigation.classList.toggle('is-open', isOpen);
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
});
navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener('visibilitychange', () => { if (document.hidden) stopPlayback(); });
reducedMotion.addEventListener('change', stopPlayback);
renderComparison();
