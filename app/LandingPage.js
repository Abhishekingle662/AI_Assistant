import { Box, Typography, Button } from '@mui/material';
import Link from 'next/link';

export default function LandingPage() {
 
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      textAlign="center"
      sx={{
        backgroundImage: 'url("https://33.media.tumblr.com/5ab91dfb029f1745f2e318f0c554fadd/tumblr_nx7xf40vg31qaityko1_1280.gif")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <Box
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          padding: '2rem',
          borderRadius: '10px',
        }}
      >
        <Typography variant="h2" gutterBottom>
          Welcome to AI Assistant
        </Typography>
        <Typography variant="h5" gutterBottom>
          Your intelligent chat companion
        </Typography>
        <Button
          variant="contained"
          size="large"
          component={Link}
          href="/chat"
          sx={{ mt: 4 }}
        >
          Start Chatting
        </Button>
      </Box>
    </Box>
  );
}