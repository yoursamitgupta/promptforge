# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

PromptForge takes privacy and security seriously:
- **Zero Telemetry**: PromptForge runs 100% locally in your browser.
- **Direct API Communication**: When using BYOK (Bring Your Own Key), API calls are made directly from your browser extension sandbox to the official AI provider endpoints (Google, Anthropic, OpenAI, Groq, DeepSeek).
- **Local Storage**: Keys and settings are stored locally in Chrome's encrypted local extension storage (`chrome.storage.local`).

If you discover a security vulnerability or credential leak risk:
1. Please **do not** open a public issue.
2. Email security details directly to: `32707843+yoursamitgupta@users.noreply.github.com` (or create a private GitHub Security Advisory).
3. We will acknowledge receipt within 48 hours and work with you on a coordinated disclosure and patch.
