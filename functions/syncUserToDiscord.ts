import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const botToken = Deno.env.get('DISCORD_BOT_TOKEN');
    const guildId = Deno.env.get('DISCORD_GUILD_ID');

    if (!guildId) {
      return Response.json({ error: 'Discord guild not configured' }, { status: 500 });
    }

    // Get user's trader profile to determine level
    const profiles = await base44.entities.TraderProfile.filter({ created_by: user.email });
    const profile = profiles[0];
    
    const userLevel = profile?.level || 1;
    const levelRange = Math.floor((userLevel - 1) / 10) * 10;
    const levelChannelName = `level-${levelRange + 1}-${levelRange + 10}`;

    // Get or create level channel
    const channelsResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
      headers: { Authorization: `Bot ${botToken}` }
    });
    const channels = await channelsResponse.json();
    let levelChannel = channels.find(c => c.name === levelChannelName);

    if (!levelChannel) {
      const createChannelResponse = await fetch(
        `https://discord.com/api/v10/guilds/${guildId}/channels`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bot ${botToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: levelChannelName,
            type: 0,
            topic: `Trading community for levels ${levelRange + 1}-${levelRange + 10}`
          })
        }
      );
      levelChannel = await createChannelResponse.json();
    }

    return Response.json({
      success: true,
      levelChannel: levelChannel.name,
      channelId: levelChannel.id,
      guildId,
      userLevel
    });
  } catch (error) {
    console.error('Error syncing user to Discord:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});