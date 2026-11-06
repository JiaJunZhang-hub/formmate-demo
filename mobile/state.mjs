import { createPremium, reducePremium } from './premium.mjs?v=20261106-devices-office';
import { createComparisonBody, BODY_SCENARIOS } from './comparison-body.mjs?v=20261106-devices-office';
import { createDevices, createOffice, reduceDevicesOffice } from './devices-office.mjs?v=20261106-devices-office';

export const SCREENS = Object.freeze([
  ['O01', '初回ヒアリング', 'setup'], ['O02', '身体・動作チェック', 'setup'], ['O03', '開始プラン', 'setup'],
  ['M01', 'ホーム', 'home'], ['M02', '練習タイプ', 'practice'], ['M03', 'お手本を選ぶ', 'practice'],
  ['M04', 'お手本の詳細', 'practice'], ['M05', '撮影ガイド', 'practice'], ['M06', '比較・フィードバック', 'practice'],
  ['M07', 'AI動画編集', 'practice'], ['M08', '共有の確認', 'practice'], ['M09', '仲間のフィード', 'community'],
  ['M10', 'チーム・交流', 'community'], ['M11', '約練日の調整', 'community'], ['M12', '学ぶ', 'learn'],
  ['M13', 'レッスン・Live', 'learn'], ['M14', 'イベント・特典', 'learn'], ['M15', 'マイページ', 'my'],
  ['P01', '睡眠・回復状況', 'home'], ['P02', '今日のプラン', 'home'], ['P03', 'からだ連動の練習', 'practice'], ['P04', 'からだの振り返り', 'my'],
  ['P05', '機器とからだの記録', 'my'], ['P06', '仕事の合間のながら運動', 'home'],
].map(([id, title, tab]) => Object.freeze({ id, title, tab })));

export const COACHES = Object.freeze([
  { id: 'mina', name: 'MINA', title: 'ていねいに、フォームから。', tag: '基本をじっくり', color: '#b96e58', description: '小さな動きの違いを、一緒に見つける。基礎を大切にするコーチのサンプルです。' },
  { id: 'ryo', name: 'RYO', title: '自分のペースで、少しずつ。', tag: '自重トレーニング', color: '#5e7e6a', description: '身近な動きから、からだを動かす楽しさへ。道具なしの練習を案内するサンプルです。' },
  { id: 'haru', name: 'HARU', title: '続けられる、わたしの習慣。', tag: 'ゆっくり習慣づくり', color: '#ad8b4d', description: '忙しい日にも、無理なく続く小さな一歩。習慣づくりを応援するサンプルです。' },
].map(Object.freeze));
export const FOCUSES = Object.freeze([
  { id: 'form', name: 'フォーム', subtitle: '動きの位置を、ていねいに', icon: '◎' },
  { id: 'control', name: '安定性', subtitle: 'ぶれずにつながる動きへ', icon: '〰' },
  { id: 'rhythm', name: 'リズム', subtitle: '自分に合うペースを知る', icon: '◷' },
].map(Object.freeze));
export const EXERCISES = Object.freeze([
  { id: 'squat', name: 'スクワット', label: '基本のスクワット', pose: 'squat' },
  { id: 'hinge', name: 'ヒップヒンジ', label: '股関節から動く練習', pose: 'hinge' },
  { id: 'reach', name: '腕上げ', label: 'ゆっくり腕を上げる', pose: 'reach' },
].map(Object.freeze));
const OPTIONS = { goal: ['habit', 'form', 'strength'], experience: ['new', 'sometimes', 'regular'], minutes: ['5', '10', '20'], equipment: ['none', 'mat', 'dumbbell'] };

export function createState() {
  return {
    screen: 'O01', premium: createPremium(), devices: createDevices(), office: createOffice(), profile: { goal: 'habit', experience: 'new', minutes: '5', equipment: 'none' },
    check: 'none', onboardingDone: false, planCustomized: false, focus: 'form', coach: 'mina', exercise: 'squat', level: '01',
    phase: 0, compareView: 'split', captured: false, result: null, history: [], captureSerial: 0, comparisonBody: createComparisonBody(),
    edit: { layout: 'split', captions: true, scene: 'improvement' },
    share: { format: 'card', destination: 'private', showLevel: false, confirmed: false },
    team: 'none', comments: [], encouraged: false, schedule: { date: 'sat', location: 'park', status: 'none' },
    learnFilter: 'lesson', lessonMode: 'lesson', lessonStage: 'detail', planned: [], eventStatus: 'none', reward: 'conditions',
  };
}

export function initialScreen(hash = '') {
  const id = hash.startsWith('#') ? hash.slice(1) : hash;
  return SCREENS.some((screen) => screen.id === id) ? id : 'M01';
}

function oneOf(value, values, field) {
  if (!values.includes(value)) throw new RangeError(`${field} の値が選択肢にありません。`);
  return value;
}
export function getCoach(id) { const coach = COACHES.find((item) => item.id === id); if (!coach) throw new RangeError('不明なコーチです。'); return coach; }
export function getExercise(id) { const exercise = EXERCISES.find((item) => item.id === id); if (!exercise) throw new RangeError('不明な種目です。'); return exercise; }
export function recommendation(state) {
  const reported = state.profile.goal === 'form' ? 'フォームを確かめたい' : state.profile.goal === 'strength' ? 'からだを動かす力をつけたい' : '運動を習慣にしたい';
  const focus = state.profile.goal === 'habit' ? 'rhythm' : 'form';
  return {
    focus, exercise: 'squat', level: '01', reported,
    observed: state.check === 'sample' ? 'サンプル映像では、動き始めと戻る場面を確認できました。' : state.check === 'insufficient' ? '全身が映っていない想定のため、動きは判定していません。' : '撮影をしていないため、動きは確認していません。',
    reason: `回答の「${reported}」と「${state.profile.minutes}分」をもとに、短時間・道具なしの基本練習を提案します。`,
  };
}

export function reduce(state, action) {
  const next = structuredClone(state);
  const clearResult = () => { next.result = null; next.captured = false; next.share.confirmed = false; next.comparisonBody = createComparisonBody(); };
  switch (action.type) {
    case 'deviceWatchRead': case 'scaleConnect': case 'scaleRead': case 'officeExercise': case 'officeStart': case 'officeFinish': case 'officeSkip': case 'officeNext': case 'reminderSetting': case 'reminderQuiet': case 'reminderSnooze': case 'reminderResume': case 'reminderPreview':
      return reduceDevicesOffice(next, action);
    case 'recoverySample': case 'fatigue': case 'dailyPlan': case 'liveSample':
      next.premium = reducePremium(next.premium, action); break;
    case 'watch':
      next.premium = reducePremium(next.premium, action);
      next.devices.watchStatus = 'unread'; next.devices.watchTime = null;
      next.comparisonBody.fresh = false; next.comparisonBody.captureId = null; break;
    case 'comparisonScenario':
      if (!next.result || next.comparisonBody.history) throw new Error('新しい撮影サンプルを選んでください。');
      next.comparisonBody.scenario = oneOf(action.value, Object.keys(BODY_SCENARIOS), '身体データの場面');
      next.comparisonBody.fresh = next.premium.connected;
      next.comparisonBody.captureId = next.result.captureId; break;
    case 'comparisonRead':
      if (!next.result || next.comparisonBody.history) throw new Error('新しい撮影サンプルを選んでください。');
      if (!next.premium.connected) throw new Error('時計の接続サンプルを選んでください。');
      next.comparisonBody.fresh = true; next.comparisonBody.captureId = next.result.captureId; break;
    case 'watchCompare': {
      next.captureSerial += 1; next.captured = true; next.phase = 0;
      next.result = { coach: next.coach, focus: next.focus, exercise: next.exercise, level: next.level, sample: true, captureId: next.captureSerial };
      next.history.push({ ...next.result });
      next.share = { format: 'card', destination: 'private', showLevel: false, confirmed: false };
      next.comparisonBody = { ...createComparisonBody(), scenario: next.premium.live === 'elevated' ? 'elevated' : 'normal', fresh: next.premium.connected && next.premium.live !== 'missing', captureId: next.captureSerial };
      next.screen = 'M06'; break;
    }
    case 'acceptDailyPlan':
      next.premium = reducePremium(next.premium, action); break;
    case 'startLive':
      if (next.office.status === 'doing') throw new Error('ながら運動を終了してから、時計連動の練習を始めましょう。');
      next.premium = reducePremium(next.premium, action); next.screen = 'P03'; break;
    case 'finishLive':
      next.premium = reducePremium(next.premium, action); next.screen = 'P04'; break;
    case 'navigate': next.screen = oneOf(action.screen, SCREENS.map(({ id }) => id), '画面'); break;
    case 'profile':
      if (!OPTIONS[action.field]) throw new RangeError('不明な回答項目です。');
      next.profile[action.field] = oneOf(action.value, OPTIONS[action.field], action.field); break;
    case 'check': next.check = oneOf(action.value, ['none', 'sample', 'insufficient'], 'チェック'); next.screen = 'O03'; break;
    case 'start': if (!next.planCustomized) next.focus = recommendation(next).focus; next.onboardingDone = true; next.screen = 'M02'; break;
    case 'focus': next.focus = oneOf(action.value, FOCUSES.map(({ id }) => id), '練習タイプ'); if (next.screen === 'O03') next.planCustomized = true; clearResult(); break;
    case 'coach': getCoach(action.value); next.coach = action.value; clearResult(); break;
    case 'exercise': getExercise(action.value); next.exercise = action.value; clearResult(); break;
    case 'level': next.level = oneOf(action.value, ['01', '02', '03'], 'レベル'); clearResult(); break;
    case 'capture': next.captureSerial += 1; next.phase = 0; next.comparisonBody = createComparisonBody(); next.captured = true; next.result = null; next.share = { format: 'card', destination: 'private', showLevel: false, confirmed: false }; next.screen = 'M06'; break;
    case 'unassessable': next.captured = false; next.result = null; next.comparisonBody = createComparisonBody(); next.screen = 'M05'; break;
    case 'analyze':
      if (!next.captured) throw new Error('まず撮影サンプルを選んでください。');
      if (!next.result) next.history.push({ coach: next.coach, focus: next.focus, exercise: next.exercise, level: next.level, sample: true, captureId: next.captureSerial });
      next.result = { coach: next.coach, focus: next.focus, exercise: next.exercise, level: next.level, sample: true, captureId: next.captureSerial };
      break;
    case 'history': {
      if (!Number.isInteger(action.value) || !next.history[action.value]) throw new RangeError('練習記録がありません。');
      const record = next.history[action.value]; Object.assign(next, { coach: record.coach, focus: record.focus, exercise: record.exercise, level: record.level, captured: true, result: { ...record }, screen: 'M06', phase: 0, comparisonBody: { ...createComparisonBody(), history: true } }); break;
    }
    case 'phase': if (!Number.isInteger(action.value)) throw new RangeError('場面は整数で指定してください。'); next.phase = oneOf(action.value, [0, 1, 2], '場面'); break;
    case 'compareView': next.compareView = oneOf(action.value, ['split', 'reference', 'self'], '比較表示'); break;
    case 'edit':
      if (action.field === 'captions') { if (typeof action.value !== 'boolean') throw new TypeError('字幕は真偽値で指定してください。'); next.edit.captions = action.value; }
      else if (action.field === 'layout') next.edit.layout = oneOf(action.value, ['split', 'solo'], 'レイアウト');
      else if (action.field === 'scene') next.edit.scene = oneOf(action.value, ['improvement', 'full'], '場面');
      else throw new RangeError('不明な編集項目です。'); break;
    case 'shareOption':
      if (action.field === 'format') next.share.format = oneOf(action.value, ['card', 'video'], '共有形式');
      else if (action.field === 'destination') next.share.destination = oneOf(action.value, ['private', 'team', 'sns'], '共有範囲');
      else if (action.field === 'showLevel') { if (typeof action.value !== 'boolean') throw new TypeError('公開項目は真偽値で指定してください。'); next.share.showLevel = action.value; }
      else throw new RangeError('不明な共有項目です。'); next.share.confirmed = false; break;
    case 'confirmShare': if (!next.result) throw new Error('共有する練習結果がありません。'); next.share.confirmed = true; break;
    case 'team': next.team = oneOf(action.value, ['none', 'pending', 'joined'], '参加状態'); break;
    case 'encourage': next.encouraged = !next.encouraged; break;
    case 'comment': {
      const text = typeof action.value === 'string' ? action.value.trim() : '';
      if (!text || text.length > 120) throw new RangeError('1〜120文字で入力してください。'); next.comments.push(text); break;
    }
    case 'schedule':
      if (action.field === 'date') next.schedule.date = oneOf(action.value, ['sat', 'sun', 'wed'], '日程');
      else if (action.field === 'location') next.schedule.location = oneOf(action.value, ['park', 'studio'], '場所');
      else if (action.field === 'status') next.schedule.status = oneOf(action.value, ['none', 'requested', 'confirmed', 'cancelled'], '約練日');
      else throw new RangeError('不明な予定項目です。'); break;
    case 'learnFilter': next.learnFilter = oneOf(action.value, ['lesson', 'live', 'event'], '学ぶ'); break;
    case 'lesson': next.lessonMode = oneOf(action.value, ['lesson', 'live'], 'レッスン'); next.lessonStage = 'detail'; next.screen = 'M13'; break;
    case 'lessonStage': next.lessonStage = oneOf(action.value, ['detail', 'watch', 'done'], '受講状態'); break;
    case 'plan': oneOf(action.value, ['lesson', 'live'], '参加予定'); if (!next.planned.includes(action.value)) next.planned.push(action.value); break;
    case 'event': next.eventStatus = oneOf(action.value, ['none', 'planned', 'cancelled'], 'イベント参加'); break;
    case 'reward': next.reward = oneOf(action.value, ['conditions', 'progress', 'eligible'], '特典'); break;
    case 'reset': return createState();
    default: throw new RangeError('不明な操作です。');
  }
  return next;
}
