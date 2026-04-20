const express = require('express');
const { getCameraStreams } = require('./discovery');

const app = express();
const PORT = process.env.PORT || 3000;

let streams = [];

async function initializeStreams() {
  console.log('Fetching camera streams...');
  streams = await getCameraStreams(6);
  if (streams.length === 0) {
    console.error('Failed to fetch any camera streams. Retrying in 1 minute...');
    setTimeout(initializeStreams, 60000);
  } else {
    console.log(`Successfully loaded ${streams.length} camera streams.`);
    streams.forEach((s, i) => console.log(`Stream ${i + 1}: ${s.name} (${s.feed_url})`));
  }
}

// Redirect routes
app.get('/feed/live/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id < 1 || id > streams.length) {
    return res.status(404).send('Stream not found. Available streams are 1 to ' + streams.length);
  }

  const stream = streams[id - 1];
  res.redirect(stream.feed_url);
});

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await initializeStreams();
});
