const fetch = require('node-fetch');

module.exports = async function handler(req, res) {
  const { username } = req.query;
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    const url = `https://www.tiktok.com/@${username}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });

    if (!response.ok) {
      return res.status(404).json({ error: "User not found or blocked" });
    }

    const html = await response.text();

    // Step: HTML content ko response mein bhej den
    res.status(200).send(html);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
