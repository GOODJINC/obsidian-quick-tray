# Quick Tray

[English](README.md) | [한국어](README.ko.md)

Quick Tray는 Obsidian을 시스템 트레이에서 계속 사용할 수 있게 하고, 빠른 노트와 빠른 검색 기능을 추가하는 데스크톱 전용 플러그인입니다.

## 기능

- Obsidian을 종료하지 않고 트레이로 숨깁니다.
- 트레이 메뉴에서 Obsidian 열기, 숨기기, 재실행, 종료를 실행합니다.
- 트레이 또는 전역 단축키로 빠른 노트를 작성합니다.
- 트레이 또는 전역 단축키로 Obsidian 검색 또는 빠른 전환기를 엽니다.
- 트레이 아이콘 왼쪽 클릭 동작을 선택할 수 있습니다.
- 빠른 노트 위치, 이름 규칙, 단축키, 트레이 아이콘을 설정할 수 있습니다.
- 기본 언어는 영어이며, Obsidian 언어가 한국어일 때 한국어로 표시됩니다.

## 기본 단축키

- 빠른 노트: `Ctrl+Shift+Q`
- 빠른 검색: `Ctrl+Shift+K`
- Obsidian 열기/숨기기: `Ctrl+Shift+O`

## 빠른 노트 이름 토큰

- `{{date}}`: `YYYY-MM-DD`
- `{{time}}`: `HH-mm`
- `{{timestamp}}`: `YYYYMMDDHHmmss`
- `{{title}}`: 노트 제목

## 수동 설치

1. `npm install`을 실행합니다.
2. `npm run build`를 실행합니다.
3. `main.js`, `manifest.json`, `styles.css`를 아래 폴더에 복사합니다.

```text
VaultFolder/.obsidian/plugins/quick-tray/
```

4. Obsidian 커뮤니티 플러그인에서 `Quick Tray`를 활성화합니다.

## 참고

트레이와 OS 전역 단축키는 Electron 데스크톱 API에 의존합니다. 사용 중인 Obsidian 빌드에서 해당 API를 사용할 수 없으면 Quick Tray 명령은 명령 팔레트에서만 사용할 수 있습니다.

기본 트레이 이미지는 Obsidian에서 사용하기 위한 Obsidian 아이콘입니다. Obsidian 로고의 권리는 Obsidian 프로젝트에 있습니다.
