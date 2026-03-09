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

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('discord');
    const guildId = Deno.env.get('DISCORD_GUILD_ID');

    if (!guildId) {
      return Response.json({ error: 'Discord guild not configured' }, { status: 500 });
    }

    const channelName = `issue-${issueType}`;

    // Get Discord user ID
    const meResponse = await fetch('https://discord.com/api/v10/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const discordUser = await meResponse.json();
    const discordUserId = discordUser.id;

    // Get or create issue channel
    const channelsResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const channels = await channelsResponse.json();
    let issueChannel = channels.find(c => c.name === channelName);

    if (!issueChannel) {
      const createChannelResponse = await fetch(
        `https://discord.com/api/v10/guilds/${guildId}/channels`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
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

    // Add user to issue channel
    const addResponse = await fetch(
      `https://discord.com/api/v10/channels/${issueChannel.id}/members/${discordUserId}`,
      {
        method: 'PUT',
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    if (!addResponse.ok && addResponse.status !== 204) {
      const error = await addResponse.json();
      return Response.json({ error: error.message }, { status: addResponse.status });
    }

    return Response.json({ success: true, channel: channelName });
  } catch (error) {
    console.error('Error joining Discord channel:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});