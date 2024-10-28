import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container, Box } from '@mui/material';
import Navbar from '../Navbar';
import { useAuth } from '../../../context/AuthContext';

export default function Layout() {
  const { isAuthenticated } = useAuth();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {isAuthenticated && <Navbar />}
      <Container 
        component="main" 
        maxWidth="lg" 
        sx={{ 
          flex: 1,
          py: 3,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Outlet />
      </Container>
    </Box>
  );
}
