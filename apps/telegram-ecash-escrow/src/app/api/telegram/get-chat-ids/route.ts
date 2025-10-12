import { NextRequest, NextResponse } from 'next/server';

/**
 * Helper endpoint to get Telegram chat IDs for setup
 * GET /api/telegram/get-chat-ids
 *
 * This is a temporary endpoint to help you find your group/channel ID
 * Remove this file after you've configured TELEGRAM_ALERT_CHANNEL_ID
 */
export async function GET(request: NextRequest) {
  const botToken = process.env.BOT_TOKEN;

  if (!botToken) {
    return NextResponse.json(
      {
        error: 'BOT_TOKEN not configured',
        message: 'Please set BOT_TOKEN in your .env file'
      },
      { status: 500 }
    );
  }

  try {
    // Get recent updates from Telegram
    const response = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates`, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`Telegram API returned ${response.status}`);
    }

    const data = await response.json();

    if (!data.ok) {
      return NextResponse.json(
        {
          error: 'Telegram API error',
          details: data
        },
        { status: 500 }
      );
    }

    // Extract chat information from updates
    const chats = new Map();

    data.result.forEach((update: any) => {
      const chat = update.message?.chat || update.my_chat_member?.chat;
      if (chat) {
        chats.set(chat.id, {
          id: chat.id,
          title: chat.title || chat.first_name || 'Unknown',
          type: chat.type,
          username: chat.username
        });
      }
    });

    const chatList = Array.from(chats.values());

    // Separate by type
    const groups = chatList.filter(c => c.type === 'group' || c.type === 'supergroup');
    const channels = chatList.filter(c => c.type === 'channel');
    const privateChats = chatList.filter(c => c.type === 'private');

    return NextResponse.json({
      success: true,
      message: 'Chat IDs found! Copy the ID you need and add it to TELEGRAM_ALERT_CHANNEL_ID in your .env file',
      groups: groups.length > 0 ? groups : undefined,
      channels: channels.length > 0 ? channels : undefined,
      privateChats: privateChats.length > 0 ? privateChats : undefined,
      allChats: chatList,
      instructions: {
        step1: 'Find your group/channel in the list above',
        step2: 'Copy the "id" value (should be negative, e.g., -123456789)',
        step3: 'Add to .env: TELEGRAM_ALERT_CHANNEL_ID="-123456789"',
        step4: 'Restart your app',
        step5: 'DELETE THIS FILE (src/app/api/telegram/get-chat-ids/route.ts) for security'
      },
      troubleshooting: {
        noChatsSeen: "If you don't see your group/channel:",
        solution1: '1. Make sure your bot is added to the group/channel',
        solution2: '2. Make sure bot is an admin in the group/channel',
        solution3: '3. Send a message in the group (e.g., "test")',
        solution4: '4. Refresh this page'
      }
    });
  } catch (error) {
    console.error('Error fetching Telegram updates:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch updates',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: 'Make sure BOT_TOKEN is correct in .env'
      },
      { status: 500 }
    );
  }
}
