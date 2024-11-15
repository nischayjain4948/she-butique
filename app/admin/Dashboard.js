// Dashboard.js
import { useEffect } from 'react';
import { Box, Grid, Paper, Typography, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import useAdminStore from '../store/store'; // Import correctly

export default function Dashboard() {
  const { counts, setCounts, loading, setLoading } = useAdminStore();
  const router = useRouter();

  useEffect(() => {
    async function fetchCounts() {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/insights');
        const data = await res.json();
        setCounts(data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCounts();
  }, [router]);

  const handleNavigate = (path) => {
    router.push(path);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', padding: 4 }}>
      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ padding: 3, textAlign: 'center', cursor: 'pointer' }} onClick={() => handleNavigate('/admin/users')}>
              <Typography variant="h6">Total Users</Typography>
              <Typography variant="h4">{counts.users}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ padding: 3, textAlign: 'center', cursor: 'pointer' }} onClick={() => handleNavigate('/admin/orders')}>
              <Typography variant="h6">Total Orders</Typography>
              <Typography variant="h4">{counts.orders}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ padding: 3, textAlign: 'center', cursor: 'pointer' }} onClick={() => handleNavigate('/admin/products')}>
              <Typography variant="h6">Products</Typography>
              <Typography variant="h4">{counts.products}</Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
