/**
 * PromptForge Options Script
 */

import { getSettings, updateSettings } from '../src/utils/storage.js';

document.addEventListener('DOMContentLoaded', async () => {
  const providerRadios = document.querySelectorAll('input[name="provider"]');
  const keyGemini = document.getElementById('key-gemini');
  const keyAnthropic = document.getElementById('key-anthropic');
  const keyOpenai = document.getElementById('key-openai');
  const keyGroq = document.getElementById('key-groq');
  const keyDeepseek = document.getElementById('key-deepseek');
  const ollamaUrl = document.getElementById('ollama-url');
  const ollamaModel = document.getElementById('ollama-model');
  const prefFloatingBtn = document.getElementById('pref-floating-btn');
  const defaultFramework = document.getElementById('default-framework');
  const saveBtn = document.getElementById('save-btn');
  const saveMsg = document.getElementById('save-msg');

  const fieldGemini = document.getElementById('field-gemini');
  const fieldAnthropic = document.getElementById('field-anthropic');
  const fieldOpenai = document.getElementById('field-openai');
  const fieldGroq = document.getElementById('field-groq');
  const fieldDeepseek = document.getElementById('field-deepseek');
  const fieldOllama = document.getElementById('field-ollama');

  const settings = await getSettings();

  for (const radio of providerRadios) {
    if (radio.value === (settings.provider || 'offline')) {
      radio.checked = true;
      break;
    }
  }

  keyGemini.value = settings.geminiApiKey || '';
  keyAnthropic.value = settings.anthropicApiKey || '';
  keyOpenai.value = settings.openaiApiKey || '';
  keyGroq.value = settings.groqApiKey || '';
  keyDeepseek.value = settings.deepseekApiKey || '';
  ollamaUrl.value = settings.ollamaEndpoint || 'http://localhost:11434/api/generate';
  ollamaModel.value = settings.ollamaModel || 'llama3';
  prefFloatingBtn.checked = settings.showFloatingButton !== false;
  defaultFramework.value = settings.activeFramework || 'balanced';

  function updateFieldVisibility() {
    const active = document.querySelector('input[name="provider"]:checked')?.value || 'offline';
    fieldGemini.style.display = active === 'gemini' ? 'flex' : 'none';
    fieldAnthropic.style.display = active === 'anthropic' ? 'flex' : 'none';
    fieldOpenai.style.display = active === 'openai' ? 'flex' : 'none';
    fieldGroq.style.display = active === 'groq' ? 'flex' : 'none';
    fieldDeepseek.style.display = active === 'deepseek' ? 'flex' : 'none';
    fieldOllama.style.display = active === 'ollama' ? 'flex' : 'none';
  }

  providerRadios.forEach(r => r.addEventListener('change', updateFieldVisibility));
  updateFieldVisibility();

  saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    saveBtn.innerText = 'Saving...';

    const selectedProvider = document.querySelector('input[name="provider"]:checked')?.value || 'offline';

    const newSettings = {
      provider: selectedProvider,
      geminiApiKey: keyGemini.value.trim(),
      anthropicApiKey: keyAnthropic.value.trim(),
      openaiApiKey: keyOpenai.value.trim(),
      groqApiKey: keyGroq.value.trim(),
      deepseekApiKey: keyDeepseek.value.trim(),
      ollamaEndpoint: ollamaUrl.value.trim(),
      ollamaModel: ollamaModel.value.trim(),
      showFloatingButton: prefFloatingBtn.checked,
      activeFramework: defaultFramework.value
    };

    await updateSettings(newSettings);

    saveBtn.disabled = false;
    saveBtn.innerText = 'Save Configuration';
    saveMsg.innerText = '✓ Configuration saved successfully!';
    setTimeout(() => {
      saveMsg.innerText = '';
    }, 2500);
  });
});
