// 순수 계산 로직 (UI와 분리 → 테스트하기 쉬움)
const VS = ['인','의','예','지'];

function scores(retros, view = 'all') {
  const o = { 인: 0, 의: 0, 예: 0, 지: 0 };
  retros.filter(r => view === 'all' || r.sem === view)
        .forEach(r => r.tags.forEach(t => { const v = D.TAG2V[t]; if (v) o[v] += D.PT; }));
  return o;
}
const levelOf = p => { const l = D.LEVELS.find(x => p >= x[0]); return { lv: l[1], name: l[2] }; };

function persona(total) {
  const hit = D.PERSONAS.find(p => p.need.every(v => levelOf(total[v]).lv >= p.min));
  return hit ? hit.name : null;
}
// 이 가치가 진로의 핵심 역량이면 게이지 최대치가 더 크다
function gaugeMax(career, v, view) {
  const core = D.CAREERS[career].core.includes(v);
  return (view === 'all' ? D.MAX : D.SEM_MAX)[core ? 'core' : 'normal'];
}
// 선택한 칩 조합 → 추천 태그
function suggest(chipSet) {
  return D.AUTO.filter(a => a.need.every(n => chipSet.has(n)));
}
// 또래 평균 대비 격차가 가장 큰 가치
function weakest(total, career) {
  const peer = D.CAREERS[career].peer;
  return VS.map(v => ({ v, gap: peer[v] - total[v] })).sort((a, b) => b.gap - a.gap)[0];
}
const dday = n => Math.max(0, n);
function feed(grade, targets) {
  return D.NOTICES
    .filter(n => n.grade.includes(0) || n.grade.includes(grade))
    .map(n => ({ ...n, match: n.tags.some(t => targets.includes(t)) }))
    .sort((a, b) => (b.match - a.match) || (a.dd - b.dd));
}
