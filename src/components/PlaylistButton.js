import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { Snackbar, Alert, Button, Typography, Link } from "@mui/material";
import axios from "axios";

const PlaylistButton = ({ tracks, artistName }) => {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("info");
  const [playlistDetails, setPlaylistDetails] = useState(null); // To store playlist name and URL

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const chunkArray = (array, size) => {
    const chunkedArr = [];
    for (let i = 0; i < array.length; i += size) {
      chunkedArr.push(array.slice(i, i + size));
    }
    return chunkedArr;
  };

  const createPlaylist = async () => {
    if (!session || tracks.length === 0) return;

    const token = session.user.accessToken;
    const userId = session.user.id;

    try {
      const createResponse = await axios.post(
        `https://api.spotify.com/v1/users/${userId}/playlists`,
        {
          name: `【全曲】${artistName}`,
          description: `Created on ${new Date().toISOString().slice(0, 10)}`,
          public: true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const playlistId = createResponse.data.id;
      const playlistUrl = `https://open.spotify.com/playlist/${playlistId}`;
      const trackUris = tracks.map((track) => track.uri);
      const trackChunks = chunkArray(trackUris, 100);

      for (const trackChunk of trackChunks) {
        await axios.post(
          `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
          { uris: trackChunk },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      setMessage(
        `プレイリスト "${createResponse.data.name}" が作成されました！`
      );
      setSeverity("success");
      setPlaylistDetails({
        name: createResponse.data.name,
        url: playlistUrl,
      });
      setOpen(true);
    } catch (error) {
      console.error("Error creating playlist:", error);
      setMessage("プレイリストの作成に失敗しました・・・");
      setSeverity("error");
      setOpen(true);
    }
  };

  return (
    <>
      <Button onClick={createPlaylist} variant="contained" color="primary">
        Create Playlist All Tracks
      </Button>
      {playlistDetails && (
        <Typography mt={2}>
          <p> 作成したプレイリスト</p>
          <Link href={playlistDetails.url} target="_blank">
            {playlistDetails.name}
          </Link>
        </Typography>
      )}
      <Snackbar open={open} autoHideDuration={5000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={severity} sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PlaylistButton;
