import { createDirectory, writeFile } from "./tauriFs";

const CONFIG_MD = `# Opensidian Config

| Setting   | Value                                          |
|-----------|------------------------------------------------|
| theme     | light                                           |
| fontSize  | 16                                             |
| llm.url   | https://api.openai.com/v1/chat/completions     |
| llm.model | gpt-4o                                         |
| llm.token |                                                |
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

  // Write config files
  await writeFile(`${p}/.configs/config.md`, CONFIG_MD);
  await writeFile(`${p}/.configs/colors.md`, COLORS_MD);

  // Write templates
  await writeFile(`${p}/.templates/Colleague.md`, COLLEAGUE_MD);
  await writeFile(`${p}/.templates/Project.md`, PROJECT_MD);
  await writeFile(`${p}/.templates/Meeting.md`, MEETING_MD);
}
