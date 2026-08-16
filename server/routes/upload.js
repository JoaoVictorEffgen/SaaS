const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Upload routes disponíveis' });
});

module.exports = router;
