# Context Notes

- 2026-05-22: User requested a new WebP pack `arca-51385` with files `001.webp` through `093.webp`.
- 2026-05-22: Existing `arca-e-001` GIF pack, `R2_BASE_URL`, and `PIN_HASH` must stay unchanged.
- 2026-05-22: Current card and modal URL creation already accepts any file extension through `sticker.file`, but display text currently reads `sticker.name`.
- 2026-05-22: New `arca-51385` stickers use `title` instead of `name`, so card, modal, and search should read `title` with existing `name` fallback.
- 2026-05-22: Local validation passed, but direct R2 GET checks for `arca-51385/001.webp` and `arca-51385/093.webp` returned 404 with the unchanged base URL.
- 2026-05-22: User requested renaming the WebP pack from `arca-51385` to `lumicon`, with R2 paths under `lumicon/` and initial selection set to the Lumicon pack.
- 2026-05-22: Local UI verification showed Lumicon active by default with 93 cards, and the old `arca-e-001` pack still selectable with 124 cards. R2 GET returned 200 for `lumicon/001.webp` and 404 for `lumicon/093.webp`.
