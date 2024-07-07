import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { useSession, signIn } from "next-auth/react";
import {
  TextField,
  Autocomplete,
  CircularProgress,
  Avatar,
} from "@mui/material";

const ArtistSearch = () => {
  const { data: session } = useSession();
  const [query, setQuery] = useState("");
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const searchArtist = async (query) => {
    if (!session || !query) return;

    try {
      setLoading(true);
      const response = await axios.get(
        `https://api.spotify.com/v1/search?q=${query}&type=artist`,
        {
          headers: {
            Authorization: `Bearer ${session.user.accessToken}`,
          },
        }
      );
      setArtists(response.data.artists.items);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (error.response && error.response.status === 401) {
        signIn();
      }
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.length > 1) {
        searchArtist(query);
      } else {
        setArtists([]);
      }
    }, 100);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <Autocomplete
      freeSolo
      disableClearable
      options={artists}
      getOptionLabel={(option) => option.name}
      onInputChange={(event, newValue) => {
        setQuery(newValue);
      }}
      onChange={(event, newValue) => {
        if (newValue) {
          router.push(`/artist/${newValue.id}`);
        }
      }}
      renderOption={(props, option) => (
        <li {...props}>
          <Avatar
            src={option.images[0]?.url || ""}
            alt={option.name}
            sx={{ width: 28, height: 28, marginRight: 2 }}
          />
          {option.name}
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search for an artist"
          InputProps={{
            ...params.InputProps,
            type: "search",
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      style={{ width: "100%", marginTop: 20 }}
    />
  );
};

export default ArtistSearch;
