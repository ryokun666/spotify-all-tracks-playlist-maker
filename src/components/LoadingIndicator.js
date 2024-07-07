import { CircularProgress, Box } from "@mui/material";

const LoadingIndicator = () => {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="60vh"
    >
      <CircularProgress />
    </Box>
  );
};

export default LoadingIndicator;
