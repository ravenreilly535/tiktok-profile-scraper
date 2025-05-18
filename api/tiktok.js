const fetch = require('node-fetch');
const cheerio = require('cheerio');

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

    const $ = cheerio.load(html);

    const scriptContent = $('#SIGI_STATE').html();
    if (!scriptContent) {
      return res.status(404).json({ error: "Profile data not found" });
    }

    const data = JSON.parse(scriptContent);

    const user = data.UserModule.users[username];
    const stats = data.UserModule.stats[username];

    if (!user || !stats) {
      return res.status(404).json({ error: "User info missing" });
    }

    const profile = {
      username: user.uniqueId,
      displayName: user.nickname,
      avatar: user.avatarLarger,
      bio: user.signature,
      followers: stats.followerCount,
      following: stats.followingCount,
      likes: stats.heartCount,
    };

    res.status(200).json(profile);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
