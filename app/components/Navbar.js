'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn, getSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Menu, MenuItem, Button, Typography, Dialog, DialogActions, DialogContent, DialogTitle, TextField, IconButton, Badge } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HomeIcon from '@mui/icons-material/Home';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ReceiptIcon from '@mui/icons-material/Receipt';
import useCartStore from '../store/useCartStore'; // Import Zustand store

export default function Navbar() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [updatedInfo, setUpdatedInfo] = useState({});
  
  const { cartItems, addToCart, cartItemCount } = useCartStore(); // Access cart store

  useEffect(() => {
    const fetchSession = async () => {
      const sessionData = await getSession();
      setSession(sessionData);
      if (sessionData) {
        setUpdatedInfo({
          name: sessionData.user.name,
          email: sessionData.user.email,
          mobile: sessionData.user.mobile || '',
        });
      }
    };
    fetchSession();
  }, []);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    signOut();
    handleCloseMenu();
  };

  const handleEditUserInfo = () => {
    setOpenDialog(true);
    handleCloseMenu();
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleUserInfoUpdate = () => {
    console.log("Updated Info: ", updatedInfo);
    setOpenDialog(false);
  };

  const handleViewCart = () => {
    router.push('/cart'); // Navigate to the cart page
  };

  return (
    <nav className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-lg">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-white tracking-wider">She Boutique</h2>
        
        <ul className="hidden md:flex space-x-8 items-center">
          <li>
            <Link href="/" className="flex items-center text-white hover:text-yellow-400">
              <HomeIcon className="mr-2" /> Home
            </Link>
          </li>
          <li>
            <Link href="/products" className="flex items-center text-white hover:text-yellow-400">
              <ShoppingBagIcon className="mr-2" /> Products
            </Link>
          </li>
          {session && (
            <li>
              <Link href="/orders" className="flex items-center text-white hover:text-yellow-400">
                <ReceiptIcon className="mr-2" /> My Orders
              </Link>
            </li>
          )}
        </ul>
        
        {/* Cart Button */}
        <IconButton onClick={handleViewCart} color="inherit">
          <Badge badgeContent={cartItems.length} color="error">
            <ShoppingCartIcon />
          </Badge>
        </IconButton>

        {/* User Profile Button */}
        <div className="space-x-4 flex items-center">
          {session ? (
            <>
              <Button
                aria-controls="simple-menu"
                aria-haspopup="true"
                onClick={handleMenuClick}
                startIcon={<AccountCircleIcon />}
                className="text-white hover:text-yellow-400"
              >
                {session.user?.name}
              </Button>
              <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
              >
                <MenuItem onClick={handleEditUserInfo}>Edit Info</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <button 
              onClick={() => signIn()}
              className="text-white hover:text-yellow-400"
            >
              SignIn
            </button>
          )}
        </div>
      </div>

      {/* Edit User Info Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Edit User Information</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="dense"
            value={updatedInfo.name}
            onChange={(e) => setUpdatedInfo({ ...updatedInfo, name: e.target.value })}
          />
          <TextField
            label="Email"
            fullWidth
            margin="dense"
            value={updatedInfo.email}
            onChange={(e) => setUpdatedInfo({ ...updatedInfo, email: e.target.value })}
          />
          <TextField
            label="Mobile"
            fullWidth
            margin="dense"
            value={updatedInfo.mobile}
            onChange={(e) => setUpdatedInfo({ ...updatedInfo, mobile: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="secondary">Cancel</Button>
          <Button onClick={handleUserInfoUpdate} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </nav>
  );
}
