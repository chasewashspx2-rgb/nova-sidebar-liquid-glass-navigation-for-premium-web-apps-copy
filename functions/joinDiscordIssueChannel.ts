import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { issueType } = body;

    const botToken = Deno.env.get('DISCORD_BOT_TOKEN');
    const guildId = Deno.env.get('DISCORD_GUILD_ID');

    if (!guildId) {
      return Response.json({ error: 'Discord guild not configured' }, { status: 500 });
    }

    const channelName = `issue-${issueType}`;

    // Get or create issue channel
    const channelsResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
      headers: { Authorization: `Bot ${botToken}` }
    });
    const channels = await channelsResponse.json();
    let issueChannel = channels.find(c => c.name === channelName);

    if (!issueChannel) {
      const createChannelResponse = await fetch(
        `https://discord.com/api/v10/guilds/${guildId}/channels`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bot ${botToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: channelName,
            type: 0,
            topic: `Discussion channel for traders dealing with ${issueType}`
          })
        }
      );
      issueChannel = await createChannelResponse.json();
    }

    return Response.json({ success: true, channel: channelName, channelId: issueChannel.id });
  } catch (error) {
    console.error('Error joining Discord channel:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});