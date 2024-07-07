import { useSession, signIn, signOut } from "next-auth/react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
} from "@mui/material";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          onClick={() => router.push("/")}
          style={{ cursor: "pointer" }}
        >
          オルトラメーカー
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        {!session ? (
          <Button color="inherit" onClick={() => signIn("spotify")}>
            Spotifyでログイン
          </Button>
        ) : (
          <>
            <Typography variant="body1" style={{ marginRight: 16 }}>
              {session.user.name}
            </Typography>
            <Avatar
              alt={session.user.name}
              src={session.user.image}
              onClick={handleMenuOpen}
              style={{ cursor: "pointer" }}
            />
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => signOut()}>Sign out</MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
