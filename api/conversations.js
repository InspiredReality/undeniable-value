const { getPool } = require('./db');

module.exports = async function handler(req, res) {
  if (!process.env.DATABASE_URL) {
    return res.json(req.method === 'GET' ? [] : { error: 'No database configured' });
  }

  const pool = await getPool();

  if (req.method === 'GET') {
    const { page } = req.query;
    const { rows } = await pool.query(
      'SELECT id, title, created_at FROM conversations WHERE page = $1 ORDER BY created_at DESC LIMIT 50',
      [page]
    );
    return res.json(rows);
  }

  if (req.method === 'POST') {
    const { page, title } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO conversations (page, title) VALUES ($1, $2) RETURNING id, title, created_at',
      [page, title]
    );
    return res.json(rows[0]);
  }

  res.status(405).json({ error: 'Method not allowed' });
};
