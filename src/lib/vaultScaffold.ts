import { createDirectory, readFile, writeFile } from "./tauriFs";
import { parseConfig } from "./configFile";

const CONFIG_MD = `# Opensidian Config

| Setting    | Value                                          |
|------------|------------------------------------------------|
| getStarted | true                                           |
| theme      | light                                          |
| fontSize   | 16                                             |
| llm.url    | https://api.openai.com/v1/chat/completions     |
| llm.model  | gpt-4o                                         |
| llm.token  |                                                |
`;

const COLORS_MD = `# Color System

Define your emoji → color mappings here.
The graph view reads this file to color nodes automatically.

| Emoji | Color   | Type      | Description     |
|-------|---------|-----------|-----------------|
| 🟩    | #a6e3a1 | Colleague | Team members    |
| 🟨    | #f9e2af | Project   | Initiatives     |
| 🟫    | #f44336 | Meeting   | Events & calls  |
| 🟧    | #fab387 | Review    | Audits & checks |
| 🟦    | #74c7ec | Team      | Groups & squads |
| 🟪    | #b4befe | Leadership| Top-level group |
`;

const COLLEAGUE_MD = `# 🟩 <Full Name>

**Role:**
**Department:**
**Manager:** [[]]

## Goals
-

## Notes
-
`;

const PROJECT_MD = `# 🟨 <Project Name>

**Goal:**
**Owner:** [[]]
**Sponsor:** [[]]

## Status
- [ ]

## Risks
-

## Links
-
`;

const MEETING_MD = `# 🟫 <Date> <Meeting Title>

**Date:**
**Participants:** [[]], [[]]
**Organizer:** [[]]

## Agenda
-

## Notes

## Decisions / Actions
- [ ]
`;

export async function scaffoldVault(vaultPath: string): Promise<void> {
  const p = vaultPath.replace(/\\/g, "/");

  // Create directories
  await createDirectory(`${p}/.configs`);
  await createDirectory(`${p}/.templates`);

  // Only write default config if this vault hasn't been set up before
  const configPath = `${p}/.configs/config.md`;
  let alreadySetup = false;
  try {
    const existing = await readFile(configPath);
    alreadySetup = parseConfig(existing)["getStarted"] === "true";
  } catch {
    // File doesn't exist yet — proceed with defaults
  }

  if (!alreadySetup) {
    await writeFile(configPath, CONFIG_MD);
  }

  await writeFile(`${p}/.configs/colors.md`, COLORS_MD);

  // Write templates
  await writeFile(`${p}/.templates/Colleague.md`, COLLEAGUE_MD);
  await writeFile(`${p}/.templates/Project.md`, PROJECT_MD);
  await writeFile(`${p}/.templates/Meeting.md`, MEETING_MD);
}
