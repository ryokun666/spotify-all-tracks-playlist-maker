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
  CircularProgress,
} from "@mui/material";

export default function Artist() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const [artist, setArtist] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

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
    setLoading(true);

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
      const getUniqueAlbums = (albums) => {
        const uniqueIds = new Set(albums.map((album) => album.id));
        return albums.filter((album) => uniqueIds.has(album.id));
      };
      const uniqueAlbums = getUniqueAlbums(albumResponse.data.items);
      setAlbums(uniqueAlbums);
      await fetchTracks(uniqueAlbums, token);
    } catch (error) {
      console.error("Error fetching artist details:", error);
    } finally {
      setLoading(false);
    }
  };

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

  if (!artist) {
    return <div>ログインしてください。</div>;
  }

  return (
    <Container>
      <ArtistSearch />
      <Grid container spacing={2} alignItems="center" mt={1}>
        <Grid item xs={12} sm={4} md={3}>
          {artist.images.length > 0 && (
            <Avatar
              alt={`Image of ${artist.name}`}
              src={artist.images[0].url}
              sx={{ width: "100%", height: "auto", boxShadow: 3 }}
              variant="square"
            />
          )}
        </Grid>
        <Grid item xs={12} sm={8} md={9} mb={4}>
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            height="100%"
          >
            <Typography variant="h4">{artist.name}</Typography>
            <Typography variant="body1">
              {artist.followers.total.toLocaleString()} followers
            </Typography>
            <Typography variant="body1">
              Genres: {artist.genres.join(", ")}
            </Typography>
            <Typography variant="h6" style={{ margin: "20px 0" }}>
              Total Tracks: {tracks.length}
            </Typography>
            <PlaylistButton tracks={tracks} artistName={artist.name} />
          </Box>
        </Grid>
      </Grid>
      {!loading ? (
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
      ) : (
        <Box display="flex" justifyContent="center" alignItems="center">
          <CircularProgress />
        </Box>
      )}
    </Container>
  );
}
