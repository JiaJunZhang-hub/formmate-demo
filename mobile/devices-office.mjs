export const SCALE_SAMPLE = Object.freeze({
  weight: ['62.5', '62.3', '62.2', '62.1'], bodyFat: ['24.0', '23.8', '23.9', '23.7'], muscle: ['44.0', '44.1', '44.0', '44.2'],
  weeks: ['3週前', '2週前', '1週前', '今週'], source: '体組成計 / 架空のデータ', time: '今日 09:12 / サンプル',
});
export const OFFICE_EXERCISES = Object.freeze({
  shoulders: { title: '座ったまま、肩をゆっくり', time: '30秒', icon: '〰', steps: ['安定した椅子に座り、足を床につける。', '肩をゆっくり上げて、力を抜いて下ろす。', '呼吸を続け、気持ちのよい範囲で数回。'] },
  ankles: { title: 'デスクの下で、足首を動かす', time: '1分', icon: '↗', steps: ['椅子に座り、足元に十分なスペースをつくる。', 'かかとを床につけ、つま先をゆっくり上げ下げ。', '左右とも無理のない範囲で。違和感があればやめる。'] },
  stand: { title: 'いったん立って、ひと息', time: '2分', icon: '◷', steps: ['作業を区切り、周囲にスペースがあるか確認。', '安定した場所でゆっくり立ち、姿勢を変える。', '少し歩くかその場で休み、落ち着いて作業に戻る。'] },
});
export function createDevices() { return { watchStatus: 'unread', watchTime: null, scaleConnected: false, scaleStatus: 'unread', scaleTime: null }; }
export function createOffice() {
  return { exercise: 'shoulders', status: 'ready', occurrence: 1, sessions: [], reminders: { enabled: false, days: 'weekdays', hours: '9-18', interval: '60', quiet: false, snoozed: false }, preview: false };
}
const choice = (value, options, field) => { if (!options.includes(value)) throw new RangeError(`${field}の選択が不正です。`); return value; };
export function scaleAvailable(devices) { return devices.scaleConnected && devices.scaleStatus === 'synced'; }
export function reminderState(state) {
  const r = state.office.reminders;
  if (!r.enabled) return { status: 'off', label: 'リマインダーはオフ', message: '通知なしでも、好きなタイミングで運動できます。' };
  if (state.premium.active) return { status: 'paused', label: '練習中は、お知らせをお休み', message: '時計連動の練習を終了するまで、リマインダーを控えます。' };
  if (r.quiet) return { status: 'paused', label: '会議・集中時間はお休み', message: '「休止を解除する」を選ぶまで、お知らせを止めます。' };
  if (r.snoozed) return { status: 'paused', label: 'あとで再開するまで、お休み', message: '時間がたっても自動で再開しません。都合のよいときに再開できます。' };
  if (state.office.status === 'doing') return { status: 'paused', label: 'いまのひと息に集中', message: '運動の例を終えるまで、次のお知らせは控えます。' };
  return { status: 'ready', label: 'あなたの時間に、ひと息を', message: `${r.days === 'weekdays' ? '平日' : '毎日'}・${r.hours === '9-18' ? '9:00〜18:00' : '10:00〜19:00'}・${r.interval}分間隔の設定例です。` };
}
export function reduceDevicesOffice(state, action) {
  const next = structuredClone(state);
  const d = next.devices, o = next.office;
  switch (action.type) {
    case 'deviceWatchRead':
      if (!next.premium.connected) throw new Error('先に時計の接続を試してください。');
      d.watchStatus = choice(action.value, ['synced', 'missing', 'stale'], '時計データ');
      d.watchTime = d.watchStatus === 'synced' ? '今日 09:10 / サンプル' : null;
      next.premium.sleepAvailable = d.watchStatus === 'synced';
      if (!next.premium.active) { next.premium.selectedPlan = null; next.premium.acceptedPlan = null; }
      next.premium.live = d.watchStatus === 'synced' ? 'steady' : 'missing';
      if (d.watchStatus !== 'synced') { next.comparisonBody.fresh = false; next.comparisonBody.captureId = null; }
      break;
    case 'scaleConnect':
      d.scaleConnected = choice(action.value, ['connected', 'disconnected'], '体組成計の接続') === 'connected';
      d.scaleStatus = 'unread'; d.scaleTime = null; break;
    case 'scaleRead':
      if (!d.scaleConnected) throw new Error('先に体組成計の接続を試してください。');
      d.scaleStatus = choice(action.value, ['synced', 'missing', 'stale'], '体組成データ');
      d.scaleTime = d.scaleStatus === 'synced' ? SCALE_SAMPLE.time : null; break;
    case 'officeExercise':
      if (o.status !== 'ready') throw new Error('次の休憩の例を用意してから変更してください。');
      o.exercise = choice(action.value, Object.keys(OFFICE_EXERCISES), 'ながら運動'); break;
    case 'officeStart':
      if (next.premium.active) throw new Error('時計連動の練習を終了してから、こちらを始めましょう。');
      if (o.status !== 'ready') throw new Error('次の休憩の例を用意してから始めましょう。');
      o.status = 'doing'; o.preview = false; break;
    case 'officeFinish':
      if (o.status !== 'doing') throw new Error('開始した運動だけを完了できます。');
      if (!o.sessions.some(({ id }) => id === o.occurrence)) o.sessions.push({ id: o.occurrence, exercise: o.exercise, sample: true });
      o.status = 'done'; break;
    case 'officeSkip': o.status = 'skipped'; o.preview = false; break;
    case 'officeNext':
      if (o.status === 'doing') throw new Error('いまの運動を終えてから次の休憩へ進みましょう。');
      o.occurrence += 1; o.status = 'ready'; o.preview = false; break;
    case 'reminderSetting': {
      const options = { enabled: ['on', 'off'], days: ['weekdays', 'everyday'], hours: ['9-18', '10-19'], interval: ['30', '60', '90'] };
      if (!Object.hasOwn(options, action.field)) throw new RangeError('不明なリマインダー項目です。');
      const value = choice(action.value, options[action.field], 'リマインダー');
      o.reminders[action.field] = action.field === 'enabled' ? value === 'on' : value;
      o.preview = false; break;
    }
    case 'reminderQuiet': o.reminders.quiet = choice(action.value, ['on', 'off'], '休止') === 'on'; o.preview = false; break;
    case 'reminderSnooze': o.reminders.snoozed = true; o.preview = false; break;
    case 'reminderResume': o.reminders.snoozed = false; o.reminders.quiet = false; o.preview = false; break;
    case 'reminderPreview': o.preview = true; break;
    default: throw new RangeError('不明な機器・ながら運動の操作です。');
  }
  return next;
}
