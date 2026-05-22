# Contributing

이 문서는 새 GIF pack을 수집하고 `gif-sticker-gallery`에 추가하는 절차입니다. 실제 비밀값, API 키, 비공개 토큰은 문서나 코드에 쓰지 않습니다.

## arca.live에서 GIF 묶음 수집

1. arca.live에서 추가할 스티커 묶음을 찾습니다.
2. 사용 가능한 GIF만 내려받습니다.
3. 원본 출처, 사용 조건, 재배포 가능 여부를 확인합니다.
4. 같은 의미의 중복 GIF나 깨진 파일은 제외합니다.
5. 파일 이름은 사람이 알아볼 수 있는 짧은 영어 이름으로 정리합니다.

## 로컬 폴더 정리 규칙

pack마다 하나의 폴더를 사용합니다.

```text
assets/
  funny-cats/
    happy.gif
    sleepy.gif
    surprised.gif
```

규칙입니다.

- 폴더명은 `pack-id`와 같게 합니다.
- `pack-id`는 소문자, 숫자, 하이픈만 사용합니다.
- GIF 파일명도 소문자, 숫자, 하이픈 중심으로 정리합니다.
- 파일 확장자는 `.gif`를 사용합니다.
- 같은 폴더 안에서 비슷한 이름과 같은 내용의 GIF를 제거합니다.

## R2 업로드 방법

1. Cloudflare R2 버킷을 준비합니다.
2. pack 폴더를 버킷에 업로드합니다.
3. 업로드 경로는 `pack-id/file.gif` 형태를 유지합니다.
4. 공개 접근 URL을 확인합니다.
5. [src/constants.js](../src/constants.js)의 `R2_BASE_URL`이 해당 공개 URL과 맞는지 확인합니다.

예시 경로입니다.

```text
https://example.r2.dev/funny-cats/happy.gif
```

이 경우 `gifs.json`의 `file` 값은 다음처럼 저장합니다.

```json
"file": "funny-cats/happy.gif"
```

## gifs.json 추가 규칙

[src/data/gifs.json](../src/data/gifs.json)은 `packs`와 `stickers` 배열을 사용합니다.

pack 예시입니다.

```json
{
  "id": "funny-cats",
  "name": "Funny Cats",
  "emoji": "🐱"
}
```

sticker 예시입니다.

```json
{
  "id": "funny-cats-happy",
  "pack": "funny-cats",
  "name": "Happy",
  "file": "funny-cats/happy.gif"
}
```

규칙입니다.

- `pack` 값은 반드시 존재하는 pack `id`와 같아야 합니다.
- `sticker.id`는 전체 데이터에서 고유해야 합니다.
- `sticker.file`은 `pack-id/file.gif` 형식이어야 합니다.
- URL 전체를 저장하지 말고 `file` 경로만 저장합니다.
- 제목이 같은 스티커를 여러 개 만들지 않습니다.

## 관리 스크립트 사용법

새 pack을 추가합니다.

```cmd
npm run add-pack -- funny-cats "Funny Cats" "🐱" ./assets/funny-cats
```

이 명령은 폴더 안의 `.gif` 파일을 읽어 `src/data/gifs.json`에 pack과 sticker 항목을 추가합니다. 기존 pack id나 sticker id와 충돌하면 중단합니다.

중복을 검사합니다.

```cmd
npm run find-duplicates
```

R2 URL 접근을 검사합니다.

```cmd
npm run check-urls
```

마지막으로 앱 빌드를 확인합니다.

```cmd
npm run build
```

권장 흐름입니다.

1. arca.live에서 GIF를 수집합니다.
2. 로컬 pack 폴더를 정리합니다.
3. R2에 `pack-id/file.gif` 구조로 업로드합니다.
4. `npm run add-pack -- <pack-id> <name> <emoji> <local-folder-path>`를 실행합니다.
5. `npm run find-duplicates`를 실행합니다.
6. `npm run check-urls`를 실행합니다.
7. `npm run build`를 실행합니다.
