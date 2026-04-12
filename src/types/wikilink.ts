/** sourcePath -> Set of target basenames (without .md) */
export type LinkMap = Record<string, Set<string>>;

/** targetBasename -> Set of source paths */
export type BacklinkMap = Record<string, Set<string>>;

export interface WikiLink {
  target: string;
  alias?: string;
  anchor?: string;
}

export interface BacklinkEntry {
  sourcePath: string;
  sourceName: string;
  excerpt: string;
}
