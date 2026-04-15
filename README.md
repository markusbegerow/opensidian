# Opensidian

<div align="center">

![Tauri](https://img.shields.io/badge/Tauri-2.0-FFC131?style=for-the-badge&logo=tauri&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Rust](https://img.shields.io/badge/Rust-1.70+-CE422B?style=for-the-badge&logo=rust&logoColor=white)
![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-GPL--3.0-blue?style=for-the-badge)

<img alt="opensidian" src="https://github.com/user-attachments/assets/a08e3c9c-39d0-408b-93e3-a6caa95b57fe" />

**A lightweight, open-source desktop note-taking app for power users who think in linked ideas**

[Features](#features) • [Installation](#installation) • [Getting Started](#getting-started) • [Architecture](#architecture) • [Configuration](#configuration)

</div>

---

## Features

### ✏️ Markdown Editor
- **CodeMirror 6** - Full-featured editor with syntax highlighting and one-dark theme
- **Live Preview** - Split view or preview-only mode with rendered markdown
- **Auto-save** - Changes saved automatically with 500ms debounce
- **Keyboard Shortcuts** - `Ctrl+S` to save, `Ctrl+G` for graph view

### 🔗 Wikilinks & Backlinks
- **`[[wikilink]]` Syntax** - Create connections between notes instantly
- **Shortest-path Resolution** - Links resolve by fewest directory segments
- **Backlinks Panel** - See every note that references the current one
- **Live Index** - Vault re-indexed automatically on file changes via `notify` watcher

### 🕸️ Graph View
- **Force-directed Graph** - Visualize your entire knowledge network with D3.js
- **Node Sizing** - Node size scales with inbound link count
- **Interactive** - Pan, zoom, and explore your ideas spatially

### 🤖 AI Chat
- **Context-Aware** - Chat prompt includes your active note plus linked content
- **OpenAI-Compatible** - Works with Ollama, LM Studio, vLLM, or any OpenAI endpoint
- **Persistent History** - Conversation maintained throughout your session

### 📁 File Management
- **File Tree** - Hierarchical sidebar with full CRUD operations
- **Rename / Delete** - Context menu for quick file operations
- **Templates** - Create notes from templates in your `.templates` folder
- **Native Dialogs** - Vault folder picker uses OS-native dialog

---

## Installation

### Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [Rust 1.70+](https://www.rust-lang.org/) with `cargo`
- npm

### Build from Source

```bash
# Clone the repository
git clone https://github.com/markusbegerow/opensidian.git
cd opensidian

# Install dependencies
npm install

# Run in development mode (full Tauri app)
npx tauri dev

# Build for production
npx tauri build
```

### Frontend-only Development

For UI development without the Rust backend:

```bash
npm run dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (frontend only) |
| `npx tauri dev` | Start full Tauri app (frontend + Rust) |
| `npm run build` | Type-check and build frontend |
| `npx tauri build` | Build production desktop app |
| `npm run test` | Run all tests |
| `npx vitest run src/lib/wikilinkParser.test.ts` | Run a single test file |
| `cargo clean` | Clean Rust build artifacts (run inside `src-tauri/`) |

---

## Getting Started

### 1. Open a Vault

A **vault** is any folder on your machine containing markdown files.

1. Launch Opensidian
2. Click **Open Vault** in the sidebar
3. Select your notes folder - Opensidian indexes it automatically

### 2. Create and Link Notes

```markdown
# My Note

This links to [[Another Note]] and [[Project Ideas]].
```

Use `[[double brackets]]` to create wikilinks. Opensidian resolves them by shortest path match across your vault.

### 3. Configure LLM Chat

1. Open the **Chat** panel (right sidebar)
2. Click the settings icon
3. Enter your API URL, model name, and token

```
API URL:   http://localhost:11434   (Ollama)
           http://localhost:1234    (LM Studio)
Model:     llama3.1 / mistral / etc.
Token:     your-api-key (stored locally)
```

---

## Usage Examples

### Explore Your Knowledge Graph

Press `Ctrl+G` to open the graph view. Nodes grow larger the more notes link to them - instantly revealing your most connected ideas.

### Ask AI About Your Notes

Open the chat panel and ask questions. The AI receives your current note, its outbound links, and inbound links as context - so it understands your ideas, not just isolated text.

### Use Templates

```
vault/
├── .templates/
│   ├── meeting.md
│   └── daily-note.md
└── notes/
```

New notes created from a template inherit its structure automatically.

### Color-code Your Graph Nodes

Create a `colors.md` in your vault root:

```markdown
| Emoji | Color     | Label    |
|-------|-----------|----------|
| 🟦    | #74c7ec   | Manager  |
| 🟩    | #a6e3a1   | Employee |
| 🟨    | #f9e2af   | Project  |
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|---------|--------|
| `Ctrl+S` | Save current file |
| `Ctrl+G` | Toggle graph view |
| `Enter` (in chat) | Send message |

---

## Architecture

Opensidian is a [Tauri 2](https://tauri.app/) desktop app: a React/TypeScript frontend communicates with a Rust backend via Tauri IPC. **The Rust layer owns all file I/O** - the frontend never touches the filesystem directly.

```
React UI → Zustand stores → tauriFs.ts (invoke wrappers) → Rust commands → OS filesystem
                                                                 ↓
                                               notify watcher emits vault://changed events
                                                                 ↓
                                               vaultStore listener triggers re-index
```

### Frontend (`src/`)

**Stores (Zustand + Immer)**
| Store | Responsibility |
|-------|---------------|
| `vaultStore.ts` | Vault path, flat file list, file watcher setup |
| `editorStore.ts` | Active file, content, dirty flag, 500ms autosave |
| `wikilinkStore.ts` | `linkMap` (source→targets) and `backlinkMap` (target→sources) |
| `llmStore.ts` | LLM endpoint/model/token (localStorage), chat history |
| `noteEmojiStore.ts` | Per-file emoji and first-heading cache |

**Key Libraries**
- `lib/tauriFs.ts` - all `invoke()` calls to Rust, plus path helpers
- `lib/wikilinkParser.ts` - `[[Target]]` regex extraction and resolution
- `lib/vaultIndexer.ts` - batched indexing in chunks of 20 via `read_files_batch`
- `lib/contextBuilder.ts` - builds LLM system prompt from active note + linked content
- `lib/llmService.ts` - generic fetch to any OpenAI-compatible API

**Components**
- `components/layout/AppShell.tsx` - 3-panel layout (sidebar | editor | backlinks/chat)
- `components/editor/` - `EditorPane`, `CodeMirrorEditor` (CM6 + one-dark), `MarkdownPreview`
- `components/graph/GraphCanvas.tsx` - D3 force simulation
- `components/chat/ChatPanel.tsx` - LLM chat UI

### Backend (`src-tauri/src/`)

| File | Responsibility |
|------|---------------|
| `commands/fs_commands.rs` | `open_vault`, `read_file`, `read_files_batch`, `write_file` (atomic), `delete_file`, `rename_file`, `create_file`, `create_directory` |
| `commands/watcher_commands.rs` | `watch_vault` / `unwatch_vault` using `notify`; emits `vault://changed` events |
| `commands/dialog_commands.rs` | `pick_vault_folder` via tauri-plugin-dialog |
| `lib.rs` | Registers all commands and builds the Tauri app |

### IPC Pattern

Frontend calls Rust with `invoke("command_name", { args })` wrapped in `lib/tauriFs.ts`. File watch events flow back via Tauri's event system (`listen("vault://changed", ...)`). Batch reads (`read_files_batch`) reduce IPC round-trips during vault indexing.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | React 18, TypeScript 5.3, Vite 5 |
| Desktop runtime | Tauri 2, Rust |
| Editor | CodeMirror 6 |
| Styling | Tailwind CSS 3 |
| State management | Zustand 4, Immer 10 |
| Graph | D3.js 7 |
| Markdown | react-markdown, remark-gfm, rehype-highlight |
| File watching | notify (Rust crate) |
| Testing | Vitest |

---

## Project Structure

```
opensidian/
├── src/
│   ├── components/
│   │   ├── layout/       # AppShell (3-panel layout)
│   │   ├── editor/       # CodeMirror editor + markdown preview
│   │   ├── graph/        # D3 force-directed graph
│   │   └── chat/         # LLM chat panel
│   ├── store/            # Zustand stores
│   ├── lib/              # tauriFs, wikilinkParser, vaultIndexer, llmService
│   ├── types/            # VaultFile, FileNode, FsEvent, WikilinkIndex, etc.
│   └── index.css         # Tailwind + theme tokens
├── src-tauri/
│   └── src/
│       ├── commands/     # fs_commands, watcher_commands, dialog_commands
│       └── lib.rs        # Tauri app builder + command registration
└── package.json
```

---

## Troubleshooting

### Windows — SmartScreen warning ("Windows protected your PC")

The installer is not yet code-signed. To proceed: click **More info** → **Run anyway**.

### macOS — "Opensidian cannot be opened" (Gatekeeper warning)

The app is not yet notarized with Apple. To open it anyway:

**Option A — right-click method:** Right-click `Opensidian.app` → **Open** → **Open** in the dialog.

**Option B — terminal:**
```bash
xattr -dr com.apple.quarantine /Applications/Opensidian.app
```

Full notarization (no warning at all) requires an Apple Developer account ($99/year). See the release workflow for how to wire it up once ready.

### Linux

No signing or permission warnings — packages install directly. If the AppImage doesn't launch, mark it executable first: `chmod +x Opensidian_*.AppImage`.

### Vault Not Loading
- Ensure the selected folder contains `.md` files
- Check that Rust permissions allow reading that directory path

### Wikilinks Not Resolving
- Links resolve by **shortest path match** - if two files share a name, the one with fewer parent directories wins
- Rename conflicting files to disambiguate

### LLM Chat Not Responding
- Verify your LLM server is running:
  - Ollama: `curl http://localhost:11434/api/tags`
  - LM Studio: `curl http://localhost:1234/v1/models`
- Check the API URL and model name in the chat settings
- Confirm your API token is correct (or leave blank for local servers)

### Graph View Empty
- Open a vault first, then press `Ctrl+G`
- Graph requires at least one `[[wikilink]]` in your notes to show edges

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the GPL License - see the [LICENSE](LICENSE) file for details.

---

## 🙋‍♂️ Get Involved

If you encounter any issues or have questions:
- 🐛 [Report bugs](https://github.com/markusbegerow/opensidian/issues)
- 💡 [Request features](https://github.com/markusbegerow/opensidian/issues)
- ⭐ Star the repo if you find it useful!

## ☕ Support the Project

If you like this project, support further development with a repost or coffee:

<a href="https://www.linkedin.com/sharing/share-offsite/?url=https://github.com/MarkusBegerow/opensidian" target="_blank"> <img src="https://img.shields.io/badge/💼-Share%20on%20LinkedIn-blue" /> </a>

[![Buy Me a Coffee](https://img.shields.io/badge/☕-Buy%20me%20a%20coffee-yellow)](https://paypal.me/MarkusBegerow)

## 📬 Contact

- 🧑‍💻 [Markus Begerow](https://linkedin.com/in/markusbegerow)
- 💾 [GitHub](https://github.com/markusbegerow)
- ✉️ [Twitter](https://x.com/markusbegerow)

---

**Privacy Notice**: Opensidian operates entirely locally. Your notes never leave your machine. The LLM chat feature only contacts external servers if you explicitly configure a remote API endpoint - by default it connects to local inference servers (Ollama, LM Studio, etc.).
