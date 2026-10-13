export interface ContentIssue {
  code: string;
  file: string;
  /** Where in the file (e.g. a question id or a JSON path). */
  at?: string;
  message: string;
}

export function formatIssue(issue: ContentIssue): string {
  return `✗ [${issue.code}] ${issue.file}${issue.at ? ` › ${issue.at}` : ''}: ${issue.message}`;
}
