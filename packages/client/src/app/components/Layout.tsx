import { Outlet } from 'react-router-dom';
import { Container, CssBaseline, Box } from '@mui/material';

export default function Layout() {
  return (
    <>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Outlet />
        </Box>
      </Container>
    </>
  );
}
