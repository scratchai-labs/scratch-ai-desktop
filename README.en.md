# Scratch AI Coach

`Scratch AI Coach` networked desktop client is an open source companion app for `Scratch Desktop`. It does not modify the upstream Scratch source code. Instead, it launches Scratch in a controlled way, injects a read-only bridge, renders real Scratch-style blocks, and reads next-step hints from the teaching server based on the learner's current project.

This repository is the split-out **networked desktop client** repo.
Cross-repo docs, architecture notes, and planning now live in [`scratch-ai-docs`](https://github.com/scratchai-labs/scratch-ai-docs/blob/main/README.en.md).

## Why This Project Exists

Scratch helped many people fall in love with computers for the first time. Since Scratch itself is open source, this project is being organized as a long-term open source repository too, so teachers, learners, and contributors can use it, review it, and evolve it in public.

## Current Scope

- The maintained product line is the **networked desktop edition**
- Supported platforms: **Windows** and **macOS**
- The current workflow is “launch Scratch Desktop from the companion app, then attach a read-only bridge”
- No server code is included in this repository; the desktop client connects to a separate `scratch-ai-server`
- Chinese is the primary product language today, while the core open source docs are bilingual

## What It Does Today

- Detects common Scratch installation paths, with manual fallback selection
- Launches `Scratch Desktop` in a controlled session and connects to it
- Reads the current target, project data, and script structure
- Renders the current scripts and recommended blocks with real `scratch-blocks`
- Sends the learner's current progress to the server and reads back next-step hints
- Falls back to local hints when the server configuration is incomplete or unavailable

## Downloads and Release Flow

This repository does not publish GitHub Releases automatically yet. For now, official binaries are distributed through **GitHub Actions artifacts**:

- Windows artifact: `scratch-desktop-companion-windows`
  - includes a `portable .exe`
  - includes an `installer .exe`
- macOS artifact: `scratch-desktop-companion-macos`
  - includes a `.zip`
  - includes a `.dmg`

See [`docs/releasing.en.md`](docs/releasing.en.md) for workflow names, artifact naming, and packaging details.

## Local Development

```bash
git clone git@github.com:scratchai-labs/scratch-ai-desktop.git
cd scratch-ai-desktop
npm ci
npm run test
```

Common commands:

```bash
npm run build
npm run test
npm run package:win:bundle
npm run package:mac:zip
npm run package:mac:dmg
```

Run the desktop app locally:

```bash
cd apps/desktop-companion
npm run dev
```

## Documentation

- Project structure: [`docs/project-structure.en.md`](docs/project-structure.en.md)
- Releasing: [`docs/releasing.en.md`](docs/releasing.en.md)
- Cross-repo docs and planning: [`scratch-ai-docs`](https://github.com/scratchai-labs/scratch-ai-docs/blob/main/README.en.md)
- Engineering docs index: [`docs/README.zh-CN.md`](docs/README.zh-CN.md)
- Desktop app docs: [`apps/desktop-companion/README.md`](apps/desktop-companion/README.md)
- Verification tooling docs: [`tools/verification/README.zh-CN.md`](tools/verification/README.zh-CN.md)

## Contributing

Contributions are welcome through issues, pull requests, docs improvements, and classroom feedback.

- Read [`CONTRIBUTING.en.md`](CONTRIBUTING.en.md) before submitting code
- Follow [`CODE_OF_CONDUCT.en.md`](CODE_OF_CONDUCT.en.md) in community spaces
- Do not report security issues publicly; see [`SECURITY.en.md`](SECURITY.en.md)
- Support and discussion guidance lives in [`SUPPORT.en.md`](SUPPORT.en.md)

## Future Direction

Cross-repo planning now lives in [`scratch-ai-docs`](https://github.com/scratchai-labs/scratch-ai-docs/blob/main/README.en.md).
This repository stays focused on the networked desktop client, client-side packaging, and the student-facing server flow.

## License

This project is licensed under [`AGPL-3.0`](LICENSE).
