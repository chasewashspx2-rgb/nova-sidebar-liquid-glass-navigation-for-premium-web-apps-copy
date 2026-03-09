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

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('discord');
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
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const channels = await channelsResponse.json();
    const targetChannel = channels.find(c => c.name === channelName);

    if (!targetChannel) {
      return Response.json({ error: 'Channel not found', channel: channelName }, { status: 404 });
    }

    // Post message to Discord
    const messageResponse = await fetch(
      `https://discord.com/api/v10/channels/${targetChannel.id}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
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