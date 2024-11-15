// app/admin/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from 'next-auth/react';
import { CircularProgress, Box, Typography, Paper, Alert } from '@mui/material';
import AddProductForm from './AddProductForm';
import Dashboard from './Dashboard';
import Navbar from  './Navbar'; // Correct import for Navbar
import useAdminAuth from '@/hooks/useAdminAuth';

export default function AdminDashboard() {
  const {loading, error} = useAdminAuth();

  if (error) return <Typography color="error">{error}</Typography>;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <div>
      <Navbar /> {/* Add the Navbar component here */}
      
      {/* Admin Dashboard Layout */}
      <Dashboard />

      {/* Add Product Form */}
      <Paper sx={{ p: 3, marginTop: 4 }}>
        <Typography variant="h5" gutterBottom align="center">
          Add a New Product
        </Typography>

        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <AddProductForm />
        </Box>
      </Paper>
    </div>
  );
}
