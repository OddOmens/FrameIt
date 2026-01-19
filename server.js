const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3005;

// Serve static files from current directory
app.use(express.static('.'));

app.listen(PORT, () => {
    console.log(`\n🚀 FrameIt 2.0 running at http://localhost:${PORT}\n`);
});
