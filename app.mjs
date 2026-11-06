import { getComparison, nextPhase, recommendTrainer } from './demo.mjs?v=20261106-self-check';

let trainerId = 'mina';
let practiceId = 'form';
let trainerChoice = 'recommended';
let hasFeedback = false;
let phase = 0;
let playbackTimer = null;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const trainerButtons = [...document.querySelectorAll('[data-trainer]')];
const practiceButtons = [...document.querySelectorAll('[data-practice]')];
const phaseButtons = [...document.querySelectorAll('button[data-phase]')];
const playButton = document.querySelector('#play-demo');
const heroConceptButtons = [...document.querySelectorAll('.concept-switcher [data-concept]')];
const introConceptButtons = [...document.querySelectorAll('[data-intro-concept]')];

const CONCEPTS = Object.freeze([
  Object.freeze({ title: ['一人で始める。', 'でも、迷わない。'], description: '今のあなたに合うトレーニングを、AIが提案。\n自宅で気軽に始めて、分からないことはトレーナーに確認できます。', solution: '目的や今のレベルから、最初に試す練習を提案。', footnote: ['「何をすればいい？」を、今日の一歩に。', 'AIとお手本が、最初の練習を一緒に見つける。'] }),
  Object.freeze({ title: ['ジムに行かなくても、', '正しく鍛えられる。'], description: '自宅でできる、あなたに合ったトレーニングをAIが提案。\n人目を気にせず、今日から始められます。', solution: '道具・場所・時間に合わせて、自宅でできる練習を提案。', footnote: ['道具がなくても、今日から動ける。', 'お手本と比べて、次の一歩が分かる。'] }),
  Object.freeze({ title: ['運動初心者のための、', '最初のトレーニング。'], description: '目的や今のレベルをもとに、AIが最初に試すトレーニングを提案します。\n迷ったら、トレーナーにも確認できます。', solution: '初心者でも取り組みやすい、最初の一種目を提案。', footnote: ['はじめてだからこそ、分かりやすく。', '迷ったら、トレーナーに確認できる。'] }),
  Object.freeze({ title: ['誰にも見られず、', '誰にも置いていかれない。'], description: 'AIの提案で自分のペースから始めて、必要なときはプロに相談できます。\nひとりの練習を、ひとりの悩みにしません。', solution: '人目を気にせず進められる、無理のないステップを提案。', footnote: ['ひとりの時間も、ひとりきりにしない。', '必要なときだけ、トレーナーとつながる。'] }),
  Object.freeze({ title: ['あなたの「今」に合う', '運動を。'], description: 'まずは、スマホで自分の動きを知ることから。\n今の状態と目的に合う練習・トレーナーの提案で、最初の一歩へ。', solution: '動作チェックで確認できる特徴と目的から、練習とお手本を提案。', footnote: ['上手な人ではなく、今の自分から。', 'できることが分かると、続けやすい。'] }),
  Object.freeze({ title: ['正しいか不安なまま、', '続けなくていい。'], description: 'AIが次に意識するポイントを提案し、トレーナーにも確認できます。\n自宅で安心して続けられます。', solution: '動きの比較から、次の一回で意識するポイントを提案。', footnote: ['やり方に迷ったら、いつでも確認。', '安心できる一回が、次の一回につながる。'] }),
  Object.freeze({ title: ['通わない。迷わない。', 'ひとりで始められる。'], description: 'FormMateのAI提案が、自宅トレーニングの最初の一歩を支えます。\n準備に時間をかけず、すぐに始められます。', solution: '通う前の準備を減らし、今日できる練習を提案。', footnote: ['忙しい毎日に、通わない選択肢を。', '自宅ではじめる、あなたの習慣づくり。'] }),
  Object.freeze({ title: ['三日坊主のための、', '続けやすいトレーニング。'], description: 'AIが小さく始められる練習を提案し、成長を確かめながら続けられます。\n頑張りすぎないことから。', solution: 'その日の負担に合わせて、続けやすい小さな練習を提案。', footnote: ['続けることが苦手でも、始められる。', '小さな「できた」を、毎日の目印に。'] }),
  Object.freeze({ title: ['高いジムに通う前に、', 'まず自宅で。'], description: 'AIの提案で、自分に合う運動習慣かどうかを自宅で試せます。\n無理なく始めて、続け方を見つけよう。', solution: 'お金をかける前に、目的に合う練習の入口を提案。', footnote: ['始めるために、大きな準備はいらない。', '自分に合うか、まず試してみる。'] }),
  Object.freeze({ title: ['運動したい。', 'でも、何をすればいいか分からない。'], description: 'FormMateなら、AIがあなたに合う最初の動きを提案。\n一人で始めて、お手本と比べながら進められます。', solution: 'いくつかの質問から、あなたに合う最初の動きを提案。', footnote: ['分からないことから、始めていい。', '提案された一歩を、お手本と一緒に試せる。'] }),
]);

const INTRO_VARIANTS = Object.freeze([
  Object.freeze({ title: ['「何をすればいい？」から、', 'あなたに合う一歩へ。'], description: '目的や今のレベルをもとに、AIが最初に試す練習を提案。\nお手本と比べ、トレーナーに確認しながら、次にやることを見つけられる。', features: [['AIが、最初の練習を提案。', '目的や今のレベルから、\nまず試したい動きを見つける。'], ['違いが見えると、変われる。', '自分の動きとお手本を並べて、\n次に意識することを見つけよう。'], ['迷ったら、トレーナーに聞ける。', 'ひとりで始めても、ひとりで悩まない。\n正しい動きを確認しながら進める。']] }),
  Object.freeze({ title: ['ジムに行く前に、', '自宅で始められる一歩を。'], description: '道具・場所・時間に合わせて、AIが自宅でできる練習を提案。\nまず動いてみて、自分に合う続け方を見つけられる。', features: [['自宅でできる練習を提案。', '道具やスペースに合わせて、\n無理なく始められる動きを選ぶ。'], ['お手本と並べて確認。', '自分の動きとの違いから、\n次に意識するポイントを見つける。'], ['必要なときはプロに相談。', '一人で進めながら、\n分からないことだけ確認できる。']] }),
  Object.freeze({ title: ['はじめての不安を、', '最初の一種目に変える。'], description: '運動経験が少なくても、AIが取り組みやすい練習から提案。\n小さく始めて、できることを増やしていける。', features: [['最初の一種目が分かる。', '何から始めるか迷う時間を減らし、\n今日の練習を決める。'], ['動き方を見ながら進める。', 'お手本との比較で、\n正しい姿勢を確かめる。'], ['質問できるから安心。', '不安なところは、\nトレーナーに確認して進める。']] }),
  Object.freeze({ title: ['人目を気にせず、', '自分のペースで進める。'], description: 'AIの提案から一人で始めて、必要なときだけプロにつながれる。\nひとりの練習を、ひとりの悩みにしない。', features: [['自分のペースに合う提案。', '人と比べず、\n今できる練習から始める。'], ['自分の動きと向き合う。', 'お手本との違いを見ながら、\n自分の変化を確かめる。'], ['必要なときだけ相談。', '人見知りでも、\n聞きたいことを確認できる。']] }),
  Object.freeze({ title: ['今の自分が分かると、', '続ける一歩が見えてくる。'], description: 'AIと一緒に現在のレベルを整理して、背伸びをしない練習を提案。\nできることから少しずつ進められる。', features: [['今のレベルから始める。', 'できることを整理して、\n合う練習の入口をつくる。'], ['変化を比べて確かめる。', 'お手本や前回の自分と比べて、\n小さな成長を見つける。'], ['次の課題を相談できる。', '迷ったときは、\nトレーナーと次の一歩を決める。']] }),
  Object.freeze({ title: ['正しいか不安なまま、', 'ひとりで続けない。'], description: '動きの比較からAIが次に意識するポイントを提案。\nトレーナーにも確認しながら、安心して続けられる。', features: [['見るポイントを提案。', '動きの違いから、\n次の一回で意識することを絞る。'], ['お手本と同じ場面で見る。', '始め・途中・終わりを比べて、\n動きを確認する。'], ['正しさをプロに確認。', '自分だけで判断せず、\nトレーナーに聞いて進める。']] }),
  Object.freeze({ title: ['通う前に、', 'まず自宅で試してみる。'], description: 'AIの提案で、自分に合う運動習慣かどうかを自宅で体験。\n大きな準備をせず、最初の一歩を試せる。', features: [['始める練習を提案。', '通う場所を決める前に、\n目的に合う動きを試す。'], ['自分に合うか比べる。', 'お手本との比較で、\n続けたい練習を見つける。'], ['続け方を相談できる。', '一人で続ける方法も、\nトレーナーに確認できる。']] }),
  Object.freeze({ title: ['三日坊主でも、', '今日の一回を続けられる。'], description: 'その日の負担に合わせて、AIが小さく始められる練習を提案。\n頑張りすぎず、成長を確かめながら続けられる。', features: [['小さな練習から始める。', '今日できる量に合わせて、\n無理のない一歩を選ぶ。'], ['できたことを比べる。', '前回の動きと比べて、\n小さな変化を見つける。'], ['続け方を見直せる。', '難しいときは、\nトレーナーに相談して調整する。']] }),
  Object.freeze({ title: ['あなたに合うか分からないなら、', 'まずAIに聞いてみる。'], description: 'いくつかの質問から、AIが目的や生活に合う練習の入口を提案。\n試しながら、自分に合う方法を見つけられる。', features: [['質問から練習を提案。', '目的や生活のペースをもとに、\n最初の動きを選ぶ。'], ['試して違いを確かめる。', 'お手本と比べながら、\n自分に合う感覚を探す。'], ['迷いをトレーナーに聞く。', 'AIの提案だけでなく、\n気になる点をプロに確認できる。']] }),
  Object.freeze({ title: ['何をすればいいか分からない。', 'だから、最初を一緒につくる。'], description: 'AIがあなたに合う最初の動きを提案し、お手本との比較へ案内。\n一人で始めても、次にやることが見えてくる。', features: [['最初の動きを提案。', '分からない状態から、\n今日できる練習を始める。'], ['次にやることが見える。', '比較で違いを見つけて、\n次の意識を一つに絞る。'], ['困ったら確認できる。', '一人で進めながら、\nトレーナーに質問して解決する。']] }),
]);

function renderHeroConcept(index) {
  const concept = CONCEPTS[index];
  if (!concept) return;
  document.querySelector('#hero-title-line-one').textContent = concept.title[0];
  document.querySelector('#hero-title-line-two').textContent = concept.title[1];
  document.querySelector('#hero-description').textContent = concept.description;
  document.querySelector('#hero-footnote-line').textContent = concept.footnote[0];
  document.querySelector('#hero-footnote-strong').textContent = concept.footnote[1];
  document.querySelector('#concept-solution').innerHTML = `<span>AI PROPOSAL</span>${concept.solution}`;
  for (const button of heroConceptButtons) {
    const selected = Number(button.dataset.concept) === index;
    button.setAttribute('aria-pressed', String(selected));
    button.classList.toggle('is-selected', selected);
  }
  document.querySelector('#concept-switcher-note').textContent = `案 ${String(index + 1).padStart(2, '0')} を表示中。番号を押して、みんなで比べてみよう。`;
}

function renderIntroConcept(index) {
  const intro = INTRO_VARIANTS[index];
  if (!intro) return;
  document.querySelector('#intro-title-line-one').textContent = intro.title[0];
  document.querySelector('#intro-title-line-two').textContent = intro.title[1];
  document.querySelector('#intro-description').textContent = intro.description;
  const featureIds = ['one', 'two', 'three'];
  intro.features.forEach(([title, description], featureIndex) => {
    const featureId = featureIds[featureIndex];
    document.querySelector(`#feature-${featureId}-title`).textContent = title;
    document.querySelector(`#feature-${featureId}-description`).textContent = description;
  });
  for (const button of introConceptButtons) {
    const selected = Number(button.dataset.introConcept) === index;
    button.setAttribute('aria-pressed', String(selected));
    button.classList.toggle('is-selected', selected);
  }
}

function renderComparison() {
  const comparison = getComparison(trainerId, phase, practiceId);
  const { trainer } = comparison;
  const recommendation = recommendTrainer(practiceId);
  document.querySelector('#recommendation-mode').textContent = trainerChoice === 'recommended' ? '目的に合わせたおすすめ' : 'あなたが選び直したお手本';
  document.querySelector('#trainer-recommendation-reason').textContent = trainerChoice === 'recommended' ? recommendation.reason : `${trainer.name}のお手本に変更しました。目的はそのままに、指導スタイルを比べられます。おすすめは${recommendation.trainer.name}です。`;
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
  trainerChoice = 'manual';
  hasFeedback = false;
  phase = 0;
  renderComparison();
}));

practiceButtons.forEach((button) => button.addEventListener('click', () => {
  stopPlayback();
  practiceId = button.dataset.practice;
  trainerId = recommendTrainer(practiceId).trainer.id;
  trainerChoice = 'recommended';
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
