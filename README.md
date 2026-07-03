
# 🛡️ ScrubBeforeAI - Core Redaction Engine

> **The privacy-first, 100% client-side engine for sanitizing developer logs and code before sending them to AI.**

[![Website](https://img.shields.io/badge/Live_Tool-ScrubBeforeAI.com-blue?style=for-the-badge)](https://scrubbeforeai.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

## 🛑 The Problem
Developers frequently use LLMs (ChatGPT, Claude) for debugging. However, pasting raw `.env` files, stack traces, or server logs often results in accidental leaks of sensitive credentials (AWS keys, DB strings, JWTs) and PII to third-party AI training servers. Cloud-based DLP proxies exist, but they still transmit your raw secrets over the network.

## 💡 The Solution
**ScrubBeforeAI** is a browser-based utility that processes text 100% locally. Zero network calls. 

This repository contains the **Core Regex & Parsing Engine** used in the main application. We open-sourced this engine so the developer community can verify exactly how their data is processed, proving that secrets never leave the local machine.

### ✨ Key Features of the Engine
- **Smart Contextual Placeholders:** Doesn't just use `[REDACTED]`. It identifies the token type (e.g., `[SCRUB_AWS_ACCESS_KEY_1]`) to give the AI proper context.
- **Defensive Syntax Protection:** Skips public IPs (`0.0.0.0`) and standard code syntax so you don't break your stack trace.
- **Two-Way Restore Map:** Generates a secure local map of `Placeholder -> Original Secret` to instantly revert the AI's response back to working code.

## 🚀 Try the Full Interactive UI
Don't want to run scripts manually? Use the visual, browser-based tool with one-click restore here: 
**👉 [https://scrubbeforeai.com](https://scrubbeforeai.com)**

## 🛠️ Usage (Core Engine)
Check out `scrubber.js` in this repo to see how we handle token extraction, trailing suffixes, and contextual redaction.
