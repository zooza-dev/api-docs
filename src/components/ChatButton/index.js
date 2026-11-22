import React from 'react';
import { openSupportChat, TEMPLATES, SUPPORT_EMAIL } from '@site/src/lib/supportChat';
import styles from './styles.module.css';

/**
 * A chat entry point. `template` is a key of TEMPLATES; the chat opens a new conversation with that text typed in.
 * Without a matching template (e.g. `template="home"`), the messenger's Home opens, with "Ask a question" and
 * "Create a ticket".
 * Rendered as a mailto: link, so it still works without JavaScript.
 */
export default function ChatButton({ template = 'page', children, note = true }) {
  const onClick = (event) => {
    event.preventDefault();
    openSupportChat(TEMPLATES[template] ? TEMPLATES[template]() : '');
  };
  return (
    <span className={styles.wrap}>
      <a href={`mailto:${SUPPORT_EMAIL}`} onClick={onClick} className={styles.button}>
        {children || 'Chat with us'}
      </a>
      {note && <span className={styles.note}>Never send your client_secret or an access token.</span>}
    </span>
  );
}
