import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getAccessToken } from "../app/lib/spotify";

export default function Callback() {
  const router = useRouter();
  const { code } = router.query;
  const [token, setToken] = useState(null);

  useEffect(() => {
    if (code) {
      getAccessToken(code).then((token) => {
        setToken(token);
        localStorage.setItem("spotify_access_token", token);
        router.push("/search");
      });
    }
  }, [code]);

  return <div>Loading...</div>;
}
