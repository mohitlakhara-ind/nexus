// Basic util to fire HTTP POST webhooks
const triggerWebhook = async (url, graphTitle, action, userStr) => {
  if (!url || !url.trim().startsWith('http')) return;

  try {
    const payload = {
      content: `**Nexus Update:** The map "${graphTitle}" was ${action} by ${userStr}.`,
      embeds: [{
        title: graphTitle,
        description: `Map was recently ${action}. Check your dashboard.`,
        color: 3447003 // Blue
      }]
    };

    // Works nicely for Discord out-of-the-box. Slack/Others might need format tweaking.
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn('Webhook delivery failed:', err.message);
  }
};

module.exports = { triggerWebhook };
