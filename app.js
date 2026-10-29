const $app = document.getElementById('app');
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const KEY = 'skku-growth-v1';
const TABS = [['dash','대시보드'],['log','3분 기록'],['road','나의 로드맵'],['find','맞춤 공지']];
const blank = () => ({ sem: '2026-1', cat: D.CATEGORIES[0], title: '', S: '', T: '', A: '', R: '', F: '', role: [], tool: [], method: [], trouble: [], tags: [] });

let S = { tab: 'dash', view: 'all', career: '기업 취업', targets: ['#글로벌','#문제의식'], grade: 2,
          retros: [], placed: [], link: {}, drillV: null, sheet: null, draft: blank() };
try { Object.assign(S, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}
const save = () => { try { const { drillV, sheet, ...keep } = S; localStorage.setItem(KEY, JSON.stringify(keep)); } catch (e) {} };

const chip = (act, val, on, extra = '') =>
  `<button class="chip ${on ? 'on' : ''} ${extra}" data-act="${act}" data-val="${esc(val)}" aria-pressed="${on}">${esc(val)}</button>`;

/* ---------- 대시보드 ---------- */
function radar(mine, peer) {
  const c = 150, R = 105, M = 120;
  const pt = (v, i) => { const a = (-90 + 90 * i) * Math.PI / 180, r = R * Math.min(v, M) / M; return [c + r * Math.cos(a), c + r * Math.sin(a)]; };
  const poly = o => VS.map((v, i) => pt(o[v], i).join(',')).join(' ');
  const grid = [.25, .5, .75, 1].map(k => `<polygon points="${VS.map((v, i) => pt(M * k, i).join(',')).join(' ')}" fill="none" stroke="var(--line)"/>`).join('');
  const labels = VS.map((v, i) => { const [x, y] = pt(M * 1.2, i);
    return `<g class="ax" data-act="axis" data-val="${v}"><text x="${x}" y="${y + 4}" text-anchor="middle" font-weight="700">${v} ${mine[v]}</text></g>`; }).join('');
  return `<svg viewBox="0 0 300 300" role="img" aria-label="인의예지 레이더 차트" width="100%" style="max-width:340px">${grid}
    <polygon points="${poly(peer)}" fill="none" stroke="var(--gold)" stroke-width="2" stroke-dasharray="5 4"/>
    <polygon points="${poly(mine)}" fill="var(--g)" fill-opacity=".25" stroke="var(--g)" stroke-width="2.5"/>${labels}</svg>`;
}

function dash() {
  const total = scores(S.retros), mine = scores(S.retros, S.view), car = D.CAREERS[S.career];
  const sems = [...new Set(S.retros.map(r => r.sem))].sort();
  const per = persona(total);
  const w = weakest(total, S.career);
  const rec = D.NOTICES.filter(n => n.tags.some(t => D.TAG2V[t] === w.v)).slice(0, 2);
  const bars = VS.map(v => {
    const L = levelOf(total[v]), mx = gaugeMax(S.career, v, S.view), core = car.core.includes(v);
    return `<div class="vrow"><b>${v}</b> Lv.${L.lv} ${L.name} ${core ? '<span class="sub">· 목표 역량</span>' : ''}
      <div class="bar ${core ? 'core' : ''}" role="progressbar" aria-valuenow="${mine[v]}" aria-valuemax="${mx}"><i style="width:${Math.min(100, mine[v] / mx * 100)}%"></i></div>
      <span class="sub">${mine[v]} / ${mx}pt</span></div>`; }).join('');
  const drill = S.drillV ? (() => {
    const cnt = {}; S.retros.filter(r => S.view === 'all' || r.sem === S.view)
      .forEach(r => r.tags.filter(t => D.TAG2V[t] === S.drillV).forEach(t => cnt[t] = (cnt[t] || 0) + 1));
    const list = Object.entries(cnt).map(([t, n]) => `<button class="chip" data-act="tag" data-val="${t}">${t} (${n}건)</button>`).join('');
    return `<section><h2>${S.drillV}(仁·義·禮·智) 세부 태그</h2>${list || '<p class="sub">이 구간에는 아직 기록이 없어요. 3분 기록 탭에서 첫 회고를 남겨보세요.</p>'}</section>`; })() : '';
  const sheet = S.sheet ? `<div class="sheet"><div class="row"><h2>${S.sheet} 회고 모음</h2><button class="btn ghost" data-act="close">닫기</button></div>
    ${S.retros.filter(r => r.tags.includes(S.sheet)).map(r => `<p><b>[${r.sem}/${esc(r.cat)}] ${esc(r.title)}</b><br>
    <span class="sub">S</span> ${esc(r.S)} · <span class="sub">T</span> ${esc(r.T)}<br><span class="sub">A</span> ${esc(r.A)}<br>
    <span class="sub">R</span> ${esc(r.R)}<br><span class="sub">성찰</span> ${esc(r.F)}</p>`).join('')}</div>` : '';
  return `${per ? `<div class="persona">🏆 ${per}</div>` : '<div class="persona">두 가치가 Lv.3에 닿으면 나만의 페르소나 칭호가 열려요</div>'}
  <section><div class="row">
    <select data-act="view" aria-label="보기 기간"><option value="all">전체 누적</option>${sems.map(s => `<option ${S.view === s ? 'selected' : ''}>${s}</option>`).join('')}</select>
    <select data-act="career" aria-label="목표 진로">${Object.keys(D.CAREERS).map(c => `<option ${c === S.career ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
    <div class="grid"><div>${radar(mine, car.peer)}<p class="sub">실선: 나 · 점선: 같은 진로 학우 평균(예시값) · 축을 눌러 태그 보기</p></div><div>${bars}</div></div></section>
  ${drill}
  <section><h2>보완하면 좋은 가치: ${w.v}</h2><div class="rec">${rec.map(n => `${esc(n.title)} / ${n.tags.filter(t => D.TAG2V[t] === w.v).join(' ')}`).join('<br>') || '추천할 공지가 아직 없어요.'}</div></section>${sheet}`;
}

/* ---------- 3분 기록 ---------- */
function logTab() {
  const d = S.draft, chips = new Set([...d.role, ...d.tool, ...d.method, ...d.trouble]);
  const sug = suggest(chips), sugTags = new Set(sug.flatMap(s => s.tags));
  const grp = (k, label) => `<label>${label}</label>${D.CHIPS[k].map(c => chip('chip:' + k, c, d[k].includes(c))).join('')}`;
  const ta = (k, label, hint, req) => `<label>${label} ${req ? '' : '<small>(선택)</small>'}</label><textarea rows="2" data-f="${k}" placeholder="${hint}">${esc(d[k])}</textarea>`;
  return `<section><h2>3분 키워드 태그 기록</h2>
  <div class="row"><input data-f="sem" value="${esc(d.sem)}" aria-label="학기" placeholder="학기 (예: 2026-1)">
  <select data-f="cat" aria-label="활동 분류">${D.CATEGORIES.map(c => `<option ${c === d.cat ? 'selected' : ''}>${c}</option>`).join('')}</select>
  <input data-f="title" value="${esc(d.title)}" aria-label="활동 이름" placeholder="과목 / 활동 이름"></div>
  ${ta('S', '상황 (S)', '어떤 계기로 참여하게 되었나요?', 0)}${ta('T', '과제 (T)', '해결해야 했던 핵심 문제는?', 0)}
  ${ta('A', '행동 (A)', '본인이 맡은 구체적 행동과 사용한 툴은?', 1)}${ta('R', '성과 (R)', '결과물이나 수치는?', 1)}${ta('F', '성찰', '다음에 적용할 점은?', 1)}
  ${grp('role', '역할 (최대 3개)')}${grp('tool', '도구')}${grp('method', '방법론')}${grp('trouble', '문제해결 (최대 2개)')}
  <label>성균 가치 태그 <small>(가치별 최대 3개 · 1개당 +${D.PT}pt)</small></label>
  ${sug.length ? `<p class="rec">추천: ${sug.map(s => s.v + ' ' + s.tags.join(' ')).join(' / ')} <button class="btn ghost" data-act="applysug">추천 태그 적용</button></p>` : ''}
  ${VS.map(v => `<div><b>${v}</b> ${D.VALUES[v].map(t => chip('chip:tags', t, d.tags.includes(t), sugTags.has(t) ? 'sug' : '')).join('')}</div>`).join('')}
  <p><button class="btn" data-act="savelog">회고 저장</button> <span class="sub">행동·성과·성찰과 태그 1개 이상이 필요해요.</span></p></section>
  <section><h2>저장된 회고 ${S.retros.length}건</h2>${S.retros.slice().reverse().map(r => `<p>[${r.sem}/${esc(r.cat)}] <b>${esc(r.title)}</b> <span class="sub">${r.tags.join(' ')}</span></p>`).join('') || '<p class="sub">아직 기록이 없어요.</p>'}</section>`;
}

/* ---------- 로드맵 ---------- */
function road() {
  const byId = id => S.retros.find(r => r.id == id);
  const unplaced = S.retros.filter(r => !S.placed.includes(r.id));
  const sems = [...new Set(S.placed.map(id => byId(id)?.sem))].filter(Boolean).sort();
  const card = id => {
    const r = byId(id), L = S.link[id] || { type: 'solid', next: '' }, nx = L.next && byId(L.next);
    const hl = r.tags.filter(t => S.targets.includes(t)).length >= 2;
    return `<div class="card ${L.type === 'dashed' ? 'dashed' : ''} ${hl ? 'hl' : ''}"><b>${esc(r.title)}</b> <span class="sub">${esc(r.cat)}</span><br>${r.tags.join(' ')}
      <div class="row"><select data-act="ltype" data-id="${id}" aria-label="연결 유형"><option value="solid" ${L.type === 'solid' ? 'selected' : ''}>실선: 핵심 경로</option><option value="dashed" ${L.type === 'dashed' ? 'selected' : ''}>점선: 시너지</option></select>
      <select data-act="lnext" data-id="${id}" aria-label="후속 활동"><option value="">후속 활동 없음</option>${S.placed.filter(p => p !== id).map(p => `<option value="${p}" ${L.next == p ? 'selected' : ''}>${esc(byId(p).title)}</option>`).join('')}</select></div>
      ${nx ? `<div class="story">[${esc(r.title)}]를 통해 [${r.tags[0] || '역량'}] 역량을 얻고, [${esc(nx.title)}]으로 확장되었습니다.</div>` : ''}</div>`; };
  const tl = S.targets.map(t => `<p><b>■ ${t}</b></p>` + S.retros.filter(r => r.tags.includes(t)).sort((a, b) => a.sem.localeCompare(b.sem))
    .map(r => `<p style="margin-left:14px">└ [${r.sem} / ${esc(r.cat)} / ${esc(r.title)}] ${r.tags.join(' ')}</p>`).join('')).join('');
  return `<section><h2>목표 역량 태그</h2>${D.ALL_TAGS.map(t => chip('target', t, S.targets.includes(t))).join('')}</section>
  <section><h2>나만의 로드맵 · ${S.career}</h2><p class="sub">회고에서 활동을 골라 배치하면 학기 화살표 위에 놓여요. 목표 태그를 2개 이상 가진 활동은 강조됩니다.</p>
  <div>${unplaced.map(r => `<button class="chip" data-act="place" data-val="${r.id}">+ [${r.sem}] ${esc(r.title)}</button>`).join('') || '<span class="sub">배치할 활동이 없어요.</span>'}</div>
  <div class="cols">${sems.map(s => `<div class="col"><h3>${s}</h3>${S.placed.filter(id => byId(id)?.sem === s).map(card).join('')}</div>`).join('')}</div></section>
  <section><h2>목표 역량별 타임라인</h2>${tl || '<p class="sub">목표 태그를 골라보세요.</p>'}</section>`;
}

/* ---------- 탐색기 ---------- */
function find() {
  const list = feed(S.grade, S.targets);
  return `<section><div class="row"><select data-act="grade" aria-label="학년">${[1,2,3,4].map(g => `<option value="${g}" ${g == S.grade ? 'selected' : ''}>${g}학년</option>`).join('')}</select>
  <span class="sub">목표 태그(${S.targets.join(' ')})와 맞는 공지가 위로, 이후 마감 임박순이에요.</span></div>
  ${list.map(n => `<div class="notice"><div><b>${n.match ? '★ ' : ''}${esc(n.title)}</b><br><span class="sub">${n.src} · ${n.tags.join(' ')}</span></div><span class="dd">D-${dday(n.dd)}</span></div>`).join('')}</section>`;
}

/* ---------- 렌더 & 이벤트 ---------- */
function render() {
  document.getElementById('tabs').innerHTML = TABS.map(([k, n]) => `<button class="${S.tab === k ? 'on' : ''}" data-act="tab" data-val="${k}">${n}</button>`).join('');
  $app.innerHTML = { dash, log: logTab, road, find }[S.tab]();
  save();
}
const toggle = (arr, v, max) => { const i = arr.indexOf(v); if (i >= 0) arr.splice(i, 1); else if (!max || arr.length < max) arr.push(v); };

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el || el.tagName === 'SELECT') return;
  const [act, grp] = el.dataset.act.split(':'), val = el.dataset.val, d = S.draft;
  if (act === 'tab') S.tab = val;
  else if (act === 'axis') { S.drillV = val; S.sheet = null; }
  else if (act === 'tag') S.sheet = val;
  else if (act === 'close') S.sheet = null;
  else if (act === 'chip') {
    if (grp === 'tags') { const same = d.tags.filter(t => D.TAG2V[t] === D.TAG2V[val]); if (!d.tags.includes(val) && same.length >= 3) return; toggle(d.tags, val); }
    else toggle(d[grp], val, D.LIMIT[grp]);
  }
  else if (act === 'applysug') suggest(new Set([...d.role, ...d.tool, ...d.method, ...d.trouble])).forEach(s => s.tags.forEach(t => { if (!d.tags.includes(t)) d.tags.push(t); }));
  else if (act === 'savelog') {
    if (!d.A.trim() || !d.R.trim() || !d.F.trim() || !d.title.trim() || !d.tags.length) return alert('활동 이름, 행동(A), 성과(R), 성찰, 태그 1개 이상을 채워주세요.');
    S.retros.push({ ...d, id: Date.now() }); S.draft = { ...blank(), sem: d.sem }; S.tab = 'dash'; S.view = 'all';
  }
  else if (act === 'target') toggle(S.targets, val);
  else if (act === 'place') S.placed.push(+val);
  render();
});
document.addEventListener('change', e => {
  const el = e.target, act = el.dataset.act; if (!act) { if (el.dataset.f) S.draft[el.dataset.f] = el.value; return; }
  const id = +el.dataset.id;
  if (act === 'view') S.view = el.value;
  else if (act === 'career') S.career = el.value;
  else if (act === 'grade') S.grade = +el.value;
  else if (act === 'ltype') S.link[id] = { ...(S.link[id] || {}), type: el.value };
  else if (act === 'lnext') S.link[id] = { type: 'solid', ...(S.link[id] || {}), next: el.value };
  render();
});
document.addEventListener('input', e => { if (e.target.dataset.f) { S.draft[e.target.dataset.f] = e.target.value; save(); } });
render();
