import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const SUPPORTED_TYPES = ['audio/wav', 'audio/mpeg', 'audio/mp3'];
const SUPPORTED_EXTS  = ['.wav', '.mp3'];

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const audioFile = formData.get('audio');

    if (!(audioFile instanceof File)) {
      return Response.json({ error: 'Missing audio file', stage: 'upload' }, { status: 400 });
    }

    const originalName = audioFile.name;
    const originalMime = audioFile.type;
    const ext = originalName.slice(originalName.lastIndexOf('.')).toLowerCase();

    console.log(`[normalizeAudio] Received: name=${originalName}, mime=${originalMime}, ext=${ext}, size=${audioFile.size} bytes`);

    const mimeOk = SUPPORTED_TYPES.some(t => originalMime.startsWith(t));
    const extOk  = SUPPORTED_EXTS.includes(ext);

    if (!mimeOk || !extOk) {
      const reason = `Unsupported format: name="${originalName}", mime="${originalMime}", ext="${ext}". ` +
        `Supported formats: ${SUPPORTED_TYPES.join(', ')} (${SUPPORTED_EXTS.join(', ')}).`;
      console.error(`[normalizeAudio] Rejected — ${reason}`);
      return Response.json({ error: reason, stage: 'upload' }, { status: 415 });
    }

    const uploadRes = await base44.integrations.Core.UploadFile({ file: audioFile });
    console.log(`[normalizeAudio] Uploaded: ${uploadRes.file_url}`);

    return Response.json({ normalizedFileUrl: uploadRes.file_url });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[normalizeAudio]', message);
    return Response.json({ error: message, stage: 'upload' }, { status: 500 });
  }
});