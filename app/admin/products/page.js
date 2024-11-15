'use client';

import { useEffect, useState } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { CircularProgress, Box, Typography, Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, MenuItem } from '@mui/material';
import Navbar from '../Navbar';
import useAdminAuth from '@/hooks/useAdminAuth';
import { useRouter } from 'next/navigation';
import EditIcon from '@mui/icons-material/Edit';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const { error, loading: authLoading } = useAdminAuth();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [updatedProductInfo, setUpdatedProductInfo] = useState({});
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  // Redirect to "/" immediately if there's an error
  useEffect(() => {
    if (error) {
      router.replace('/');
    }
  }, [error, router]);

  useEffect(() => {
    if (error || authLoading) return;

    async function fetchProducts() {
      try {
        setFetchLoading(true);
        const res = await fetch('/api/admin/products', { method: "get" });
        const data = await res.json();
        setProducts(data);
      } catch (fetchError) {
        console.error("Failed to fetch products:", fetchError);
      } finally {
        setFetchLoading(false);
      }
    }

    fetchProducts();
  }, [error, authLoading]);

  const handleEditClick = (product) => {
    setCurrentProduct(product);
    setUpdatedProductInfo({ name: product.name, price: product.price, category: product.category, image: product.image,  careInstructions: product.careInstructions });
    setOpen(true);
  };

  const handleUpdateProduct = async () => {
    try {
      const res = await fetch(`/api/admin/products/${currentProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProductInfo),
      });

      if (!res.ok) throw new Error('Error updating product');

      const updatedProduct = await res.json();
      setProducts((prevProducts) =>
        prevProducts.map((product) => (product.id === updatedProduct.id ? updatedProduct : product))
      );

      setOpen(false);
      setCurrentProduct(null);
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setImageDialogOpen(true);
  };

  const handleCloseImageDialog = () => {
    setImageDialogOpen(false);
    setSelectedImage('');
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentProduct(null);
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 200 },
    { field: 'name', headerName: 'Name', width: 250 },
    { field: 'price', headerName: 'Price', width: 150 },
    { field: 'category', headerName: 'Category', width: 150 },
    { field: 'quantity', headerName: 'Quantity', width: 150 },
    { field: 'careInstructions', headerName: 'Care Instructions', width: 150 },
    { 
      field: 'image', 
      headerName: 'Image', 
      width: 150, 
      renderCell: (params) => (
        <img
          src={params.value}
          alt={params.row.name}
          style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4, cursor: 'pointer' }}
          onClick={() => handleImageClick(params.value)}
        />
      )
    },

    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEditClick(params.row)}
        />,
      ],
    },
  ];

  if (error || authLoading) return <Typography color="error">{error}</Typography>;

  return (
    <>
      <Navbar />
      <Box sx={{ height: 400, width: '100%', padding: 4 }}>
        <Typography variant="h5" gutterBottom>Product Management</Typography>

        {fetchLoading ? (
          <CircularProgress />
        ) : (
          <DataGrid
            rows={products}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20]}
            checkboxSelection
            disableSelectionOnClick
          />
        )}
      </Box>

      {/* Edit Product Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="dense"
            value={updatedProductInfo.name}
            onChange={(e) => setUpdatedProductInfo({ ...updatedProductInfo, name: e.target.value })}
          />
          <TextField
            label="Price"
            type="number"
            fullWidth
            margin="dense"
            value={updatedProductInfo.price}
            onChange={(e) => setUpdatedProductInfo({ ...updatedProductInfo, price: e.target.value })}
          />
          <TextField
            label="Category"
            fullWidth
            select
            value={updatedProductInfo.category}
            onChange={(e) => setUpdatedProductInfo({ ...updatedProductInfo, category: e.target.value })}
            required
            variant="outlined"
          >
            {['Casual', 'Formal', 'Ethnic', 'Party'].map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>



          <TextField
            label="Image URL"
            fullWidth
            value={updatedProductInfo.image}
            onChange={(e) => setUpdatedProductInfo({ ...updatedProductInfo, image: e.target.value })}
            required
            variant="outlined"
          />



<TextField
      label="Care Instructions"
      fullWidth
      select
      value={updatedProductInfo.careInstructions || ''}
      onChange={(e) => setUpdatedProductInfo({ ...updatedProductInfo, careInstructions: e.target.value })}
      required
      variant="outlined"
    >
      {['Machine Wash', 'Hand Wash Only', 'Dry Clean Only'].map((option) => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </TextField>

        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">Cancel</Button>
          <Button onClick={handleUpdateProduct} color="primary">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Large Image Dialog */}
      <Dialog open={imageDialogOpen} onClose={handleCloseImageDialog}>
        <DialogContent>
          <img src={selectedImage} alt="Product" style={{ width: '100%', height: 'auto' }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImageDialog} color="secondary">Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
