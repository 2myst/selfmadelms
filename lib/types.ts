export type Score = 0 | 1 | 2;

export type Attempt = { attempt: number; sum: number; max: number; at: string };

export type TaskState = {
  scores: Record<string, Score>;
  done?: boolean;
  comment?: string;
  attempt?: number;
  history?: Attempt[];
  submission?: { link: string; note: string; at: string };
  gradedAt?: string;
};

export type State = { tasks: Record<string, TaskState> };
