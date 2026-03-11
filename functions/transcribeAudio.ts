import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Receives a pre-normalized (non-.mp4) file URL and returns a transcript string.
// Normalization (mp4 → m4a) is handled upstream by normalizeAudio.js.

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { normalizedFileUrl } = await req.json();

    if (!normalizedFileUrl) {
      return Response.json({ error: 'Missing normalizedFileUrl', stage: 'transcribe' }, { status: 400 });
    }

    console.log(`[transcribeAudio] Transcribing: ${normalizedFileUrl}`);

    const transcript = await base44.integrations.Core.InvokeLLM({
      prompt: 'Transcribe the following audio file verbatim. Return only the transcribed text, nothing else. If the audio is unclear or empty, return an empty string.',
      file_urls: [normalizedFileUrl],
      model: 'gemini_3_flash',
    });

    console.log(`[transcribeAudio] Transcript length: ${(transcript || '').length} chars`);
    return Response.json({ transcript: transcript || '' });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[transcribeAudio]', message);
    return Response.json({ error: message, stage: 'transcribe' }, { status: 500 });
  }
});