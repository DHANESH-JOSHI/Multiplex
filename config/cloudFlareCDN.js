const FormData = require('form-data');
const fetch = require('node-fetch');
const fs = require("fs");

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

const CloudflareStreamService = {
  async uploadVideo(title,file, options = {}) {
    try {
      const form = new FormData();
      form.append('file', fs.createReadStream(file), title);

      if (options.creator) form.append('creator', options.creator);
      if (options.meta) form.append('meta', JSON.stringify(options.meta));
      if (options.requireSignedURLs !== undefined) {
        form.append('requireSignedURLs', String(options.requireSignedURLs));
      }

      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
            ...form.getHeaders(),
          },
          body: form,
        }
      );

      const data = await response.json();
      if (data && data.success) {
        return {
          success: true,
          uid: data.result.uid,
          playback: {
            hls: `https://videodelivery.net/${data.result.uid}/manifest/video.m3u8`,
            mp4: `https://videodelivery.net/${data.result.uid}/manifest/default.mpd`,
          },
        };
      }

      return { success: false, error: data.errors };
    } catch (err) {
      return { success: false, error: err.message || err };
    }
  },
};

module.exports = CloudflareStreamService;
