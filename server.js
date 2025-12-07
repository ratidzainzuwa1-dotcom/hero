const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from workspace root
app.use(express.static(path.join(__dirname)));

app.get('/api/team-buys', (req, res) => {
  const file = path.join(__dirname, 'demo', 'team-buys.json');
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read demo data' });
    try{
      const json = JSON.parse(data);
      res.json(json);
    }catch(e){
      res.status(500).json({ error: 'Invalid demo JSON' });
    }
  });
});

app.listen(PORT, () => console.log(`Mini Group demo server running on http://localhost:${PORT}`));
