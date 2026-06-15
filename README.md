# ShellScape

A lightweight desktop terminal with custom backgrounds — images, videos, and GIFs. Built with Tauri 2 + React + xterm.js.

## Features

- **Custom backgrounds** — static images (PNG/JPG), videos (MP4/WebM), animated GIFs
- **Auto-hiding UI** — toolbar and tab bar auto-hide like Windows taskbar; move mouse to edge to reveal
- **Real terminal** — Powershell via ConPTY, with full input/output support
- **Fill modes** — cover, contain, stretch, or center your background
- **Opacity control** — adjust terminal transparency independently
- **Color themes** — Dracula, Nord, One Dark, and more
- **Keyboard shortcuts** — Alt to temporarily show UI, Ctrl+Shift+L to pin toolbar

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Window / PTY | Tauri 2 (Rust) |
| Frontend | React 19 + TypeScript |
| Terminal | xterm.js 6 |
| Styling | Tailwind CSS 4 + Framer Motion 12 |
| State | Zustand 5 |

## Development

```bash
# Prerequisites
# - Rust: https://rustup.rs
# - Node.js 18+: https://nodejs.org

# Install dependencies
npm install

# Start dev server + Tauri window
npm run tauri dev

# Build for production
npm run tauri build
```

## License

MIT
