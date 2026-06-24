const express = require('express');
const router = express.Router();
const { runScan } = require('../controllers/scanController');

// POST /api/scan — trigger a full scan
router.post('/', runScan);

// GET /api/scan/history — fetch all past scans
router.get('/history', async (req, res) => {
  try {
    const ScanHistory = require('../models/scanHistory');
    const history = await ScanHistory.find()
      .sort({ scannedAt: -1 });
    return res.status(200).json(history);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// DELETE /api/scan/history — clear all history
router.delete('/history', async (req, res) => {
  try {
    const ScanHistory = require('../models/scanHistory');
    await ScanHistory.deleteMany({});
    return res.status(200).json({ message: 'Scan history cleared successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to clear history' });
  }
});

module.exports = router;