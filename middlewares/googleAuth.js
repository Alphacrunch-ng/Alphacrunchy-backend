const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, 'postmessage');

async function verifyGoogleToken(idToken) {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return {
      googleId: payload.sub,
      email: payload.email,
      fullName: payload.name,
      confirmedEmail: true,
    };
  } catch (error) {
    throw error;
  }
  
}

const fetchIdToken = async (code) => {
  const tokenInfo = await client.getToken(code);
  return tokenInfo.tokens.id_token;
};

module.exports = {
  verifyGoogleToken,
  fetchIdToken
};
