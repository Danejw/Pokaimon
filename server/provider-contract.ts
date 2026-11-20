/** Provider boundaries for an eventual opt-in, verified live challenge mode.
 * Implementations are intentionally absent in the simulated MVP.
 */
export type ProviderId = 'openai' | 'xai' | 'anthropic';

export interface ProviderRequest {
  modelId: string;
  prompt: string;
  permittedTools: readonly string[];
  signal: AbortSignal;
}
export interface Evidence {
  kind: 'test' | 'source' | 'tool-output';
  reference: string;
  verified: boolean;
}
export interface ProviderResult {
  output: string;
  evidence: readonly Evidence[];
  inputTokens?: number;
  outputTokens?: number;
  costUsd?: number;
}
export interface ProviderAdapter {
  readonly provider: ProviderId;
  readonly supportedModelIds: readonly string[];
  execute(request: ProviderRequest): Promise<ProviderResult>;
}
/** Empty by design. The MVP does not invoke any commercial model. */
export const liveAdapters: readonly ProviderAdapter[] = [];

export function getAdapter(provider: ProviderId, modelId: string): ProviderAdapter | undefined {
  return liveAdapters.find(adapter => adapter.provider === provider && adapter.supportedModelIds.includes(modelId));
}
