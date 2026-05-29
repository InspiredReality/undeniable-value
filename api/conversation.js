const { getPool } = require('./db');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.DATABASE_URL) return res.json([]);

  const pool = await getPool();
  const { id } = req.query;

  const { rows } = await pool.query(
    'SELECT role, text FROM messages WHERE conversation_id = $1 ORDER BY created_at',
    [id]
  );
  return res.json(rows);
};
