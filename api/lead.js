export default async function handler(req, res) {
  // Configurazione CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      body = {};
    }
  }

  const { name, platform, contact, username } = body || {};
  const contactVal = String(contact || username || '').trim();

  if (!contactVal) {
    return res.status(400).json({ error: 'Contatto mancante' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN || '8665429786:AAEBBdBXq10mGTt2HUcrL40YfYDBpgiSbV8';
  const chatId = process.env.TELEGRAM_CHAT_ID || '7535995995';

  // Se i dati del bot non sono impostati, non blocchiamo il sito
  if (!token || !chatId) {
    console.warn('TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID non configurati.');
    return res.status(200).json({
      success: true,
      delivered: false,
      warning: 'Variabili TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID non configurate'
    });
  }

  // Sanitizzazione per il formato HTML di Telegram
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  const safeName = escapeHtml(name || 'Non specificato');
  const selectedPlatform = String(platform || 'telegram').toLowerCase();
  const safeContact = escapeHtml(contactVal);

  const now = new Date().toLocaleString('it-IT', {
    timeZone: 'Europe/Rome',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const lines = [
    '🚨 <b>NUOVO CONTATTO SUL SITO DETAILS</b> 🚨',
    '',
    `👤 <b>Nome:</b> ${safeName}`
  ];

  if (selectedPlatform === 'signal') {
    lines.push(`📱 <b>Piattaforma:</b> <b>SIGNAL</b> 🔵`);
    lines.push(`💬 <b>Contatto Signal:</b> <code>${safeContact}</code>`);
    lines.push(`📅 <b>Ricevuto il:</b> ${now}`);
    lines.push('');
    lines.push(`👉 <i>Copia il contatto e cercalo direttamente sull'app Signal</i>`);
  } else {
    const cleanUsername = contactVal.replace(/^@/, '').trim();
    const isPhone = /^[+0-9\s-]+$/.test(cleanUsername);
    const tgLink = (!isPhone && cleanUsername) ? `https://t.me/${cleanUsername}` : '';
    const safeDisplay = escapeHtml(!isPhone && cleanUsername ? `@${cleanUsername}` : contactVal);

    lines.push(`📱 <b>Piattaforma:</b> <b>TELEGRAM</b> ✈️`);
    lines.push(`💬 <b>Contatto Telegram:</b> ${tgLink ? `<a href="${tgLink}">${safeDisplay}</a>` : `<code>${safeDisplay}</code>`}`);
    lines.push(`📅 <b>Ricevuto il:</b> ${now}`);
    lines.push('');
    if (tgLink) {
      lines.push(`👉 <a href="${tgLink}"><b>CLICCA QUI PER CHATTARE CON IL CLIENTE</b></a>`);
    } else {
      lines.push(`👉 <i>Copia il numero e cercalo su Telegram</i>`);
    }
  }

  const messageText = lines.join('\n');

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });

    const tgData = await tgRes.json();

    if (!tgRes.ok || !tgData.ok) {
      console.error('Errore invio Telegram:', tgData);
      return res.status(502).json({
        error: 'Errore durante la consegna del messaggio a Telegram',
        details: tgData
      });
    }

    return res.status(200).json({
      success: true,
      delivered: true
    });
  } catch (error) {
    console.error('Errore chiamata Telegram API:', error);
    return res.status(500).json({
      error: 'Errore interno del server',
      message: error.message
    });
  }
}
