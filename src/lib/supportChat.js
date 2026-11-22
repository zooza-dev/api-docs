/**
 * Developer support chat (spec DOC-20261119-001, handoff api-docs-to-app-20261119-001).
 *
 * Intercom loads only when a visitor clicks a chat entry point: nothing from Intercom is fetched and no cookie is
 * set before that, so the docs need no consent banner. Visitors are anonymous (the docs have no login). Every
 * conversation carries `source: "docs"`, `current_url` and `docs_env`, as agreed with the app.
 *
 * Production (docs.zooza.online) uses the live workspace. Everywhere else (staging, localhost) uses Intercom's test
 * workspace, so test conversations never reach support. `docs_env` says which one a conversation came from.
 */

export const SUPPORT_EMAIL = 'support@zooza.online';
const LIVE_APP_ID = 'drkz8pug';
// Intercom's test workspace for the live one (no trusted-domain limit there, so localhost works)
const TEST_APP_ID = 'otazh78m';
const PRODUCTION_HOST = 'docs.zooza.online';

let loading = null;

function environment() {
  const host = window.location.hostname;
  if (host === PRODUCTION_HOST) return { appId: LIVE_APP_ID, env: 'production' };
  return { appId: TEST_APP_ID, env: host === 'localhost' || host === '127.0.0.1' ? 'local' : 'staging' };
}

function attributes(env) {
  return { source: 'docs', current_url: window.location.href, docs_env: env };
}

function load() {
  if (loading) return loading;
  const { appId, env } = environment();
  if (!appId) return Promise.reject(new Error('no Intercom app ID for this host'));
  loading = new Promise((resolve, reject) => {
    // Intercom's standard install: a queue that the messenger script replays once it has loaded.
    if (typeof window.Intercom !== 'function') {
      const queue = function () {
        queue.c(arguments);
      };
      queue.q = [];
      queue.c = (args) => queue.q.push(args);
      window.Intercom = queue;
    }
    window.Intercom('boot', {
      app_id: appId,
      hide_default_launcher: true,
      custom_attributes: attributes(env),
    });
    const script = document.createElement('script');
    script.src = `https://widget.intercom.io/widget/${appId}`;
    script.async = true;
    // The messenger replaces the queue and sets `booted` when it has started.
    script.onload = () => {
      const started = Date.now();
      const wait = setInterval(() => {
        if (window.Intercom && window.Intercom.booted) {
          clearInterval(wait);
          resolve();
        } else if (Date.now() - started > 8000) {
          clearInterval(wait);
          loading = null;
          reject(new Error('Intercom did not start'));
        }
      }, 100);
    };
    script.onerror = () => {
      loading = null;
      reject(new Error('Intercom failed to load'));
    };
    document.head.appendChild(script);
  });
  return loading;
}

function mailto(message) {
  const subject = `Developer docs: ${document.title}`;
  const body = `${message || ''}\n\nPage: ${window.location.href}`;
  window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// Whether the messenger is open now, and whether an open is still in progress.
let visible = false;
let opening = false;
let listening = false;

function watchVisibility() {
  if (listening) return;
  listening = true;
  window.Intercom('onShow', () => {
    visible = true;
  });
  window.Intercom('onHide', () => {
    visible = false;
  });
}

/**
 * Opens the chat. With `message`, a new conversation opens with it typed in (the visitor still presses send); with
 * `compose` and no message, a new conversation opens empty, so the workspace's workflow offers its choices; otherwise
 * the messenger's Home opens. Right after start-up the messenger can
 * drop the first command, so it is repeated until the messenger reports it is open. Falls back to e-mail only when
 * Intercom can't load, or never opens (e.g. on a domain the workspace doesn't trust). Clicking again while the chat
 * is open or opening never sends anyone to e-mail.
 */
export function openSupportChat(message = '', { compose = Boolean(message) } = {}) {
  if (opening) return;
  opening = true;
  load()
    .then(() => {
      watchVisibility();
      window.Intercom('update', { custom_attributes: attributes(environment().env) });
      if (visible) {
        // Already open: start the new conversation, if one was asked for.
        if (message) window.Intercom('showNewMessage', message);
        else if (compose) window.Intercom('showNewMessage');
        return undefined;
      }
      return new Promise((resolve, reject) => {
        let tries = 0;
        const attempt = () => {
          if (visible) {
            // The first open after start-up can land on Home; once open, the message view sticks.
            if (message) setTimeout(() => window.Intercom('showNewMessage', message), 400);
            else if (compose) setTimeout(() => window.Intercom('showNewMessage'), 400);
            return resolve();
          }
          if (tries++ >= 5) return reject(new Error('Intercom did not open'));
          if (message) window.Intercom('showNewMessage', message);
          else if (compose) window.Intercom('showNewMessage');
          else window.Intercom('show');
          return setTimeout(attempt, 1000);
        };
        attempt();
      });
    })
    .catch(() => mailto(message))
    .finally(() => {
      opening = false;
    });
}

/** Keeps `current_url` current after client-side navigation, once the chat has been opened. */
export function updateSupportChatPage() {
  if (!loading || typeof window.Intercom !== 'function') return;
  window.Intercom('update', { custom_attributes: attributes(environment().env) });
}

/** Ready-made messages for the entry points. An entry point without one opens an empty new conversation. */
export const TEMPLATES = {
  page: () => `About this page (${document.title}): `,
  errorCode: () => 'Question about error code ',
};
