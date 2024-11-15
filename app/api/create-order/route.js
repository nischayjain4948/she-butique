import Razorpay from 'razorpay';

const razorpay = new Razorpay({
    key_id: 'rzp_test_bMoebitCJCkjwp', // Your Razorpay test key
    key_secret: '50tSsDOOkABWcW3K0cT3KGro', // Your Razorpay test key secret
});

export async function POST(req) {
  const { amount, userDetails, cartItems, deliveryAddress } = await req.json();
  
  try {
    const razorpayOrder = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    return new Response(JSON.stringify({ success: true, razorpayOrderId: razorpayOrder.id }), { status: 200 });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return new Response(JSON.stringify({ success: false, message: 'Order creation failed' }), { status: 500 });
  }
}
