/**
 * PromptForge Background Service Worker
 */

import { dispatchPromptRefinement } from '../src/ai/engine.js';
import { getSettings, recordPromptForged } from '../src/utils/storage.js';

// Setup Context Menus
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'promptforge-refine-selection',
    title: '✨ Forge Super-Prompt with PromptForge',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'promptforge-refine-selection' && info.selectionText) {
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'TRIGGER_MODAL',
        text: info.selectionText
      });
    }
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'forge-prompt') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'TRIGGER_SHORTCUT'
      });
    }
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'FORGE_PROMPT') {
    (async () => {
      try {
        const settings = await getSettings();
        const framework = message.framework || settings.activeFramework || 'balanced';
        const rawThought = message.text;

        const forged = await dispatchPromptRefinement({
          rawThought,
          framework,
          settings
        });

        // Record metrics
        await recordPromptForged(rawThought.length, forged.length);

        sendResponse({ success: true, forged, framework });
      } catch (err) {
        sendResponse({ success: false, error: err.message || 'Failed to forge prompt' });
      }
    })();
    return true; // Keep channel open for async response
  }

  if (message.action === 'GET_SETTINGS') {
    (async () => {
      const settings = await getSettings();
      sendResponse({ settings });
    })();
    return true;
  }
});
