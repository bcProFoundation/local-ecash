import { NextRequest, NextResponse } from 'next/server';

/**
 * Send critical alerts to Telegram channel or group
 * POST /api/alerts/telegram
 *
 * Works with both:
 * - Telegram Channels (one-way broadcast)
 * - Telegram Groups (team discussion)
 *
 * Body: {
 *   message: string,
 *   severity: 'critical' | 'error' | 'warning' | 'info',
 *   service: string,
 *   details?: any
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, severity = 'error', service, details } = body;

    // Get Telegram configuration from environment
    const botToken = process.env.BOT_TOKEN;
    const alertChannelId = process.env.TELEGRAM_ALERT_CHANNEL_ID;

    if (!botToken) {
      console.error('BOT_TOKEN not configured in environment variables');
      return NextResponse.json({ error: 'Telegram bot token not configured' }, { status: 500 });
    }

    if (!alertChannelId) {
      console.warn('TELEGRAM_ALERT_CHANNEL_ID not configured - alert not sent');
      return NextResponse.json({ warning: 'Alert channel/group not configured', messageSent: false }, { status: 200 });
    }

    // Format the message with severity emoji
    const severityEmojis = {
      critical: '🚨',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    const emoji = severityEmojis[severity as keyof typeof severityEmojis] || '❌';

    // Build the alert message
    let alertMessage = `${emoji} *${severity.toUpperCase()}*: ${service}\n\n`;
    alertMessage += `${message}\n\n`;

    if (details) {
      alertMessage += `*Details:*\n\`\`\`\n${JSON.stringify(details, null, 2)}\n\`\`\`\n\n`;
    }

    alertMessage += `*Time:* ${new Date().toISOString()}\n`;
    alertMessage += `*Environment:* ${process.env.NODE_ENV || 'unknown'}`;

    // Send to Telegram using Bot API
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const telegramResponse = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: alertChannelId,
        text: alertMessage,
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      })
    });

    const telegramData = await telegramResponse.json();

    if (!telegramResponse.ok) {
      console.error('Failed to send Telegram alert:', telegramData);
      return NextResponse.json(
        {
          error: 'Failed to send Telegram alert',
          details: telegramData
        },
        { status: 500 }
      );
    }

    console.log('Telegram alert sent successfully:', {
      service,
      severity,
      messageId: telegramData.result?.message_id
    });

    return NextResponse.json({
      success: true,
      messageSent: true,
      messageId: telegramData.result?.message_id
    });
  } catch (error) {
    console.error('Error sending Telegram alert:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
