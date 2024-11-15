import Razorpay from 'razorpay';
import { prisma } from '../../../lib/prisma';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: 'rzp_test_bMoebitCJCkjwp',
  key_secret: '50tSsDOOkABWcW3K0cT3KGro'
});

export async function POST(req) {
  let data;
  try {
    data = await req.json();
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    return new Response(JSON.stringify({ success: false, message: "Invalid JSON in request body" }), { status: 400 });
  }

  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, userDetails, cartItems } = data || {};

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !userDetails || !cartItems) {
    console.error('Missing required fields:', { razorpay_payment_id, razorpay_order_id, razorpay_signature, userDetails, cartItems });
    return new Response(
      JSON.stringify({ success: false, message: 'Missing required fields in request body' }),
      { status: 400 }
    );
  }

  console.log('All fields are present. Proceeding with payment verification.');

  try {
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', razorpay.key_secret || '').update(body).digest('hex');

    if (expectedSignature === razorpay_signature) {
      console.log('Signature verified successfully.');

      const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
      console.log('Calculated totalAmount:', totalAmount);

      try {
        const order = await prisma.order.create({
          data: {
            user: {
              connect: { email: userDetails.email },
            },
            totalAmount,
            deliveryName: userDetails?.name || "",
            deliveryAddress: userDetails.address,
            deliveryCity: userDetails.city,
            deliveryCountry: userDetails.country,
            deliveryPincode: userDetails.pincode,
            deliveryPhone: userDetails.phone,
            deliveryAlternatePhone: userDetails.alternatePhone,
            deliveryLandmark: userDetails.landmark,
            status: 'Paid',
            products: {
              create: cartItems.map((item) => ({
                product: {
                  connect: { id: item.id },
                },
                quantity: parseInt(item.quantity),
                price: parseFloat(item.price),
              })),
            },

              razorpayPaymentId: razorpay_payment_id,
              razorpayOrderId: razorpay_order_id,
              razorpaySignature: razorpay_signature,
          },
        });

        console.log('Order created successfully:', order);
        return new Response(JSON.stringify({ success: true, orderId: order.id }), { status: 200 });
      } catch (prismaError) {
        console.error('Prisma error:', prismaError);
        return new Response(JSON.stringify({ success: false, message: 'Failed to create order in database' }), { status: 500 });
      }

    } else {
      console.error('Signature mismatch:', { expectedSignature, razorpay_signature });
      return new Response(JSON.stringify({ success: false, message: 'Signature mismatch' }), { status: 400 });
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    return new Response(JSON.stringify({ success: false, message: 'Payment verification failed' }), { status: 500 });
  }
}
