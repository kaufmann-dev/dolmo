export const MODEL_IDS = ['claude-opus-5-5', 'claude-sonnet-5-5', 'claude-haiku-5-5'] as const;

export type ModelId = (typeof MODEL_IDS)[number];

export const MODEL_LABELS: Record<ModelId, string> = {
	'claude-opus-5-5': 'Opus 5.5',
	'claude-sonnet-5-5': 'Sonnet 5.5',
	'claude-haiku-5-5': 'Haiku 5.5'
};

/** Effort levels accepted by all three models. Lower is faster; higher thinks longer. */
export const EFFORTS = ['low', 'medium', 'high', 'xhigh', 'max'] as const;

export type Effort = (typeof EFFORTS)[number];

export const DEFAULT_MODEL: ModelId = 'claude-opus-5-5';
export const DEFAULT_EFFORT: Effort = 'low';
