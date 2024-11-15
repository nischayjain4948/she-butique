'use client';

import { useEffect, useState } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import {
  CircularProgress,
  Box,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
} from '@mui/material';
import Navbar from '../Navbar';
import useAdminAuth from '@/hooks/useAdminAuth';
import { useRouter } from 'next/navigation';
import EditIcon from '@mui/icons-material/Edit';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const { error, loading: authLoading } = useAdminAuth();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [updatedInfo, setUpdatedInfo] = useState({});

  // Redirect to "/" immediately if there's an error
  useEffect(() => {
    if (error) {
      router.replace('/');
    }
  }, [error, router]);

  useEffect(() => {
    if (error || authLoading) return; // Skip fetching if there's an error or still loading auth

    async function fetchUsers() {
      try {
        setFetchLoading(true);
        const res = await fetch('/api/admin/users');
        const data = await res.json();

        // Ensure each row has a unique "id" for the DataGrid
        const processedData = data.map((user, index) => ({
          ...user,
          id: user.id || index, // Use existing id or fallback to index
        }));

        setUsers(processedData);
      } catch (fetchError) {
        console.error('Failed to fetch users:', fetchError);
      } finally {
        setFetchLoading(false);
      }
    }

    fetchUsers();
  }, [error, authLoading]);

  const handleEditClick = (user) => {
    setCurrentUser(user);
    setUpdatedInfo({ email: user.email, role: user.role, fullName: user.fullName });
    setOpen(true);
  };

  const handleUpdateUser = async () => {
    try {
      const res = await fetch(`/api/admin/users/${currentUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedInfo),
      });

      if (!res.ok) throw new Error('Error updating user');

      const updatedUser = await res.json();
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user))
      );

      setOpen(false);
      setCurrentUser(null);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentUser(null);
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 200 },
    { field: 'email', headerName: 'Email', width: 250 },
    { field: 'role', headerName: 'Role', width: 150 },
    { field: 'fullName', headerName: 'Full Name', width: 150 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          key={`edit-${params.id}`}
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEditClick(params.row)}
        />,
      ],
    },
  ];

  // Show loading spinner while auth is loading or if there's an error
  if (error || authLoading) return <Typography color="error">{error}</Typography>;

  return (
    <>
      <Navbar />
      <Box sx={{ height: 400, width: '100%', padding: 4 }}>
        <Typography variant="h5" gutterBottom>
          User Management
        </Typography>

        {fetchLoading ? (
          <CircularProgress />
        ) : (
          <DataGrid
            rows={users}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20]}
            checkboxSelection
            disableSelectionOnClick
          />
        )}
      </Box>

      {/* Edit User Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            label="Email"
            fullWidth
            margin="dense"
            value={updatedInfo.email}
            onChange={(e) => setUpdatedInfo({ ...updatedInfo, email: e.target.value })}
          />
          <TextField
            label="Role"
            fullWidth
            margin="dense"
            value={updatedInfo.role}
            onChange={(e) => setUpdatedInfo({ ...updatedInfo, role: e.target.value })}
          />
          <TextField
            label="Full Name"
            fullWidth
            margin="dense"
            value={updatedInfo.fullName}
            onChange={(e) => setUpdatedInfo({ ...updatedInfo, fullName: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleUpdateUser} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
