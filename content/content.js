/**
 * PromptForge Content Script
 * Injects prompt enhancement triggers and HUD into Claude, Copilot, ChatGPT, & Gemini.
 */

(function () {
  'use strict';

  let currentTargetInput = null;
  let floatingButton = null;
  let activeModal = null;
  let currentForgedPrompt = '';
  let activeFramework = 'balanced';

  const FRAMEWORKS = [
    { id: 'balanced', name: 'CREATE (Balanced)', icon: '🎯' },
    { id: 'code', name: 'Code (Staff Eng)', icon: '💻' },
    { id: 'tokensaver', name: 'Token Conserver', icon: '⚡' },
    { id: 'reasoning', name: 'Deep Reasoning', icon: '🧠' },
    { id: 'executive', name: 'Executive (BLUF)', icon: '📊' }
  ];

  const INPUT_SELECTORS = [
    // Claude.ai
    'div.ProseMirror[contenteditable="true"]',
    'fieldset div[contenteditable="true"]',
    // ChatGPT
    '#prompt-textarea',
    'textarea[data-id="root"]',
    'div[contenteditable="true"]#prompt-textarea',
    // Microsoft Copilot
    'textarea[placeholder*="Ask"]',
    'rich-textarea textarea',
    // Perplexity
    'textarea[placeholder*="Ask anything"]',
    // Gemini
    'rich-textarea div.ql-editor',
    'div[contenteditable="true"].ql-editor',
    // Fallback
    'textarea'
  ];

  function findChatInput() {
    for (const selector of INPUT_SELECTORS) {
      const el = document.querySelector(selector);
      if (el && el.offsetParent !== null) {
        return el;
      }
    }
    return document.activeElement && (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.isContentEditable)
      ? document.activeElement
      : null;
  }

  function getInputValue(el) {
    if (!el) return '';
    if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
      return el.value;
    }
    if (el.isContentEditable) {
      return el.innerText || el.textContent || '';
    }
    return '';
  }

  function setInputValue(el, text) {
    if (!el) return;
    el.focus();

    if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
      el.value = text;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (el.isContentEditable) {
      try {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(el);
        selection.removeAllRanges();
        selection.addRange(range);

        if (!document.execCommand('insertText', false, text)) {
          el.innerText = text;
        }
      } catch (e) {
        el.innerText = text;
      }
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  function createFloatingButton() {
    if (floatingButton) return floatingButton;

    const btn = document.createElement('div');
    btn.className = 'promptforge-floating-btn';
    btn.innerHTML = `<span class="pf-icon">⚡</span><span>Forge</span>`;
    btn.title = 'Forge Super-Prompt (Alt + P)';

    btn.addEventListener('mousedown', (e) => {
      e.preventDefault();
    });

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const target = currentTargetInput || findChatInput();
      const text = getInputValue(target);
      openHUD(text, target);
    });

    document.body.appendChild(btn);
    floatingButton = btn;
    return btn;
  }

  function positionFloatingButton(targetEl) {
    if (!floatingButton) createFloatingButton();
    if (!targetEl || !targetEl.isConnected) {
      floatingButton.style.display = 'none';
      return;
    }

    const rect = targetEl.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      floatingButton.style.display = 'none';
      return;
    }

    floatingButton.style.display = 'inline-flex';
    floatingButton.style.top = `${window.scrollY + rect.bottom - 44}px`;
    floatingButton.style.left = `${window.scrollX + rect.right - 95}px`;
  }

  function openHUD(initialText = '', targetEl = null) {
    closeHUD();
    currentTargetInput = targetEl || findChatInput();

    const backdrop = document.createElement('div');
    backdrop.className = 'promptforge-backdrop';

    backdrop.innerHTML = `
      <div class="promptforge-hud" role="dialog" aria-modal="true">
        <div class="promptforge-hud-header">
          <div class="promptforge-brand-title">
            <span>⚡ PromptForge</span>
            <span class="promptforge-tag">Optimizer</span>
          </div>
          <button class="promptforge-close-btn" id="pf-close-btn" title="Close (Esc)">✕</button>
        </div>

        <div class="promptforge-frameworks" id="pf-frameworks-bar">
          ${FRAMEWORKS.map(f => `
            <div class="promptforge-framework-chip ${f.id === activeFramework ? 'active' : ''}" data-id="${f.id}">
              <span>${f.icon}</span>
              <span>${f.name}</span>
            </div>
          `).join('')}
        </div>

        <div class="promptforge-hud-body">
          <div>
            <div class="promptforge-section-title">
              <span>Raw Thought / Query</span>
              <span style="font-size: 10px; color: #64748b;">Plain natural language</span>
            </div>
            <textarea class="promptforge-input-box" id="pf-input-box" placeholder="e.g. create a responsive dashboard with charts using nextjs and tailwind">${escapeHtml(initialText)}</textarea>
          </div>

          <div>
            <div class="promptforge-section-title">
              <span>Forged Super-Prompt</span>
              <span style="font-size: 10px; color: #64748b;">1-Turn Precision Structure</span>
            </div>
            <div id="pf-result-wrapper">
              <div class="promptforge-result-box" id="pf-result-box">Click a framework or type above to forge...</div>
            </div>
          </div>
        </div>

        <div class="promptforge-hud-footer">
          <div class="promptforge-savings-pill">
            <span>⚡ Avoids ~3 corrective turns (~1,100 tokens saved)</span>
          </div>
          <div class="promptforge-actions">
            <button class="promptforge-btn promptforge-btn-secondary" id="pf-copy-btn">📋 Copy</button>
            <button class="promptforge-btn promptforge-btn-primary" id="pf-insert-btn">🚀 Insert into Chat</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    activeModal = backdrop;

    const inputBox = backdrop.querySelector('#pf-input-box');
    const resultBox = backdrop.querySelector('#pf-result-box');
    const resultWrapper = backdrop.querySelector('#pf-result-wrapper');
    const closeBtn = backdrop.querySelector('#pf-close-btn');
    const copyBtn = backdrop.querySelector('#pf-copy-btn');
    const insertBtn = backdrop.querySelector('#pf-insert-btn');
    const frameworksBar = backdrop.querySelector('#pf-frameworks-bar');

    inputBox.focus();
    if (initialText.trim()) {
      executeForge(initialText.trim(), activeFramework);
    }

    frameworksBar.addEventListener('click', (e) => {
      const chip = e.target.closest('.promptforge-framework-chip');
      if (!chip) return;
      frameworksBar.querySelectorAll('.promptforge-framework-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeFramework = chip.dataset.id;
      executeForge(inputBox.value.trim(), activeFramework);
    });

    let debounceTimer = null;
    inputBox.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        executeForge(inputBox.value.trim(), activeFramework);
      }, 500);
    });

    function executeForge(text, framework) {
      if (!text) {
        resultBox.innerText = 'Type your rough thought above to forge...';
        currentForgedPrompt = '';
        return;
      }

      resultWrapper.innerHTML = `
        <div class="promptforge-loading">
          <div class="promptforge-spinner"></div>
          <span>Engineering 1-turn precision prompt...</span>
        </div>
      `;

      chrome.runtime.sendMessage(
        { action: 'FORGE_PROMPT', text, framework },
        (res) => {
          if (chrome.runtime.lastError) {
            resultWrapper.innerHTML = `<div class="promptforge-result-box" style="color:#ef4444;">Error: ${chrome.runtime.lastError.message}</div>`;
            return;
          }

          if (res?.success) {
            currentForgedPrompt = res.forged;
            resultWrapper.innerHTML = `<div class="promptforge-result-box" id="pf-result-box">${escapeHtml(res.forged)}</div>`;
          } else {
            resultWrapper.innerHTML = `<div class="promptforge-result-box" style="color:#ef4444;">${escapeHtml(res?.error || 'Failed to forge')}</div>`;
          }
        }
      );
    }

    insertBtn.addEventListener('click', () => {
      if (currentForgedPrompt && currentTargetInput) {
        setInputValue(currentTargetInput, currentForgedPrompt);
        closeHUD();
      }
    });

    copyBtn.addEventListener('click', async () => {
      if (currentForgedPrompt) {
        await navigator.clipboard.writeText(currentForgedPrompt);
        copyBtn.innerText = '✅ Copied!';
        setTimeout(() => { copyBtn.innerText = '📋 Copy'; }, 1500);
      }
    });

    closeBtn.addEventListener('click', closeHUD);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeHUD();
    });

    backdrop.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeHUD();
      } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        if (currentForgedPrompt && currentTargetInput) {
          setInputValue(currentTargetInput, currentForgedPrompt);
          closeHUD();
        }
      }
    });
  }

  function closeHUD() {
    if (activeModal) {
      activeModal.remove();
      activeModal = null;
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === 'TRIGGER_MODAL') {
      openHUD(msg.text || '');
    } else if (msg.action === 'TRIGGER_SHORTCUT') {
      const activeEl = findChatInput();
      const text = getInputValue(activeEl);
      openHUD(text, activeEl);
    }
  });

  document.addEventListener('focusin', (e) => {
    const target = e.target.closest('textarea, div[contenteditable="true"]');
    if (target) {
      currentTargetInput = target;
      positionFloatingButton(target);
    }
  });

  window.addEventListener('resize', () => {
    if (currentTargetInput) positionFloatingButton(currentTargetInput);
  });

  window.addEventListener('scroll', () => {
    if (currentTargetInput) positionFloatingButton(currentTargetInput);
  }, true);

  document.addEventListener('keydown', (e) => {
    if (e.altKey && (e.key === 'p' || e.key === 'P')) {
      e.preventDefault();
      const activeEl = currentTargetInput || findChatInput();
      const text = getInputValue(activeEl);
      openHUD(text, activeEl);
    }
  });

})();
