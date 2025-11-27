const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Public debug endpoint - no auth required
router.get('/db-test', async (req, res) => {
  const tests = {
    timestamp: new Date().toISOString(),
    env_check: {
      database_url_exists: !!process.env.DATABASE_URL,
      database_url_host: process.env.DATABASE_URL ? 
        process.env.DATABASE_URL.split('@')[1]?.split('/')[0] : 'NOT SET',
      node_env: process.env.NODE_ENV,
      port: process.env.PORT
    },
    connection_test: null
  };

  try {
    const start = Date.now();
    const result = await pool.query('SELECT NOW() as time, current_database() as db, version() as pg_version');
    const duration = Date.now() - start;
    
    tests.connection_test = {
      status: 'SUCCESS',
      duration_ms: duration,
      server_time: result.rows[0].time,
      database: result.rows[0].db,
      postgres_version: result.rows[0].pg_version.substring(0, 60)
    };
  } catch (error) {
    tests.connection_test = {
      status: 'FAILED',
      error_message: error.message,
      error_code: error.code,
      error_host: error.hostname || 'unknown',
      error_stack: error.stack ? error.stack.substring(0, 200) : 'no stack'
    };
  }

  res.json(tests);
});

module.exports = router;
