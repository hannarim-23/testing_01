const API_URL = process.env.API_URL;

export   const clearBucket = async (request, userId) => {
  const bucket = await request.get(`${API_URL}/bucket/${userId}`);
  const bucketData = await bucket.json();
  
  for (const item of bucketData.products) {
      await request.delete(`${API_URL}/bucket/${userId}/removeProduct`, {
          data: { productId: item.product_id }
      });
  }
  console.log('✅ Корзина очищена');
};