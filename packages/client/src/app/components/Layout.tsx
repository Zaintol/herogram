import { Outlet } from 'react-router-dom';
import { Container, CssBaseline, Box } from '@mui/material';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <>
      <CssBaseline />
      <Container maxWidth="lg">
        <Navbar></Navbar>
        <Box sx={{ my: 4 }}>
          <Outlet />
        </Box>
      </Container>
    </>
  );
}
