export type StepInsightResult = {
  summary: string;
  insight: string;
  motivation: string;
};

export const STEP_INSIGHT_SENTENCE_RULE = {
  min: 1,
  max: 3,
} as const;

export const STEP_INSIGHT_FIELD_MAX_LENGTH = 300;

export const EMPTY_STEP_INSIGHT_RESULT: StepInsightResult = {
  summary: '',
  insight: '',
  motivation: '',
};
