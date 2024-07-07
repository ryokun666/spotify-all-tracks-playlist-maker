import axios from "axios";

const client_id = process.env.NEXT_PUBLIC_CLIENT_ID; // クライアントID
const client_secret = process.env.NEXT_PUBLIC_CLIENT_SECRET; // クライアントシークレット
const redirect_uri = process.env.NEXT_PUBLIC_REDIRECT_URI; // リダイレクトURI

const authEndpoint = "https://accounts.spotify.com/authorize";
const tokenEndpoint = "https://accounts.spotify.com/api/token";

const getAccessToken = async (code) => {
  const response = await axios.post(
    tokenEndpoint,
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri,
      client_id,
      client_secret,
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  return response.data.access_token;
};

export { authEndpoint, getAccessToken, client_id, redirect_uri };
