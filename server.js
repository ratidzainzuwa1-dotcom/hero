const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
// Serve static files from workspace root
app.use(express.static(path.join(__dirname)));

// Load demo data into memory on startup and keep it in-memory
const DATA_FILE = path.join(__dirname, 'demo', 'team-buys.json');
let demoData = [];
function loadDemoData(){
  try{
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    demoData = JSON.parse(raw);
  }catch(e){
    console.error('Failed to load demo data, starting with empty array', e);
    demoData = [];
  }
}
function persistDemoData(){
  try{
    fs.writeFileSync(DATA_FILE, JSON.stringify(demoData, null, 2), 'utf8');
  }catch(e){
    console.error('Failed to persist demo data', e);
  }
}

loadDemoData();

app.get('/api/team-buys', (req, res) => {
  res.json(demoData);
});

app.get('/api/team-buys/:id', (req, res) => {
  const id = req.params.id;
  const item = demoData.find(d => String(d.id) === String(id));
  if(!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

// Join a team buy (demo-only, in-memory + persisted to demo/team-buys.json)
app.post('/api/team-buys/:id/join', (req, res) => {
  const id = req.params.id;
  const { name, amount } = req.body || {};
  const numeric = Number(amount || 0);
  if(!name || !numeric || numeric <= 0) return res.status(400).json({ error: 'Invalid payload' });
  const item = demoData.find(d => String(d.id) === String(id));
  if(!item) return res.status(404).json({ error: 'Team buy not found' });
  // update fields (support both `raised` and `joined` naming)
  item.raised = (item.raised || item.joined || 0) + numeric;
  // push contributor
  item.contributors = item.contributors || [];
  item.contributors.push({ name: String(name), amount: numeric });
  // persist
  persistDemoData();
  res.json({ ok: true, item });
});

app.listen(PORT, () => console.log(`Mini Group demo server running on http://localhost:${PORT}`));
