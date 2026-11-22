// Turns every link to the support e-mail (e.g. the footer's "Support") into a chat opener.
// Without JavaScript the link still works as mailto:. Chat buttons handle their own clicks (defaultPrevented).
import { openSupportChat, updateSupportChatPage, SUPPORT_EMAIL } from '@site/src/lib/supportChat';

if (typeof document !== 'undefined') {
  document.addEventListener('click', (event) => {
    const link = event.target.closest && event.target.closest(`a[href^="mailto:${SUPPORT_EMAIL}"]`);
    if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    openSupportChat();
  });
}

export function onRouteDidUpdate() {
  updateSupportChatPage();
}
