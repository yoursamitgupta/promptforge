/**
 * PromptForge Storage Utility
 * Type-safe settings persistence and token metrics tracking.
 */

export const DEFAULT_SETTINGS = {
  provider: 'offline', // 'offline' | 'chrome_ai' | 'gemini' | 'openai' | 'anthropic' | 'groq' | 'deepseek' | 'ollama'
  geminiApiKey: '',
  openaiApiKey: '',
  anthropicApiKey: '',
  groqApiKey: '',
  deepseekApiKey: '',
  ollamaEndpoint: 'http://localhost:11434/api/generate',
  ollamaModel: 'llama3',
  activeFramework: 'balanced',
  showFloatingButton: true,
  autoInjectPill: true,
  stats: {
    promptsForged: 0,
    estimatedTokensSaved: 0,
    turnsSaved: 0
  }
};

export async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(DEFAULT_SETTINGS, (items) => {
      resolve(items || DEFAULT_SETTINGS);
    });
  });
}

export async function updateSettings(newSettings) {
  return new Promise((resolve) => {
    chrome.storage.sync.set(newSettings, () => {
      resolve(true);
    });
  });
}

export async function recordPromptForged(thoughtLength, promptLength) {
  const settings = await getSettings();
  const stats = settings.stats || { promptsForged: 0, estimatedTokensSaved: 0, turnsSaved: 0 };

  // Conservative Token Savings Model:
  // A vague prompt requires ~3-4 corrective conversational turns.
  // In a standard chat session, every subsequent turn re-submits the entire context history.
  // 3 turns saved @ ~250-400 tokens per turn = ~800-1,200 tokens net reduction.
  const turnsAvoided = 3;
  const tokensSaved = Math.max(350, Math.round(thoughtLength * 3.5));

  stats.promptsForged += 1;
  stats.turnsSaved += turnsAvoided;
  stats.estimatedTokensSaved += tokensSaved;

  await updateSettings({ stats });
  return stats;
}
