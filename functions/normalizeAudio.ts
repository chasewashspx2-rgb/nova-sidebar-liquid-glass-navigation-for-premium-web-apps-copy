import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const audioFile = formData.get('audio');

    if (!(audioFile instanceof File)) {
      return Response.json({ error: 'Missing audio file', stage: 'normalize' }, { status: 400 });
    }

    const originalName = audioFile.name;
    const originalMime = audioFile.type;
    console.log(`[normalizeAudio] Received: ${originalName} (${originalMime}), size: ${audioFile.size} bytes`);

    // iOS records AAC audio in an MP4 container (.mp4).
    // .m4a is the identical container — relabeling is enough for InvokeLLM to accept it.
    const isMP4 = originalMime === 'audio/mp4' || originalMime === 'video/mp4' || originalName.endsWith('.mp4');

    let fileToUpload = audioFile;
    let normalizedMime = originalMime;
    let normalizedName = originalName;
    let wasConverted = false;

    if (isMP4) {
      normalizedMime = 'audio/m4a';
      normalizedName = originalName.replace(/\.mp4$/, '.m4a');
      fileToUpload = new File([audioFile], normalizedName, { type: normalizedMime });
      wasConverted = true;
      console.log(`[normalizeAudio] Converted ${originalName} → ${normalizedName}`);
    }

    const uploadRes = await base44.integrations.Core.UploadFile({ file: fileToUpload });
    console.log(`[normalizeAudio] Uploaded: ${uploadRes.file_url}`);

    return Response.json({
      normalizedFileUrl: uploadRes.file_url,
      normalizedMimeType: normalizedMime,
      originalFileName: originalName,
      normalizedFileName: normalizedName,
      wasConverted,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[normalizeAudio]', message);
    return Response.json({ error: message, stage: 'normalize' }, { status: 500 });
  }
});