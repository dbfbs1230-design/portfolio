# Son YuRyun Portfolio — GitHub Pages용

메인 폴더의 유일한 루트 파일은 `index.html`입니다. 나머지는 각각의 폴더에 있습니다.
기존 v2의 화면과 12개 더미 작업을 유지하고, 배포 및 유지보수 경로를 루트 기준으로 정리했습니다.

## 폴더 구조

```text
son-yuryun-portfolio-github/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── app.js
│   ├── package.json
│   ├── data/
│   │   ├── projects.js
│   │   └── site.js
│   └── lib/
│       └── model.js
├── assets/
│   └── images/
├── docs/
│   ├── README.md
│   ├── REVIEW.md
│   └── V2-REVIEW.md
└── tools/
    ├── serve.mjs
    └── tests/
        ├── model.test.mjs
        └── paths.test.mjs
```

`js/package.json`은 로컬 Node 검사에서 JavaScript 파일을 ES 모듈로 인식시키는 작은 설정 파일입니다. 브라우저 배포에 패키지 설치는 필요 없습니다.

## GitHub 업로드 및 배포

1. ZIP을 압축 해제하고 메인 폴더를 엽니다.
2. **메인 폴더 안의 `index.html`과 나머지 폴더들을 모두** GitHub 저장소 최상위에 업로드합니다. 메인 폴더 자체를 한 단계 더 넣지 않습니다.
3. 저장소 최상위에서 `index.html`, `css`, `js`, `assets` 등이 바로 보이는지 확인합니다.
4. 저장소의 `Settings → Pages`에서 Source를 `Deploy from a branch`로 선택합니다.
5. 업로드한 브랜치(예: `main`)와 `/(root)`를 선택하고 저장합니다.
6. GitHub에서 배포가 완료되면 Pages에 표시되는 주소를 엽니다.

별도 빌드나 npm 설치가 필요 없습니다. 저장소에 올리는 것 외에 위의 Pages 설정은 한 번 필요합니다.
직접 GitHub 업로드나 배포는 이번 작업에 포함하지 않았습니다.

GitHub 공식 안내: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

`/저장소이름/` 하위 주소에서도 동작하도록 HTML, CSS, JavaScript, 이미지 참조에 상대 경로를 사용했습니다.
배포 폴더는 `docs`가 아닌 **저장소 루트**입니다. 이 프로젝트의 `docs`는 사용 안내용 폴더입니다.

## 작업 수정 위치

| 수정 내용 | 파일 |
| --- | --- |
| 메인 페이지 구조 | `index.html` |
| 색상·글꼴·여백·반응형 | `css/styles.css` |
| 프로젝트명·설명·역할·과정·이미지 | `js/data/projects.js` |
| 국문/영문 공통 문구·분류·프로필 | `js/data/site.js` |
| 화면 동작 | `js/app.js` |
| 필터·URL·데이터 검사 | `js/lib/model.js` |
| 실제 이미지 | `assets/images/` |

작업을 추가할 때는 고유한 `id`와 카테고리(`fashion`, `illustration`, `digital`)를 지정하고 국문/영문 내용을 함께 작성합니다.
`images`의 첫 항목이 표지이고, 전체 이미지가 상세 보기에 표시됩니다.
이미지 경로는 `./assets/images/파일명.webp`처럼 **index.html 기준**입니다.
JavaScript 파일이 있는 `js/data` 폴더를 기준으로 이미지 경로를 적지 않습니다.
파일명 대소문자를 정확히 맞춥니다. `/assets/...`처럼 맨 앞에 `/`를 붙이지 않습니다.

실제 작업으로 교체한 경우 `demo`를 `false`로 바꾸고 `year`에 실제 제작 연도를 입력합니다.
카테고리별 개수와 상세 보기 순서는 데이터에서 자동으로 계산됩니다.
모든 더미 작업을 교체하면 `site.js`의 예시 안내 문구도 수정합니다.

## 로컬 실행 및 검사

Node.js 20 이상이 설치되어 있으면 **메인 폴더에서** 다음을 실행합니다.

```sh
node tools/serve.mjs
```

`http://127.0.0.1:4173/`에서 확인합니다. 종료는 Ctrl+C입니다.
포트가 사용 중이면 macOS/Linux에서 `PORT=4174 node tools/serve.mjs`로 실행합니다.

검사:

```sh
node --test tools/tests/*.test.mjs
```

index.html 더블클릭 시 파일 자체는 열리지만, JavaScript 모듈은 브라우저 보안 정책 때문에 제한될 수 있습니다. 전체 기능은 로컬 서버 또는 GitHub Pages 주소에서 확인합니다.

## 기타

- Pretendard는 버전이 고정된 CDN에서 불러오며, 연결 불가 시 시스템 글꼴로 대체됩니다.
- 실제 연락처, 수상, 전시 이력은 입력 전 상태입니다.
- CSS, JS, 이미지 경로를 옮길 경우 `tools/tests/paths.test.mjs`도 실행해 확인합니다.
- 기존 v2 폴더와 ZIP은 그대로 보관되어 있습니다.
