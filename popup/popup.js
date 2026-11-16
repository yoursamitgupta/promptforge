/**
 * PromptForge Popup Script
 */

import { getSettings, updateSettings } from '../src/utils/storage.js';

document.addEventListener('DOMContentLoaded', async () => {
  const thoughtInput = document.getElementById('thought-input');
  const forgeBtn = document.getElementById('forge-btn');
  const resultGroup = document.getElementById('result-group');
  const resultOutput = document.getElementById('result-output');
  const copyBtn = document.getElementById('copy-btn');
  const valForged = document.getElementById('val-forged');
  const valTurns = document.getElementById('val-turns');
  const valTokens = document.getElementById('val-tokens');
  const frameworkBar = document.getElementById('framework-bar');

  let activeFramework = 'balanced';

  // Load existing metrics & configuration
  const settings = await getSettings();
  if (settings.stats) {
    valForged.innerText = settings.stats.promptsForged || 0;
    valTurns.innerText = settings.stats.turnsSaved || 0;
    valTokens.innerText = (settings.stats.estimatedTokensSaved || 0).toLocaleString();
  }
  if (settings.activeFramework) {
    activeFramework = settings.activeFramework;
    updateFrameworkUI(activeFramework);
  }

  frameworkBar.addEventListener('click', async (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    activeFramework = chip.dataset.id;
    updateFrameworkUI(activeFramework);
    await updateSettings({ activeFramework });
  });

  function updateFrameworkUI(fw) {
    frameworkBar.querySelectorAll('.chip').forEach((c) => {
      c.classList.toggle('active', c.dataset.id === fw);
    });
  }

  forgeBtn.addEventListener('click', () => {
    const text = thoughtInput.value.trim();
    if (!text) {
      thoughtInput.focus();
      return;
    }

    forgeBtn.disabled = true;
    forgeBtn.innerText = 'Forging...';

    chrome.runtime.sendMessage(
      { action: 'FORGE_PROMPT', text, framework: activeFramework },
      (res) => {
        forgeBtn.disabled = false;
        forgeBtn.innerText = '⚡ Forge Super-Prompt';

        if (res?.success) {
          resultOutput.value = res.forged;
          resultGroup.style.display = 'flex';

          getSettings().then((updated) => {
            valForged.innerText = updated.stats?.promptsForged || 0;
            valTurns.innerText = updated.stats?.turnsSaved || 0;
            valTokens.innerText = (updated.stats?.estimatedTokensSaved || 0).toLocaleString();
          });
        } else {
          resultOutput.value = `Error: ${res?.error || 'Failed to forge'}`;
          resultGroup.style.display = 'flex';
        }
      }
    );
  });

  copyBtn.addEventListener('click', async () => {
    if (resultOutput.value) {
      await navigator.clipboard.writeText(resultOutput.value);
      copyBtn.innerText = '✅ Copied!';
      setTimeout(() => {
        copyBtn.innerText = '📋 Copy';
      }, 1500);
    }
  });

  thoughtInput.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      forgeBtn.click();
    }
  });
});
