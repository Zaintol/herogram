import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
} from '@mui/material';
import { useAuth } from '../../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1 }}
          >
            File Sharing App
          </Typography>
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body1">
                Welcome, {user.name}
              </Typography>
              <Button 
                color="inherit"
                onClick={logout}
              >
                Logout
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
