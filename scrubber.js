/**
 * ScrubBeforeAI - Core Redaction Engine
 * 100% Client-Side. Zero Network Calls.
 */

class ScrubEngine {
  constructor() {
    this.secretMap = new Map(); // Stores { placeholder: original_secret }
    this.counters = {}; // Keeps track of numbering (e.g., AWS_KEY_1, AWS_KEY_2)
    
    // Core Regex Patterns (Tuned to avoid partial leaks and over-scrubbing)
    this.patterns = [
      {
        type: 'AWS_ACCESS_KEY',
        // Matches AKIA followed by 16 alphanumeric characters
        regex: /\b(AKIA[0-9A-Z]{16})\b/g 
      },
      {
        type: 'BEARER_TOKEN',
        // Matches standard JWT structure (Header.Payload.Signature)
        regex: /\b(ey[a-zA-Z0-9_-]+\.ey[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+)\b/g 
      },
      {
        type: 'DB_PASSWORD',
        // Safely extracts password from standard URI: protocol://user:PASSWORD@host
        regex: /(?<=:\/\/[^:]+:)([^@]+)(?=@)/g 
      },
      {
        type: 'STRIPE_SECRET',
        // Captures Stripe live secret keys
        regex: /\b(sk_live_[a-zA-Z0-9]+)\b/g 
      },
      {
        type: 'EMAIL',
        // Standard email regex
        regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g 
      },
      {
        type: 'IPV4',
        // Matches IPs but uses a negative lookahead to ignore 0.0.0.0 and 127.0.0.1
        regex: /\b(?!(?:0\.0\.0\.0|127\.0\.0\.1)\b)(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g 
      }
    ];
  }

  /**
   * Generates a numbered placeholder (e.g., [SCRUB_EMAIL_2])
   */
  _generatePlaceholder(type) {
    if (!this.counters[type]) this.counters[type] = 0;
    this.counters[type]++;
    return `[SCRUB_${type}_${this.counters[type]}]`;
  }

  /**
   * Step 1: Scrub the raw text before sending to AI
   */
  scrubText(inputText) {
    let scrubbedText = inputText;
    
    // Reset counters and map for fresh scrub
    this.counters = {};
    this.secretMap.clear();

    this.patterns.forEach(({ type, regex }) => {
      scrubbedText = scrubbedText.replace(regex, (match) => {
        const placeholder = this._generatePlaceholder(type);
        // Save the mapping securely in browser memory
        this.secretMap.set(placeholder, match); 
        return placeholder;
      });
    });

    return scrubbedText;
  }

  /**
   * Step 2: The Magic - Restore original secrets into the AI's response
   */
  restoreText(aiResponseText) {
    let restoredText = aiResponseText;
    
    // Iterate through the saved map and swap placeholders back to original secrets
    this.secretMap.forEach((originalSecret, placeholder) => {
      // Escape brackets in placeholder for regex replacement
      const safePlaceholder = placeholder.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
      const replaceRegex = new RegExp(safePlaceholder, 'g');
      
      restoredText = restoredText.replace(replaceRegex, originalSecret);
    });

    return restoredText;
  }
}

// === EXPORT FOR BROWSER / NODE ===
export default ScrubEngine;
