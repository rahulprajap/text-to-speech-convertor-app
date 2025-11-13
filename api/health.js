module.exports = async (req, res) => {
  res.json({
    status: 'OK',
    message: 'Voice Generator API is running',
    elevenlabs_configured: !!process.env.ELEVENLABS_API_KEY
  });
};

