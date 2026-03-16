const token = process.env.TELEGRAM_BOT_TOKEN;
const defaultChatId = process.env.TELEGRAM_CHAT_ID;

function topicFor(agentId) {
  try {
    const raw = process.env.TELEGRAM_TOPICS_JSON || '{}';
    const map = JSON.parse(raw);
    return map?.[agentId] || null;
  } catch {
    return null;
  }
}

export async function sendTelegram(text, opts = {}) {
  if (!token || !defaultChatId) return { ok: false, skipped: true, reason: 'telegram-not-configured' };

  const body = {
    chat_id: opts.chatId || defaultChatId,
    text,
    disable_web_page_preview: true,
  };

  const topicId = opts.topicId || (opts.agentId ? topicFor(opts.agentId) : null);
  if (topicId) body.message_thread_id = Number(topicId);

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return { ok: !!data.ok, data };
}
