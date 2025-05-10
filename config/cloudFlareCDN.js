const fs = require("fs");
const path = require("path");
const tus = require("tus-js-client");

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

const CloudflareStreamService = {
  uploadVideo: (title, filePath, options = {}) =>
    new Promise((resolve, reject) => {
      const fileStream = fs.createReadStream(filePath);
      const fileSize = fs.statSync(filePath).size;
      let mediaId = "";

      const upload = new tus.Upload(fileStream, {
        endpoint: `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream`,
        chunkSize: 50 * 1024 * 1024, // 50 MB
        uploadSize: fileSize,
        metadata: {
          name: title,
          filetype: "video/mp4",
          ...(options.meta || {}),
        },
        headers: {
          Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
        },
        retryDelays: [0, 3000, 5000, 10000, 20000],

        onError: (error) => {
          resolve({ success: false, error: error.message || error });
        },

        onAfterResponse: (req, res) => {
          return new Promise((resCb) => {
            const streamMediaId = res.getHeader("stream-media-id");
            if (streamMediaId) {
              mediaId = streamMediaId;
            }
            resCb();
          });
        },

        onSuccess: () => {
          if (mediaId) {
            resolve({
              success: true,
              uid: mediaId,
              playback: {
                hls: `https://videodelivery.net/${mediaId}/manifest/video.m3u8`,
                mp4: `https://videodelivery.net/${mediaId}/manifest/default.mpd`,
              },
            });
          } else {
            resolve({ success: false, error: "Missing stream-media-id in response." });
          }
        },
      });

      upload.start();
    }),
    deleteVideo: async (uid) => {
      try {
        const response = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/${uid}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
            },
          }
        );

        const data = await response.json();
        if (data.success) {
          return { success: true, message: "Video deleted successfully." };
        } else {
          return { success: false, error: data.errors };
        }
      } catch (err) {
        return { success: false, error: err.message || err };
      }
    },
};




module.exports = CloudflareStreamService;
