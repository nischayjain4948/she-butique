// app/admin/AddProductForm.js
'use client';

import { useState } from 'react';
import { Button, TextField, Grid, CircularProgress, Alert, Paper, Typography, MenuItem, Dialog, DialogActions, DialogContent, DialogTitle, Radio, RadioGroup, FormControlLabel, FormLabel } from '@mui/material';
import { useRouter } from 'next/navigation';
import useAdminStore from '../store/store';

export default function AddProductForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [material, setMaterial] = useState('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [careInstructions, setCareInstructions] = useState('');
  const [brand, setBrand] = useState('');
  const [clothingType, setClothingType] = useState('');
  const [specificType, setSpecificType] = useState('');
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [open, setOpen] = useState(false); // State to manage dialog open/close
  const router = useRouter();

  const incrementProductCount = useAdminStore((state) => state.incrementProductCount);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const productData = { 
      name, description, price, image, category, quantity, material, 
      size, color, careInstructions, brand, clothingType, specificType, isNewArrival:Boolean(isNewArrival), isTrending:Boolean(isTrending)
    };

    console.log(productData);

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (!res.ok) throw new Error('Failed to add product');

      setName('');
      setDescription('');
      setPrice('');
      setImage('');
      setCategory('');
      setQuantity('');
      setMaterial('');
      setSize('');
      setColor('');
      setCareInstructions('');
      setBrand('');
      setClothingType('');
      setSpecificType('');
      setIsNewArrival(false);
      setIsTrending(false);
      setLoading(false);
      setSuccess("Product added successfully!");
      incrementProductCount();
      // localStorage.removeItem('products');
      setTimeout(() => setSuccess(null), 2000);
      router.refresh();
      handleClose();

    } catch (error) {
      setError('Error adding product. Please try again.');
      setTimeout(() => setError(null), 2000);
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="contained" color="primary" onClick={handleOpen}>Add New Product</Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add Product</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}><TextField label="Product Name" fullWidth value={name} onChange={(e) => setName(e.target.value)} required variant="outlined" /></Grid>
              <Grid item xs={12}><TextField label="Description" fullWidth multiline rows={4} value={description} onChange={(e) => setDescription(e.target.value)} required variant="outlined" /></Grid>
              <Grid item xs={12}><TextField label="Price" fullWidth type="number" value={price} onChange={(e) => setPrice(e.target.value)} required variant="outlined" /></Grid>
              <Grid item xs={12}><TextField label="Quantity" fullWidth type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required variant="outlined" /></Grid>
              <Grid item xs={12}><TextField label="Image URL" fullWidth value={image} onChange={(e) => setImage(e.target.value)} required variant="outlined" /></Grid>
             
              {/* Additional Fields */}
              <Grid item xs={12}><TextField label="Material" fullWidth value={material} onChange={(e) => setMaterial(e.target.value)} required variant="outlined" /></Grid>
              <Grid item xs={12}><TextField label="Size" fullWidth value={size} onChange={(e) => setSize(e.target.value)} required variant="outlined" placeholder="e.g., S, M, L, XL" /></Grid>
              <Grid item xs={12}><TextField label="Color" fullWidth value={color} onChange={(e) => setColor(e.target.value)} required variant="outlined"   placeholder="e.g., Red, Blue, Green" /></Grid>
             

   
              <Grid item xs={12}><TextField label="Category" fullWidth select value={category} onChange={(e) => setCategory(e.target.value)} required variant="outlined">{['Casual', 'Formal', 'Ethnic', 'Party'].map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}</TextField></Grid>

              <Grid item xs={12}><TextField label="Care Instructions" fullWidth select value={careInstructions} onChange={(e) => setCareInstructions(e.target.value)} required variant="outlined" > 
              {['Machine Wash', 'Hand Wash Only', 'Dry Clean Only'].map((option) => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
       </TextField>

              </Grid>
              <Grid item xs={12}><TextField label="Brand" fullWidth value={brand} onChange={(e) => setBrand(e.target.value)} required variant="outlined" /></Grid>
              <Grid item xs={12}><TextField label="Clothing Type" fullWidth select value={clothingType} onChange={(e) => setClothingType(e.target.value)} required variant="outlined">{['Innerwear','Top', 'Bottom'].map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12}><TextField label="Specific Type" fullWidth select value={specificType} onChange={(e) => setSpecificType(e.target.value)} required variant="outlined">{['Saree', 'Crop Top', 'Kurta', 'Blouse', 'Pants', 'Skirt', 'Thermal', 'Jeans', 'Plazo'].map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}</TextField></Grid>
              
              {/* Radio Buttons for Trending and New Arrival */}
              <Grid item xs={12}>
  <FormLabel component="legend">Is New Arrival?</FormLabel>
  <RadioGroup row value={isNewArrival.toString()} onChange={(e) => setIsNewArrival(e.target.value === 'true')}>
    <FormControlLabel value="true" control={<Radio />} label="Yes" />
    <FormControlLabel value="false" control={<Radio />} label="No" />
  </RadioGroup>
</Grid>
<Grid item xs={12}>
  <FormLabel component="legend">Is Trending?</FormLabel>
  <RadioGroup row value={isTrending.toString()} onChange={(e) => setIsTrending(e.target.value === 'true')}>
    <FormControlLabel value="true" control={<Radio />} label="Yes" />
    <FormControlLabel value="false" control={<Radio />} label="No" />
  </RadioGroup>
</Grid>

            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Add Product'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
