// app/admin/Navbar.js
'use client'; // Add this line to mark the component as client-side

import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { getSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // This is a client-side hook

const Navbar = () => {
  const  session  = getSession();
  const router = useRouter();

  const handleLogout = () => {
    signOut({ callbackUrl: '/' }); // Redirect to the homepage after logout
  };

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
  <Link href="/admin" passHref>
   Admin Dashboard
  </Link>
</Typography>
        {session ? (
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button color="inherit" onClick={() => router.push('/auth/signin')}>
              Sign In
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
