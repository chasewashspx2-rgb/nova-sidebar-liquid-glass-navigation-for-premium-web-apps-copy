import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { postContent, roomKey, issueType } = body;

    const botToken = Deno.env.get('DISCORD_BOT_TOKEN');
    const guildId = Deno.env.get('DISCORD_GUILD_ID');

    if (!guildId) {
      return Response.json({ error: 'Discord guild not configured' }, { status: 500 });
    }

    // Determine channel name
    let channelName;
    if (roomKey === 'issue') {
      channelName = `issue-${issueType}`;
    } else {
      // Level-based room
      const profiles = await base44.entities.TraderProfile.filter({ created_by: user.email });
      const profile = profiles[0];
      const userLevel = profile?.level || 1;
      const levelRange = Math.floor((userLevel - 1) / 10) * 10;
      channelName = `level-${levelRange + 1}-${levelRange + 10}`;
    }

    // Get channels
    const channelsResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
      headers: { Authorization: `Bot ${botToken}` }
    });
    const channels = await channelsResponse.json();
    let targetChannel = channels.find(c => c.name === channelName);

    // Auto-create channel if it doesn't exist
    if (!targetChannel) {
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
            topic: roomKey === 'issue'
              ? `Discussion channel for traders dealing with ${issueType}`
              : `Trading community for ${channelName}`
          })
        }
      );
      targetChannel = await createChannelResponse.json();
    }

    // Post message to Discord
    const messageResponse = await fetch(
      `https://discord.com/api/v10/channels/${targetChannel.id}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bot ${botToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: `**${user.full_name}**: ${postContent}`,
          allowed_mentions: { parse: [] }
        })
      }
    );

    if (!messageResponse.ok) {
      const error = await messageResponse.json();
      return Response.json({ error: error.message }, { status: messageResponse.status });
    }

    return Response.json({ success: true, channel: channelName });
  } catch (error) {
    console.error('Error syncing post to Discord:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});