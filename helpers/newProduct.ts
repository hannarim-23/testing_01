export const newProduct = () => {
  const timestamp = Date.now();
  return {
    name: `Product_${timestamp}`,
    description: 'some info',
    price: 555,
    category: 'ELECTRONICS',
    urlImage:
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=500',
  };
};