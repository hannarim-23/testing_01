import { test, expect } from '@playwright/test';
import { testProducts } from '../../fixtures/testProductsData';

const API_URL = process.env.API_URL;
const invalid = 9999999;

const newProduct = () => {
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

test.describe('API: PRODUCT', () => {
  const createdProductIds: number[] = [];

  test.afterEach(async ({ request }) => {
    for (const id of createdProductIds) {
      await request.delete(`${API_URL}/product/${id}`);
    }
    createdProductIds.length = 0;
  });

  test('API-01_1: POST /product — создание нового продукта', async ({
    request,
  }) => {
    const productData = newProduct();
    const response = await request.post(`${API_URL}/product`, {
      data: productData,
    });

    expect(response.status()).toBe(201);

    const responseBody = await response.json();

    expect(responseBody).toHaveProperty('name');
    expect(responseBody).toHaveProperty('description');
    expect(responseBody).toHaveProperty('price');
    expect(responseBody).toHaveProperty('category');
    expect(responseBody).toHaveProperty('urlImage');

    expect(responseBody.name).toBe(productData.name);
    expect(responseBody.description).toBe(productData.description);
    expect(Number(responseBody.price)).toBe(productData.price);
    expect(responseBody.category).toBe(productData.category);
    expect(responseBody.urlImage).toBe(productData.urlImage);

    expect(typeof responseBody.id).toBe('number');
    expect(responseBody.id).toBeGreaterThan(0);

    createdProductIds.push(responseBody.id);
  });

  test('API-01_2: POST /product — создание нового продукта(негативный)', async ({
    request,
  }) => {
    const invalidProduct = {
      name: '', // пустое имя
      price: 'not a number',
      // отсутствуют обязательные поля
    };

    const response = await request.post(`${API_URL}/product`, {
      data: invalidProduct,
    });

    expect(response.status()).toBe(400);
  });

  test('API-02_1: GET /product — получить все продукты', async ({
    request,
  }) => {
    const response = await request.get(`${API_URL}/product`, {});
    const responseBody = await response.json();

    expect(response.status()).toBe(200);
    expect(Array.isArray(responseBody)).toBe(true);
  });

  test('API-03_1: GET /product/{id} — получить продукт', async ({
    request,
  }) => {
    const response = await request.get(`${API_URL}/product/${testProducts.id}`);

    expect(response.status()).toBe(200);
    const product = await response.json();

    expect(product.id).toBe(testProducts.id);
    expect(product.name).toBe(testProducts.name);
    expect(product.description).toBe(testProducts.description);
    expect(product.price).toBe(testProducts.price);
    expect(product.category).toBe(testProducts.category);
    expect(product.urlImage).toBe(testProducts.urlImage);
  });

  test('API-03_2: GET /product/{productId} — получить продукт по ID(негативный)', async ({
    request,
  }) => {
    const productId = invalid;
    const response = await request.get(`${API_URL}/product/${productId}`, {});

    expect(response.status()).toBe(404);
  });

  test('API-04_1: PATCH /product/{productId} — Обновить данные товара', async ({
    request,
  }) => {
    // 1. Сначала создаём продукт, который будем обновлять
    const createResponse = await request.post(`${API_URL}/product`, {
      data: newProduct(),
    });
    expect(createResponse.status()).toBe(201);
    const createdProduct = await createResponse.json();
    const productId = createdProduct.id;

    // Добавляем в список на удаление после теста
    createdProductIds.push(productId);

    const updateData = {
      name: `Product_UPDATE`,
      description: 'some info UPDATE',
      price: 111,
      category: 'ELECTRONICS',
      urlImage: 'https://example.com/images/keyboard.png',
    };

    //const productId = testProductId;
    const response = await request.patch(`${API_URL}/product/${productId}`, {
      data: updateData,
    });

    const responseBody = await response.json();

    expect(response.status()).toBe(200);
    expect(responseBody.name).toBe(updateData.name);
    expect(responseBody.description).toBe(updateData.description);
    expect(Number(responseBody.price)).toBe(updateData.price);
    expect(responseBody.category).toBe(updateData.category);
    expect(responseBody.urlImage).toBe(updateData.urlImage);
  });

  test('API-04_2: PATCH /product/{productId} — Обновить данные товара(негативный)', async ({
    request,
  }) => {
    const updateData = {
      name: `Product_UPDATE`,
      description: 'some info UPDATE',
      price: 111,
      category: 'ELECTRONICS',
      urlImage: 'https://example.com/images/keyboard.png',
    };

    const productId = invalid;
    const response = await request.patch(`${API_URL}/product/${productId}`, {
      data: updateData,
    });

    expect(response.status()).toBe(404);
  });

  test('API-05_1: DELETE /product/{productId} — УДАЛИТЬ ТОВАР', async ({
    request,
  }) => {
    const createResponse = await request.post(`${API_URL}/product`, {
      data: newProduct(),
    });

    const product = await createResponse.json();
    const productId = product.id;

    // Удаляем
    const deleteResponse = await request.delete(
      `${API_URL}/product/${productId}`,
      {}
    );
    expect(deleteResponse.status()).toBe(200);

    // Проверяем, что удалён
    const getResponse = await request.get(`${API_URL}/product/${productId}`);
    expect(getResponse.status()).toBe(404);
  });

  test('API-05_2: DELETE /product/{productId} — УДАЛИТЬ ТОВАР(негативный)', async ({
    request,
  }) => {
    const deleteResponse = await request.delete(
      `${API_URL}/product/${invalid}`,
      {}
    );

    expect(deleteResponse.status()).toBe(404);
  });
});
