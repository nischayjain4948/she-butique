'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useCartStore from '../store/useCartStore';
import Navbar from '../components/Navbar';
import { Box, Typography, IconButton, Button, TextField, MenuItem, Select, InputLabel, FormControl, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar } from '@mui/material';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { getSession } from 'next-auth/react'; // Import to get session
import Image from 'next/image';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart } = useCartStore();
  const router = useRouter();
  
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to check if the user is logged in
  const [userDetails, setUserDetails] = useState({
    name: '',
    address: '',
    email : '',
    phone: '',
    alternatePhone: '',
    city: '',
    country: '',
    landmark: '',
    pincode: ''
  });
  const [showCheckoutForm, setShowCheckoutForm] = useState(false); // State to toggle checkout form visibility
  const [openDialog, setOpenDialog] = useState(false); // State to manage the Dialog box visibility
  const [openAlert, setOpenAlert] = useState(false); // State to handle alert visibility
  const [razorpayScriptLoaded, setRazorpayScriptLoaded] = useState(false); // State to track if the Razorpay script is loaded

  // Check if the user is logged in when the component mounts
  useEffect(() => {
    const checkLoginStatus = async () => {
      const session = await getSession();
      if (session) {
        setIsLoggedIn(true);
        setUserDetails({
          name: session.user.name || '',
          address: session.user.address || '',
          phone: session.user.phone || '',
          email : session.user.email || ''
        });
      }
    };
    checkLoginStatus();
  }, []);

  // Load Razorpay script dynamically
  useEffect(() => {
    const loadRazorpayScript = () => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => setRazorpayScriptLoaded(true);
      document.body.appendChild(script);
    };

    // Only load script when checkout is clicked
    if (openDialog) {
      loadRazorpayScript();
    }
  }, [openDialog]);

  const handleCheckout = () => {
    if (isLoggedIn) {
      setOpenDialog(true); // Open the checkout dialog box if logged in
    } else {
      // Show alert and redirect to login page
      setOpenAlert(true);
      setTimeout(() => {
        router.push('/auth/signin'); // Redirect to the login page
      }, 1000); // Redirect after 3 seconds to show alert
    }
  };

  // const handleFormSubmit = (e) => {
  //   e.preventDefault();
  
  //   if (!razorpayScriptLoaded) {
  //     alert("Razorpay script not loaded yet, please try again.");
  //     return;
  //   }
  
  //   const options = {
  //     key: 'rzp_test_bMoebitCJCkjwp', // Replace with your Razorpay key
  //     amount: cartItems.reduce((total, item) => total + item.price * item.quantity, 0) * 100, // Total amount in paise
  //     currency: 'INR',
  //     name: 'She Boutique',
  //     description: 'Checkout for items in cart',
  //     image: 'https://yourdomain.com/logo.png', // Your logo or image URL
  //     handler: async function (response) {
  //       console.log("Response from RazorPay :)", {response});
  //       try {
  //         const orderData = {
  //           razorpay_payment_id: response.razorpay_payment_id,
  //           razorpay_order_id: response.razorpay_order_id,
  //           razorpay_signature: response.razorpay_signature,
  //           userDetails: userDetails,
  //           cartItems: cartItems, 
  //         };
  
  //         // Send this data to your backend
  //         const res = await fetch('/api/payment-success', {
  //           method: 'POST',
  //           headers: {
  //             'Content-Type': 'application/json',
  //           },
  //           body: JSON.stringify(orderData),
  //         });
  
  //         const data = await res.json();
  
  //         if (data.success) {
  //           alert('Order placed successfully!');
  //           setOpenDialog(false); // Close the dialog
  //           // Optionally, redirect the user to an order confirmation page
  //         } else {
  //           alert('Payment failed, please try again.');
  //         }
  //       } catch (error) {
  //         console.error('Error processing payment success:', error);
  //         alert('An error occurred while processing your payment.');
  //       }
  //     },
  //     prefill: {
  //       name: userDetails.name,
  //       email: userDetails.email,
  //       contact: userDetails.phone,
  //     },
  //     notes: {
  //       address: userDetails.address,
  //     },
  //     theme: {
  //       color: '#1a73e8',
  //     },
  //   };
  
  //   const razorpay = new Razorpay(options);
  //   razorpay.open(); // Open Razorpay checkout dialog
  // };




  const handleFormSubmit = async (e) => {
    e.preventDefault();
  
    if (!razorpayScriptLoaded) {
      alert("Razorpay script not loaded yet, please try again.");
      return;
    }
    const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0) * 100;
    let orderData;
    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalAmount, userDetails, cartItems, deliveryAddress: userDetails.address }),
      });
      orderData = await res.json();
      console.log({orderData});
      if (!orderData.success) throw new Error('Failed to create order');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
      return;
    }
  
    const options = {
      key: 'rzp_test_bMoebitCJCkjwp', // Razorpay test key
      amount: totalAmount,
      currency: 'INR',
      name: 'She Boutique',
      description: 'Checkout for items in cart',
      image: 'https://yourdomain.com/logo.png', // Replace with your logo or image URL
      order_id: orderData.razorpayOrderId, // Order ID from backend
      handler: async function (response) {
        try {
          const paymentData = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            userDetails,
            cartItems,
          };
  
          // Send payment success data to backend
          const res = await fetch('/api/payment-success', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentData),
          });
  
          const data = await res.json();
          if (data.success) {
            alert('Order placed successfully!');
            setOpenDialog(false);
          } else {
            alert('Payment verification failed.');
          }
        } catch (error) {
          console.error('Error processing payment success:', error);
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
    razorpay.open(); // Open Razorpay checkout dialog
  };
  
  

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto p-4">
        <Typography
          variant="h4"
          style={{
            marginBottom: '24px',
            color: '#1a202c',
            fontWeight: '700',
            fontSize: '2rem',
            textAlign: 'center',
            borderBottom: '2px solid #ddd',
            paddingBottom: '8px'
          }}
        >
          Your Cart
        </Typography>

        {cartItems.length > 0 ? (
          <>
            {cartItems.map((item, index) => (
              <Box
                key={index}
                className="shadow-md rounded-lg mb-6 p-4 transition duration-300 hover:border-2 hover:border-blue-500"
                style={{
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  backgroundColor: '#fff',
                }}
              >
                <div className="flex items-center space-x-4 p-4 bg-white rounded">
                  <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded" />
                  <div className="text-gray-700">
                    <Typography variant="h6" className="font-semibold">{item.name}</Typography>
                    <Typography variant="body2" color="textSecondary">Price: ₹ {item.price}</Typography>
                    <Typography variant="body2" color="textSecondary">Color: {item.selectedColor}</Typography>
                    <Typography variant="body2" color="textSecondary">Size: {item.selectedSize}</Typography>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center border rounded-md">
                    <IconButton
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <RemoveIcon />
                    </IconButton>
                    <Typography variant="body1" className="mx-2">{item.quantity}</Typography>
                    <IconButton onClick={() => updateQuantity(item.id, item.quantity + 1)} >
                      <AddIcon />
                    </IconButton>
                  </div>

                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<RemoveShoppingCartIcon />}
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </Button>
                </div>
              </Box>
            ))}

            <div className="flex justify-center mt-6">
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleCheckout}
                style={{
                  backgroundColor: '#1a73e8',
                  color: '#fff',
                  fontWeight: 'bold',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'background-color 0.3s ease',
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = '#155ac0')}
                onMouseOut={(e) => (e.target.style.backgroundColor = '#1a73e8')}
                startIcon={<ShoppingCartIcon />}
              >
                Proceed to Checkout
              </Button>
            </div>

            {/* Checkout Dialog Box */}
      {/* Checkout Dialog Box */}
<Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
  <DialogTitle>Delivery Information</DialogTitle>
  <DialogContent>
    <form onSubmit={handleFormSubmit}>
      <TextField
        label="Full Name"
        fullWidth
        required
        value={userDetails.name}
        onChange={(e) => setUserDetails({ ...userDetails, name: e.target.value })}
        margin="normal"
      />
      <TextField
        label="Email"
        fullWidth
        required
        value={userDetails.email}
        onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value })}
        margin="normal"
        type="email"
      />
      <TextField
        label="Phone"
        fullWidth
        required
        value={userDetails.phone}
        onChange={(e) => setUserDetails({ ...userDetails, phone: e.target.value })}
        margin="normal"
        type="tel"
      />
      <TextField
        label="Alternate Phone"
        fullWidth
        value={userDetails.alternatePhone}
        onChange={(e) => setUserDetails({ ...userDetails, alternatePhone: e.target.value })}
        margin="normal"
        type="tel"
      />
      <TextField
        label="Address"
        fullWidth
        required
        value={userDetails.address}
        onChange={(e) => setUserDetails({ ...userDetails, address: e.target.value })}
        margin="normal"
      />
      <TextField
        label="Landmark"
        fullWidth
        value={userDetails.landmark}
        onChange={(e) => setUserDetails({ ...userDetails, landmark: e.target.value })}
        margin="normal"
      />
      <TextField
        label="City"
        fullWidth
        required
        value={userDetails.city}
        onChange={(e) => setUserDetails({ ...userDetails, city: e.target.value })}
        margin="normal"
      />
      <TextField
        label="Country"
        fullWidth
        required
        value={userDetails.country}
        onChange={(e) => setUserDetails({ ...userDetails, country: e.target.value })}
        margin="normal"
      />
      <TextField
        label="Pincode"
        fullWidth
        required
        value={userDetails.pincode}
        onChange={(e) => setUserDetails({ ...userDetails, pincode: e.target.value })}
        margin="normal"
        type="number"
      />
      <DialogActions>
        <Button onClick={() => setOpenDialog(false)} color="primary">
          Cancel
        </Button>
        <Button type="submit" color="primary">
          Complete Checkout
        </Button>
      </DialogActions>
    </form>
  </DialogContent>
</Dialog>


            {/* Alert Snackbar for Logged-In Check */}
            <Snackbar
              open={openAlert}
              autoHideDuration={3000}
              onClose={() => setOpenAlert(false)}
              message="You must be logged in to proceed"
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            />
          </>
        ) : (
          <Typography variant="h6" color="textSecondary" className="text-center">
            Your cart is empty.
          </Typography>
        )}
      </div>
    </div>
  );
}
