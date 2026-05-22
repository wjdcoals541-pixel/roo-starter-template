# gif-sticker-gallery

Vanilla JavaScript와 Vite로 만든 GIF 스티커 갤러리입니다. 스티커 묶음별 탐색, 검색, 즐겨찾기, 최근 사용, 자주 사용, 확대보기 모달, URL 복사를 제공합니다.

## 로컬 실행법

```cmd
npm install
npm run dev
```

브라우저에서 Vite가 출력한 로컬 주소를 엽니다. 기본 개발 주소는 보통 `http://localhost:5173`입니다.

## 빌드와 배포

```cmd
npm run build
npm run preview
```

`npm run build`는 정적 파일을 `dist/`에 생성합니다. 배포할 때는 `dist/` 폴더를 정적 호스팅 서비스에 업로드합니다.

## R2_BASE_URL 설정

스티커 GIF는 `R2_BASE_URL + sticker.file` 규칙으로 로드됩니다.

1. Cloudflare R2 버킷이나 공개 도메인을 준비합니다.
2. GIF 파일을 `pack-id/file.gif` 구조로 업로드합니다.
3. [src/constants.js](src/constants.js)의 `R2_BASE_URL`을 공개 베이스 URL로 바꿉니다.

예시입니다.

```js
export const R2_BASE_URL = 'https://example.r2.dev';
```

실제 비밀값이나 API 키는 코드에 넣지 않습니다.

## PIN_HASH 설정

PIN 게이트는 입력한 PIN의 SHA-256 해시를 [src/constants.js](src/constants.js)의 `PIN_HASH`와 비교합니다. 강한 인증이 아니라 캐주얼 접근 제한 용도입니다.

브라우저 콘솔이나 Node.js에서 PIN 해시를 만들 수 있습니다.

```js
const pin = '1234';
const bytes = new TextEncoder().encode(pin);
const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
const hash = [...new Uint8Array(hashBuffer)]
  .map((byte) => byte.toString(16).padStart(2, '0'))
  .join('');
console.log(hash);
```

생성된 해시만 `PIN_HASH`에 넣습니다. 원본 PIN은 커밋하지 않습니다.

## 관리 명령

```cmd
npm run add-pack -- <pack-id> <name> <emoji> <local-folder-path>
npm run check-urls
npm run find-duplicates
```

pack 추가 흐름은 [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)를 따릅니다.
