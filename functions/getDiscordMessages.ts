import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('discord');
    const guildId = Deno.env.get('DISCORD_GUILD_ID');

    if (!guildId) {
      return Response.json({ error: 'Discord guild not configured' }, { status: 500 });
    }

    // Get all channels
    const channelsResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const channels = await channelsResponse.json();

    const messages = [];

    // Fetch messages from level and issue channels
    for (const channel of channels) {
      if (!channel.name.startsWith('level-') && !channel.name.startsWith('issue-')) continue;

      const messagesResponse = await fetch(
        `https://discord.com/api/v10/channels/${channel.id}/messages?limit=2`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );

      if (messagesResponse.ok) {
        const channelMessages = await messagesResponse.json();
        channelMessages.forEach(msg => {
          messages.push({
            id: msg.id,
            content: msg.content,
            channel: channel.name,
            timestamp: msg.timestamp,
            author: msg.author.username
          });
        });
      }
    }

    // Sort by timestamp and return top 6
    const sorted = messages
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 6);

    return Response.json(sorted);
  } catch (error) {
    console.error('Error fetching Discord messages:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});