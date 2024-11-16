'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useCartStore from '../store/useCartStore';
import Navbar from '../components/Navbar';
import {
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
} from '@mui/material';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { getSession } from 'next-auth/react';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCartStore();
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDetails, setUserDetails] = useState({
    name: '',
    address: '',
    email: '',
    phone: '',
    alternatePhone: '',
    city: '',
    country: '',
    landmark: '',
    pincode: '',
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [openSuccessAlert, setOpenSuccessAlert] = useState(false);
  const [razorpayScriptLoaded, setRazorpayScriptLoaded] = useState(false);

  // Load Razorpay script dynamically
  useEffect(() => {
    const loadRazorpayScript = () => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => setRazorpayScriptLoaded(true);
      document.body.appendChild(script);
    };

    if (openDialog) {
      loadRazorpayScript();
    }
  }, [openDialog]);

  // Check if user is logged in
  useEffect(() => {
    const checkLoginStatus = async () => {
      const session = await getSession();
      if (session) {
        setIsLoggedIn(true);
        setUserDetails((prevDetails) => ({
          ...prevDetails,
          name: session.user.name || '',
          email: session.user.email || '',
        }));
      }
    };
    checkLoginStatus();
  }, []);

  const handleCheckout = () => {
    if (isLoggedIn) {
      setOpenDialog(true);
    } else {
      alert('Please log in to proceed to checkout.');
      router.push('/auth/signin');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!razorpayScriptLoaded) {
      alert('Payment script not loaded yet. Please try again later.');
      return;
    }

    const totalAmount = cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    ) * 100; // Convert to paise for Razorpay

    // Create order on the backend
    let orderData;
    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalAmount, cartItems, userDetails }),
      });
      orderData = await res.json();
      if (!orderData.success) throw new Error('Failed to create order');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
      return;
    }

    // Open Razorpay payment dialog
    const options = {
      key: 'rzp_test_bMoebitCJCkjwp',
      amount: totalAmount,
      currency: 'INR',
      name: 'She Boutique',
      description: 'Payment for your order',
      order_id: orderData.razorpayOrderId,
      handler: async (response) => {
        try {
          const paymentData = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          };

          // Verify payment and save order
          const verifyRes = await fetch('/api/payment-success', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentData),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
           
            setOpenDialog(false);
            setOpenSuccessAlert(true);
            setTimeout(() => {
              setOpenSuccessAlert(false);
              router.push('/');
            }, 3000);
            clearCart();
          } else {
            alert('Payment verification failed. Please contact support.');
          }
        } catch (error) {
          console.error('Error processing payment:', error);
          alert('An error occurred while processing your payment.');
        }
      },
      prefill: {
        name: userDetails.name,
        email: userDetails.email,
        contact: userDetails.phone,
      },
      notes: { address: userDetails.address },
      theme: { color: '#1a73e8' },
    };

    const razorpay = new Razorpay(options);
    razorpay.open();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto p-4">
        <Typography variant="h4" className="mb-4 text-center">
          Your Cart
        </Typography>

        {cartItems.length > 0 ? (
          <>
            {cartItems.map((item) => (
              <Box key={item.id} className="p-4 mb-4 border rounded-md">
                <div className="flex items-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded"
                  />
                  <div className="ml-4">
                    <Typography variant="h6">{item.name}</Typography>
                    <Typography>Price: ₹{item.price}</Typography>
                    <Typography>Quantity: {item.quantity}</Typography>
                  </div>
                </div>
                <div className="mt-4 flex justify-between">
                  <div className="flex items-center">
                    <IconButton onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      <RemoveIcon />
                    </IconButton>
                    <Typography>{item.quantity}</Typography>
                    <IconButton onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <AddIcon />
                    </IconButton>
                  </div>
                  <Button
                    variant="outlined"
                    startIcon={<RemoveShoppingCartIcon />}
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </Button>
                </div>
              </Box>
            ))}

            <Button
              variant="contained"
              color="primary"
              onClick={handleCheckout}
              className="w-full"
            >
              Proceed to Checkout
            </Button>
          </>
        ) : (
          <Typography className="text-center mt-4">Your cart is empty!</Typography>
        )}
      </div>

      {/* Checkout Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Checkout</DialogTitle>
        <DialogContent>
          <form onSubmit={handleFormSubmit}>
            <TextField
              label="Name"
              fullWidth
              margin="normal"
              value={userDetails.name}
              onChange={(e) => setUserDetails({ ...userDetails, name: e.target.value })}
            />
            <TextField
              label="Address"
              fullWidth
              margin="normal"
              value={userDetails.address}
              onChange={(e) => setUserDetails({ ...userDetails, address: e.target.value })}
            />
            <TextField
              label="Email"
              fullWidth
              margin="normal"
              value={userDetails.email}
              onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value })}
            />
            <TextField
              label="Phone"
              fullWidth
              margin="normal"
              value={userDetails.phone}
              onChange={(e) => setUserDetails({ ...userDetails, phone: e.target.value })}
            />
            <TextField
              label="Pincode"
              fullWidth
              margin="normal"
              value={userDetails.pincode}
              onChange={(e) => setUserDetails({ ...userDetails, pincode: e.target.value })}
            />
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button type="submit" color="primary">
                Complete Checkout
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success Alert */}
      <Snackbar open={openSuccessAlert} autoHideDuration={3000}>
        <Alert severity="success">🎉 Order placed successfully! Congratulations! 🎉</Alert>
      </Snackbar>
    </div>
  );
}
