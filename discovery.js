const axios = require('axios');

async function getCameraStreams(count = 6) {
  try {
    const response = await axios.get('https://opencctv.org/api/cameras/markers', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const ids = response.data.ids;
    const streams = [];

    // Shuffle ids
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }

    for (let id of ids) {
      try {
        const camRes = await axios.get(`https://opencctv.org/api/cameras/${id}`, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          timeout: 5000
        });
        const cam = camRes.data;
        if (cam.feed_type === 'm3u8' || cam.feed_type === 'mjpeg') {
          streams.push({
            id: cam.id,
            name: cam.name,
            feed_url: cam.feed_url,
            feed_type: cam.feed_type
          });
          if (streams.length >= count) break;
        }
      } catch (e) {
        // ignore errors for individual cameras
      }
    }
    return streams;
  } catch (err) {
    console.error('Error fetching camera markers:', err.message);
    return [];
  }
}

module.exports = { getCameraStreams };
