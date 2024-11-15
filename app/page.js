'use client'
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import { CircularProgress, Typography, Box, TextField, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, Button, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import useCartStore from './store/useCartStore';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [likedProducts, setLikedProducts] = useState(new Set());
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const { cartItems, addToCart } = useCartStore();

  // Define cache duration in milliseconds (24 hours in this example)
  const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
``

  useEffect(() => {
    const cachedData = localStorage.getItem('products');
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      const now = Date.now();

      // Check if cached data is still valid
      if (now - timestamp < CACHE_DURATION) {
        setProducts(data); // Use cached data
      } else {
        fetchProducts(); // Fetch new data if cache is expired
      }
    } else {
      fetchProducts(); // Fetch data if there's no cache
    }
  }, []);

  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      setProducts(data);

      // Store products in localStorage with current timestamp
      localStorage.setItem('products', JSON.stringify({ data, timestamp: Date.now() }));
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleLikeToggle = (productId) => {
    setLikedProducts((prevLikedProducts) => {
      const updatedLikedProducts = new Set(prevLikedProducts);
      if (updatedLikedProducts.has(productId)) {
        updatedLikedProducts.delete(productId);
      } else {
        updatedLikedProducts.add(productId);
      }
      return updatedLikedProducts;
    });
  };

  const isInCart = (productId) => cartItems.some(item => item.id === productId);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setSelectedSize('');
    setSelectedColor('');
  };

  const handleAddToCart = () => {
    if (selectedProduct && selectedSize && selectedColor) {
      const productWithOptions = {
        ...selectedProduct,
        selectedSize,
        selectedColor,
      };
      addToCart(productWithOptions);
      setSelectedProduct(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <Box className="container mx-auto p-4">
        <Box
          sx={{
            backgroundImage: 'linear-gradient(white, white), linear-gradient(to right, #3b82f6, #9333ea, #ec4899)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'content-box, border-box',
          }}
        >
          <TextField
            label="Search Products"
            variant="outlined"
            fullWidth
            margin="normal"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              sx: {
                borderRadius: '8px',
              },
            }}
          />
        </Box>
      </Box>
      <Box className="container mx-auto p-4">
        {loading ? (
          <CircularProgress />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white p-4 shadow-lg rounded-lg border border-gray-200 hover:shadow-xl transform hover:scale-105 transition duration-300 ease-in-out"
                  style={{
                    borderImageSource: 'linear-gradient(to right, #3b82f6, #9333ea, #ec4899)',
                    borderImageSlice: 1,
                  }}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-contain mb-2 rounded bg-gray-100"
                  />
                  <Typography variant="h6" className="font-semibold text-gray-800">
                    {product.name}
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    ₹ {product.price.toLocaleString()}
                  </Typography>
                  <div className="flex justify-between items-center mt-4">
                    <IconButton onClick={() => handleLikeToggle(product.id)} color="primary">
                      {likedProducts.has(product.id) ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                    </IconButton>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleProductClick(product)}
                    >
                      View Details
                    </Button>
                  </div>
                  {isInCart(product.id) && (
                    <Typography
                      variant="body2"
                      color="primary"
                      sx={{
                        fontWeight: 600,
                        mt: 1,
                        textAlign: 'center',
                        backgroundColor: 'rgba(0, 128, 0, 0.1)',
                        padding: '5px',
                        borderRadius: '4px',
                        border: '1px solid green',
                      }}
                    >
                      Already in Cart
                    </Typography>
                  )}
                </div>
              ))
            ) : (
              <Typography variant="body1" color="textSecondary">
                No products match your search.
              </Typography>
            )}
          </div>
        )}
      </Box>
      {/* Product Detail Dialog */}
      {selectedProduct && (
        <Dialog open={Boolean(selectedProduct)} onClose={() => setSelectedProduct(null)}>
          <DialogTitle>{selectedProduct.name}</DialogTitle>
          <DialogContent>
            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              className="w-full h-50 object-contain mb-2 rounded bg-gray-100"
            />
            <Typography variant="body1" color="textSecondary">{selectedProduct.description}</Typography>
            {/* Size Selection */}
            {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
              <FormControl fullWidth margin="normal">
                <InputLabel>Size</InputLabel>
                <Select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  label="Size"
                >
                  {selectedProduct.sizes.map((size, index) => (
                    <MenuItem key={index} value={size}>
                      {size}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            {/* Color Selection */}
            {selectedProduct.colors && selectedProduct.colors.length > 0 && (
              <Box className="mt-2">
                <Typography variant="body2" color="textSecondary">Colors:</Typography>
                <div className="flex space-x-2">
                  {selectedProduct.colors.map((color, index) => (
                    <IconButton
                      key={index}
                      onClick={() => setSelectedColor(color)}
                      style={{
                        backgroundColor: color,
                        padding: '10px',
                        borderRadius: '50%',
                        border: selectedColor === color ? '3px solid #9333ea' : 'none',
                      }}
                    />
                  ))}
                </div>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedProduct(null)} color="secondary">
              Cancel
            </Button>
            <Button
              onClick={handleAddToCart}
              color="primary"
              variant="contained"
              disabled={!selectedSize || !selectedColor || isInCart(selectedProduct.id)}
            >
              Add to Cart
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
}
