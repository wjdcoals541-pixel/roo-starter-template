# GIF창고

Vanilla JavaScript와 Vite로 만든 GIF 스티커 갤러리입니다. Cloudflare R2에 업로드된 GIF를 불러오고, pack 탐색, 검색, 즐겨찾기, 최근 사용, 자주 사용, 확대보기 모달, 공개 URL 복사를 제공합니다.

## 로컬 실행법

```cmd
npm install
npm run dev
```

브라우저에서 Vite가 출력한 로컬 주소를 엽니다. 기본 개발 주소는 보통 `http://localhost:5173`입니다.

## 빌드

```cmd
npm run build
npm run preview
```

`npm run build`는 정적 배포 파일을 `dist/`에 생성합니다.

## Cloudflare Pages 배포 설정

Cloudflare Pages에서 Git 저장소를 연결한 뒤 아래 값으로 설정합니다.

```text
Framework preset: Vite
Build command: npm run build
Build output directory: dist
```

## R2_BASE_URL 설정

GIF 파일은 `R2_BASE_URL + "/" + sticker.file` 규칙으로 로드됩니다.

현재 설정값입니다.

```js
export const R2_BASE_URL =
  'https://pub-89e483c547674bcf9a18fa2ecf3468c7.r2.dev';
```

현재 GIF는 R2 bucket 루트에 있으므로 `sticker.file`은 `001.gif`, `002.gif` 같은 상대 경로만 사용합니다. `R2_BASE_URL` 끝에는 마지막 슬래시를 넣지 않습니다.

## PIN_HASH 설정

PIN 게이트는 입력값의 SHA-256 해시를 [src/constants.js](src/constants.js)의 `PIN_HASH`와 비교합니다. 원문 PIN은 코드와 문서에 저장하지 않습니다.

현재 설정값입니다.

```js
export const PIN_HASH =
  '2fb451f9569989e892ced96048464d6739285a0a5fe00a1a12c47e9d3af93762';
```

PIN 게이트는 강한 인증 수단이 아니라 캐주얼 접근 제한용입니다.

## 현재 pack 데이터

```text
pack id: arca-e-001
pack name: 구구가가
emoji: 💬
files: 001.gif ~ 124.gif
```

## 관리 명령

```cmd
npm run add-pack -- <pack-id> <name> <emoji> <local-folder-path>
npm run check-urls
npm run find-duplicates
```

pack 추가 흐름은 [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)를 따릅니다. 실제 비밀값이나 API 키는 커밋하지 않습니다.
