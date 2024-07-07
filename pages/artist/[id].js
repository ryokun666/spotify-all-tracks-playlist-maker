import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { useSession, signIn } from "next-auth/react";
import ArtistSearch from "../../src/components/ArtistSearch";
import PlaylistButton from "../../src/components/PlaylistButton";
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  Grid,
  Avatar,
  Divider,
  Box,
} from "@mui/material";

export default function Artist() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const [artist, setArtist] = useState(null);
  const [albums, setAlbums] = useState([]); // This state might not be used if not displayed.
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true); // 追加: ローディング状態の管理

  useEffect(() => {
    if (id && session) {
      fetchArtistDetails();
    }
  }, [id, session]);

  const fetchArtistDetails = async () => {
    if (!session) {
      signIn();
      return;
    }

    const token = session.user.accessToken;
    setLoading(true); // データ取得開始時にローディングをtrueに

    try {
      const artistResponse = await axios.get(
        `https://api.spotify.com/v1/artists/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setArtist(artistResponse.data);

      const albumResponse = await axios.get(
        `https://api.spotify.com/v1/artists/${id}/albums?include_groups=album,single`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const uniqueAlbums = getUniqueAlbums(albumResponse.data.items);
      setAlbums(uniqueAlbums);
      await fetchTracks(uniqueAlbums, token);
    } catch (error) {
      console.error("Error fetching artist details:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUniqueAlbums = (albums) => {
    const uniqueIds = new Set(albums.map((album) => album.id));
    return albums.filter((album) => uniqueIds.has(album.id));
  };

  // トラックの取得処理
  const fetchTracks = async (albums, token) => {
    let allTracks = [];
    for (const album of albums) {
      const trackResponse = await axios.get(
        `https://api.spotify.com/v1/albums/${album.id}/tracks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const tracksWithAlbum = trackResponse.data.items.map((track) => ({
        ...track,
        albumImage: album.images[0]?.url,
      }));
      allTracks = [...allTracks, ...tracksWithAlbum];
    }
    setTracks(allTracks);
  };

  // ローディング状態の表示
  if (loading) {
    return <div>Loading...</div>;
  }

  if (!artist) {
    return <div>No artist data.</div>;
  }

  return (
    <Container>
      <ArtistSearch />
      <Grid container spacing={2} alignItems="center" mt={4}>
        <Grid item xs={12} sm={4}>
          {artist.images.length > 0 && (
            <Avatar
              alt={`Image of ${artist.name}`}
              src={artist.images[0].url}
              style={{ width: "50%", height: "auto" }}
            />
          )}
        </Grid>
        <Grid item xs={12} sm={8}>
          <Typography variant="h4">{artist.name}</Typography>
          <Typography variant="body1">
            {artist.followers.total} followers
          </Typography>
          <Typography variant="body1">
            Genres: {artist.genres.join(", ")}
          </Typography>
          <Typography variant="h6" style={{ margin: "20px 0" }}>
            Total Tracks: {tracks.length}
          </Typography>
          <PlaylistButton tracks={tracks} artistName={artist.name} />
        </Grid>
      </Grid>
      <Box sx={{ maxHeight: 600, overflowY: "auto" }}>
        <List>
          {tracks.map((track, index) => (
            <div key={index}>
              <ListItem>
                {track.albumImage && (
                  <img
                    alt={`Album cover of ${track.name}`}
                    src={track.albumImage}
                    style={{ marginRight: 16, width: 64, height: 64 }}
                  />
                )}
                <ListItemText
                  primary={track.name}
                  secondary={track.artists
                    .map((artist) => artist.name)
                    .join(", ")}
                />
              </ListItem>
              {index !== tracks.length - 1 && <Divider />}
            </div>
          ))}
        </List>
      </Box>
    </Container>
  );
}
