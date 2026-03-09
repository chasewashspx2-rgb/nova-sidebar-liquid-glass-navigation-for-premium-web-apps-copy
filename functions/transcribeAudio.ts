import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const audioFile = formData.get('audio');
    const elapsed = parseInt(formData.get('elapsed') || '0');
    const sessionTitle = formData.get('sessionTitle') || '';

    if (!audioFile) {
      return Response.json({ error: 'Missing audio file' }, { status: 400 });
    }

    // Upload the audio file to Base44 storage
    const uploadRes = await base44.integrations.Core.UploadFile({ file: audioFile });

    // Transcribe the audio using the file URL
    const transcript = await base44.integrations.Core.InvokeLLM({
      prompt: "Transcribe the following audio file. Return only the transcribed text, nothing else.",
      file_urls: [uploadRes.file_url],
      model: "gemini_3_flash",
    });

    // Analyze the transcript using LLM with structured output
    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an elite trading psychology coach deeply versed in Mark Douglas's principles of trading discipline, emotional control, and the psychology of consistent trading success.

Analyze this trader's session transcript and identify:
1. The single biggest psychological problem or behavioral tendency (e.g., FOMO, fear, revenge trading, lack of conviction, overconfidence).
2. The trader's thought process and decision-making patterns.
3. Specific bad habits or undisciplined behaviors evident in their words.
4. A clear, actionable solution grounded in Mark Douglas principles of discipline, risk management mindset, and neutral observation.
5. A summary of key insights and behavioral patterns observed.
6. A mental state score (1-10) based on the trader's psychological readiness to trade:
   - 1-2: Highly emotional, impulsive, not ready to trade
   - 3-4: Stressed, anxious, caution strongly advised
   - 5-6: Neutral state, acceptable to trade with heightened discipline
   - 7-8: Focused, disciplined, good mental state
   - 9-10: Optimal psychological state for trading
7. A specific trading recommendation based on the mental state score (e.g., "Take a break and reset", "Proceed but with extreme discipline", "Optimal conditions to trade").

Transcript:
"${transcript}"

Respond in JSON with all fields.`,
      response_json_schema: {
        type: "object",
        properties: {
          problem_identified: { type: "string" },
          proposed_solution: { type: "string" },
          summary: { type: "string" },
          patterns: { type: "array", items: { type: "string" } },
          recommendations: { type: "array", items: { type: "string" } },
          mental_state_score: { type: "number" },
          trading_recommendation: { type: "string" },
        },
      },
      model: "gemini_3_flash",
    });

    // Create the trading session record
    const newSession = await base44.entities.TradingSession.create({
      started_at: new Date(Date.now() - elapsed * 1000).toISOString(),
      ended_at: new Date().toISOString(),
      status: "completed",
      audio_file_uri: uploadRes.file_url,
      full_transcript: transcript,
      problem_identified: analysis.problem_identified,
      proposed_solution: analysis.proposed_solution,
      summary: analysis.summary,
      patterns: analysis.patterns || [],
      recommendations: analysis.recommendations || [],
      overall_score: analysis.mental_state_score,
      session_title: sessionTitle || `Session — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
    });

    return Response.json(newSession);
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});