const { getPool } = require('./db');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.DATABASE_URL) return res.json({ ok: true });

  const pool = await getPool();
  const { conversationId, messages } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const msg of messages) {
      await client.query(
        'INSERT INTO messages (conversation_id, role, text) VALUES ($1, $2, $3)',
        [conversationId, msg.role, msg.text]
      );
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }

  res.json({ ok: true });
};
