const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const products = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data', 'products.json'), 'utf-8')
);

const paints = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data', 'paints.json'), 'utf-8')
);

app.get('/api/products', (req, res) => {
  let result = [...products];
  const { series, sort } = req.query;
  if (series && series !== 'all') result = result.filter(p => p.series === series);
  if (sort === 'name-asc') result.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  if (sort === 'name-desc') result.sort((a, b) => b.name.localeCompare(a.name, 'ru'));
  res.json(result);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Not found' });
  res.json(product);
});

app.get('/api/paints', (req, res) => {
  res.json(paints);
});

app.post('/api/contact', (req, res) => {
  const { name, phone, email, message, msg } = req.body;
  if (!name || !phone) return res.status(400).json({ error: 'Name and phone required' });
  const entry = { name, phone, email: email || '-', message: message || msg || '-', date: new Date().toISOString() };
  const logPath = path.join(__dirname, 'data', 'messages.json');
  let messages = [];
  try { messages = JSON.parse(fs.readFileSync(logPath, 'utf-8')); } catch (e) { /* file may not exist */ }
  messages.push(entry);
  fs.writeFileSync(logPath, JSON.stringify(messages, null, 2));
  console.log(`[CONTACT] ${name} - ${phone}`);
  res.json({ success: true, message: 'Спасибо! Мы свяжемся с вами в ближайшее время.' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n  🏭 Стальной Стиль — сервер запущен`);
  console.log(`  ───────────────────────────────`);
  console.log(`  🌐 http://localhost:${PORT}`);
  console.log(`  📧 API:  http://localhost:${PORT}/api`);
  console.log(`\n  Нажмите Ctrl+C для остановки\n`);
});
