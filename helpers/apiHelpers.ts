const API_URL = process.env.API_URL;

export async function sendRequest(request, method, endpoint, data = null) {
  const url = `${API_URL}${endpoint}`;
  const options = { method, data };
  return await request(url, options);
}

//не использовала нигде, позже поняла, что можно внедрить

/* в тесте
import { sendRequest } from './helpers/apiHelpers.js';

test('GET /users', async ({ request }) => {
  const response = await sendRequest(request, 'GET', '/users');
  expect(response.status()).toBe(200);
});

test('POST /orders', async ({ request }) => {
  const orderData = { productId: 1, quantity: 2 };
  const response = await sendRequest(request, 'POST', '/orders', orderData);
  expect(response.status()).toBe(201);
});
 */
