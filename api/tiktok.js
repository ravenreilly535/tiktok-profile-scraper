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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Referer': 'https://www.tiktok.com/',
        'Cookie': 'tt_webid_v2=1234567890;', // dummy cookie, may help bypass some restrictions
      }
    });

    if (!response.ok) {
      return res.status(404).json({ error: "User not found or blocked" });
    }

    const html = await response.text();

    const $ = cheerio.load(html);

    const scriptTag = $('#__NEXT_DATA__').html();
    if (!scriptTag) {
      return res.status(404).json({ error: "Profile data script not found" });
    }

    const jsonData = JSON.parse(scriptTag);

    const userData = jsonData.props?.pageProps?.userInfo?.user;

    if (!userData) {
      return res.status(404).json({ error: "User info missing" });
    }

    const profile = {
      username: userData.uniqueId,
      displayName: userData.nickname,
      avatar: userData.avatarLarger,
      bio: userData.signature,
      followers: userData.followerCount,
      following: userData.followingCount,
      likes: userData.totalFavorited,
    };

    res.status(200).json(profile);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
