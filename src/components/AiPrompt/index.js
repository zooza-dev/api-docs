import React, {useState} from 'react';
import styles from './styles.module.css';

/**
 * AiPrompt — a small, reusable "copy this prompt to your AI agent" box.
 *
 * Drop it next to a relevant guide section. The prompt body is passed as a
 * plain-string child so it can be copied verbatim and opened in an assistant.
 *
 * Usage in MDX:
 *   <AiPrompt task="Embed and style the widget">{`...prompt text...`}</AiPrompt>
 */
export default function AiPrompt({task, children}) {
  const prompt = String(children).trim();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // Clipboard API unavailable (e.g. non-secure context) — fail quietly.
    }
  };

  const encoded = encodeURIComponent(prompt);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.icon} aria-hidden="true">🤖</span>
        <div className={styles.headText}>
          <span className={styles.kicker}>Build this with your AI agent</span>
          {task && <span className={styles.task}>{task}</span>}
        </div>
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          {open ? 'Hide prompt' : 'Show prompt'}
        </button>
      </div>

      {open && <pre className={styles.prompt}>{prompt}</pre>}

      <div className={styles.actions}>
        <button type="button" className={styles.copyBtn} onClick={copy}>
          {copied ? '✓ Copied' : 'Copy prompt'}
        </button>
        <a
          className={styles.linkBtn}
          href={`https://chatgpt.com/?q=${encoded}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open in ChatGPT ↗
        </a>
        <a
          className={styles.linkBtn}
          href={`https://claude.ai/new?q=${encoded}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open in Claude ↗
        </a>
      </div>
    </div>
  );
}
