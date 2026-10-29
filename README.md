성균 성장노트

3분 STAR 회고 → 인·의·예·지 역량 진단 → 진로 로드맵 → 맞춤 공지까지 잇는 학생성공 앱 (프로토타입).

실행

빌드 도구 없이 정적 파일만으로 동작합니다.

bash
python3 -m http.server 8000   # http://localhost:8000

GitHub Pages: Settings → Pages → Branch main / root 선택하면 바로 배포됩니다.

구조
파일	역할
js/data.js	태그·레벨·페르소나·진로·샘플 공지 등 규칙 데이터 (여기만 고치면 정책 변경)
js/logic.js	점수 산출, 레벨, 페르소나, 갭 분석, 공지 정렬 (순수 함수)
js/app.js	4개 탭 UI와 이벤트, localStorage 저장
구현된 것 / 다음 단계
구현: 3분 기록(STAR·칩·자동 추천), 학기별/누적 대시보드, 레이더, 드릴다운, 갭 추천, 로드맵(실선/점선·후속활동·스토리 문구), 공지 피드
다음: 서버·DB(Activities, 학우 평균), 로그인, 드래그앤드롭 캔버스, 공지 크롤링/연동
