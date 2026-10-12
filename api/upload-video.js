import { handleUpload } from '@vercel/blob/client';

export default async function handler(request, response) {
  // Configurazione CORS per consentire l'upload da qualsiasi client
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  if (request.method === 'GET') {
    const hasToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
    return response.status(200).json({
      status: 'ready',
      configured: hasToken,
      message: hasToken ? 'Vercel Blob pronto all\'uso' : 'Variabile BLOB_READ_WRITE_TOKEN mancante'
    });
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  let body = request.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      body = {};
    }
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        return {
          allowedContentTypes: [
            'video/mp4',
            'video/quicktime',
            'video/webm',
            'video/x-m4v',
            'video/mov',
            'image/jpeg',
            'image/png',
            'image/webp'
          ],
          tokenPayload: JSON.stringify({}),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('Video caricato con successo su Vercel Blob:', blob.url);
      },
    });

    return response.status(200).json(jsonResponse);
  } catch (error) {
    console.error('Errore durante handleUpload:', error);
    return response.status(400).json({
      error: error.message || 'Errore durante la preparazione del caricamento su Vercel Blob'
    });
  }
}
