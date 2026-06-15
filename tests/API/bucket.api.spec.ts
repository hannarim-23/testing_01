import { test, expect } from '@playwright/test';
import { clearBucket } from '../../helpers/cleanup';

const API_URL = process.env.API_URL;
const invalidUser = 0;
const userId = 1; // корзина админа
const invalid = 999999;
const productId = 5;
const productIds = [10, 11, 12];
const userIdFortestBucket = 12; //корзина не пуста

test.describe('API: BUCKET', () => {
  test.afterEach(async ({ request }) => {
    await clearBucket(request, userId);
  });

  test('API-01_1: GET /bucket/{userId} — получить корзину юзера', async ({
    request,
  }) => {
    const response = await request.get(
      `${API_URL}/bucket/${userIdFortestBucket}`,
      {}
    );

    expect(response.status()).toBe(200);
    const responseBody = await response.json();

    expect(responseBody).toHaveProperty('id');
    console.log(responseBody);
    expect(responseBody).toHaveProperty('products');
    expect(responseBody.products[0]).toHaveProperty('product_id');
    expect(responseBody.products[0]).toHaveProperty('bucket_id');
    expect(responseBody.products[0]).toHaveProperty('product');
  });

  test('API-01_2: GET /bucket/{userId} — получить корзину юзера(негативный)', async ({
    request,
  }) => {
    const response = await request.get(`${API_URL}/bucket/${invalidUser}`, {});

    expect(response.status()).toBe(404);

    const responseBody = await response.json();
    expect(responseBody.message).toContain(
      `Bucket not found for user with ID ${invalidUser}`
    );
  });

  test('API-02_1: POST /bucket/{userId}/addProduct — добавить товар в корзину юзера', async ({
    request,
  }) => {
    const response = await request.post(
      `${API_URL}/bucket/${userId}/addProduct`,
      {
        data: { productId },
      }
    );

    expect(response.status()).toBe(201);

    const responseBody = await response.json();
    console.log(`Товар ${productId} добавлен в корзину`);
    expect(responseBody).toHaveProperty('product_id');
    expect(responseBody).toHaveProperty('bucket_id');
    expect(responseBody.product_id).toBe(productId);
  });

  test('API-02_2: POST /bucket/{userId}/addProduct — добавить НЕСКОЛЬКО товаров в корзину юзера', async ({
    request,
  }) => {
    for (const productId of productIds) {
      const response = await request.post(
        `${API_URL}/bucket/${userId}/addProduct`,
        {
          data: { productId },
        }
      );

      expect(response.status()).toBe(201);
      console.log(`Товар ${productId} добавлен в корзину`);
    }
  });

  test('API-02_3: POST /bucket/{userId}/addProduct — добавить товар в корзину юзера(негативный)', async ({
    request,
  }) => {
    const productId = invalid;

    const response = await request.post(
      `${API_URL}/bucket/${userId}/addProduct`,
      {
        data: { productId },
      }
    );

    expect(response.status()).toBe(404);
  });

  test('API-03_1: DELETE /bucket/{userId}/removeProduct — удаление товара из корзины юзера', async ({
    request,
  }) => {
    const response = await request.post(
      `${API_URL}/bucket/${userId}/addProduct`,
      {
        data: { productId },
      }
    );

    //добавили
    expect(response.status()).toBe(201);
    const responseBody = await response.json();
    console.log(`Товар ${productId} добавлен в корзину`);
    expect(responseBody).toHaveProperty('product_id');
    expect(responseBody).toHaveProperty('bucket_id');

    //удаляем
    const deleteResponse = await request.delete(
      `${API_URL}/bucket/${userId}/removeProduct`,
      {
        data: { productId },
      }
    );

    expect(deleteResponse.status()).toBe(200);
    const bucket = await request.get(`${API_URL}/bucket/${userId}`);
    const bucketData = await bucket.json();
    const productRemoved = !bucketData.products.some(
      (p) => p.product_id === productId
    );
    expect(productRemoved).toBe(true);
  });

  test('API-03_2: DELETE /bucket/{userId}/removeProduct — удаление товара из корзины юзера (негативный)', async ({
    request,
  }) => {
    const response = await request.post(
      `${API_URL}/bucket/${userId}/addProduct`,
      {
        data: { productId },
      }
    );

    expect(response.status()).toBe(201); //добавили
    const responseBody = await response.json();
    console.log(`Товар ${productId} добавлен в корзину`);
    expect(responseBody).toHaveProperty('product_id');
    expect(responseBody).toHaveProperty('bucket_id');

    //удаляем из не правильного юзера
    const deleteResponseUser = await request.delete(
      `${API_URL}/bucket/${invalidUser}/removeProduct`,
      {
        data: { productId },
      }
    );
    expect(deleteResponseUser.status()).toBe(404);

    //удаляем не правильный товар
    const deleteResponseProduct = await request.delete(
      `${API_URL}/bucket/${userId}/removeProduct/${invalid}`
    );
    expect(deleteResponseProduct.status()).toBe(404);
  });
});
