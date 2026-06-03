export enum Capability {
  GENERATE_MICRO_SCENARIO_INTRO = 'generate_micro_scenario_intro',
  GENERATE_FULL_SCENARIO = 'generate_full_scenario',
}

export interface CapabilityRequest {
  capability: Capability;
  nativeLanguage: string;
  verbTarget: string;
  difficultyLevel?: number;
  context?: Record<string, unknown>;
}

export interface CapabilityResponse {
  text: string;
  verbTarget: string;
  level: number;
  guardrailPassed: boolean;
  metadata?: {
    provider: string;
    model?: string;
  };
}
