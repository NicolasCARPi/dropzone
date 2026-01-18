// A simple test server that serves all files in `test-sites/` and accepts POST
// and PUT requests.
const express = require('express');
const path = require('path');

const app = express();
const port = 8888;

// serve static files from this dir
app.use(express.static(path.join(__dirname, 'test-sites')));
// middleware to parse incoming requests body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Handle all POST requests
app.post('{*splat}', (_, res) => {
  // Send a success response
  res.json({ success: true });
});

// Handle all PUT requests
app.put('{*splat}', (req, res) => {
  // Special handling for URLs that start with `/amazon-multipart-upload`
  if (req.path.startsWith('/amazon-multipart-upload')) {
    const etag = `"${Math.round(Math.random() * 10000)}"`;
    res.set('ETag', etag);
  }
  // Send a success response
  res.json({ success: true });
});
app.listen(port, () => {
  console.log(`Test server running on http://localhost:${port}`);
})
