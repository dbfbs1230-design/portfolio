# GitHub 루트 배포용 경로 변경 기록

## 최종 구조

메인 폴더의 루트 파일은 `index.html` 하나입니다. CSS, JavaScript, 이미지, 문서, 개발용 도구는 각각 폴더에 들어 있습니다.
기존 v2에서 페이지 내용·디자인·동작은 바꾸지 않고 배포 및 개발 경로를 정리했습니다.

- `dist/index.html` → `index.html`
- `dist/css/` → `css/`
- `dist/js/` → `js/`
- `dist/assets/` → `assets/`
- `scripts/serve.mjs` → `tools/serve.mjs`
- `tests/` → `tools/tests/`
- 안내 문서 → `docs/`
- 루트 npm 설정을 제거하고 Node 모듈 타입 설정만 `js/package.json`으로 이동

로컬 서버는 메인 폴더를 기준으로 서비스하도록 수정했고, 테스트의 import와 이미지·HTML 조회 경로도 함께 변경했습니다.
사이트 코드의 `./css/`, `./js/`, `./assets/` 참조는 새 index.html과 같은 메인 폴더를 기준으로 연결됩니다.
GitHub 프로젝트 주소의 `/저장소이름/` 경로에서도 사이트 루트를 벗어나지 않도록 상대 경로를 유지했습니다.
기존 Sites 계정 연결 파일, 인증 정보, Git 저장소 메타데이터는 이 전달본에 포함하지 않았습니다.

## 검사

- 기존 데이터·필터·번역·이미지·상태 검사 6개 통과
- index.html 단일 루트 파일과 폴더 구조 검사 통과
- 저장소 하위 URL 기준 HTML 참조와 JS 모듈 import 경로 검사 통과
- ZIP 무결성 확인 및 압축 해제 후 동일 검사 재실행

이번 변경은 경로 정리이며 새로운 화면 변경은 없습니다. v2의 브라우저 검토 기록은 `V2-REVIEW.md`에 보관했습니다.
GitHub 원격 업로드 및 실제 Pages 배포는 수행하지 않았습니다. 실제 배포 주소는 저장소 설정 후 확인해야 합니다.
