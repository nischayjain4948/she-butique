// app/api/admin/products/route.js
import { prisma } from '@/lib/prisma'; // Import the Prisma client



export async function POST(req) {
  try {
    // Parse the JSON body
    const body = await req.json();
    

    // Destructure and validate the incoming fields
    const {
      name,
      description,
      price,
      image,
      category,
      quantity,
      material,
      size,
      color,
      careInstructions,
      brand,
      clothingType,
      specificType,
      isTrending = false,
      isNewArrival = false,
    } = body;

    // Check if essential fields are missing or invalid
    if (!name || !description || !price || !category) {
      throw new Error("Required fields are missing or invalid.");
    }

    // Convert `size` and `color` fields to arrays if they are comma-separated strings
    const sizes = size ? size.split(",") : [];
    const colors = color ? color.split(",") : [];

    // Generate keywords for improved search
    const keywords = [
      specificType,
      clothingType,
      brand,
      category,
      sizes.map( (s) => `${specificType} ${s}`),
      colors.map( (c) => `${c} ${specificType}`),
      isTrending ? "trending" : null,
      isNewArrival ? "new" : null,
    ].filter(Boolean); // Remove null values

    // Create a new product in the database
    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        image,
        category,
        quantity: parseInt(quantity),
        material,
        sizes,
        colors,
        careInstructions,
        brand,
        clothingType,
        specificType,
        keywords:keywords.flat(),
        isNewArrival,
        isTrending,
      },
    });

    // Check if product creation was successful
    if (!newProduct) {
      throw new Error("Product creation failed; received null.");
    }

    // Send a success response
    return new Response(
      JSON.stringify({ message: "Product added successfully", product: newProduct }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.log("Error in POST function:", error.message);
    
    // Send an error response with more specific error information
    return new Response(
      JSON.stringify({
        error: "Failed to add product",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
  
}


export async function GET(req) {
  try {
    const products = await prisma.product.findMany();
    console.log(products);
    return new Response(JSON.stringify(products), { status: 200 });
  } catch (error) {
    // Safely handle the error logging
    console.error("Error fetching products:", error?.message || error);

    // Return a generic error response
    return new Response(JSON.stringify({ error: 'Error fetching products' }), { status: 500 });
  }
}


