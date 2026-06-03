import { test, expect } from '@playwright/test';
//import { clearBucket } from '../../helpers/cleanup';

const API_URL = process.env.API_URL; //скрытый, создан глобально
const userId = 1; // корзина админа
const invalid = 999999; //не валидное значение

test.describe('API: ORDER', () => {
  test('API-01_1: GET /order — получить все заказы (в Админ части)', async ({
    request,
  }) => {
    const response = await request.get(`${API_URL}/order`);

    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBe(true);

    if (responseBody.length > 0) {
      expect(responseBody[0]).toHaveProperty('id');
      expect(responseBody[0]).toHaveProperty('orderDate');
      expect(responseBody[0]).toHaveProperty('status');
      expect(responseBody[0]).toHaveProperty('user_id');
      expect(responseBody[0]).toHaveProperty('user');
      expect(responseBody[0]).toHaveProperty('items');
    }
  });

  test('API-02_1: POST /order/{userId} — создать новый заказ для юзера', async ({
    request,
  }) => {
    const items = [
      {
        product_id: 116,
        quantity: 2,
      },
    ];

    const response = await request.post(`${API_URL}/order/${userId}`, {
      data: { items },
    });

    expect(response.status()).toBe(201);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('orderId');
    expect(responseBody.orderId).toBeGreaterThan(0);
  });

  test('API-02_2: POST /order/{userId} — создать новый заказ для юзера(негативный)', async ({
    request,
  }) => {
    const items = [
      {
        product_id: invalid,
        quantity: 2,
      },
    ];

    const response = await request.post(`${API_URL}/order/${userId}`, {
      data: { items },
    });

    expect(response.status()).toBe(404);
  });

  test('API-03_1: GET /order/{userId} — получить все заказы юзера', async ({
    request,
  }) => {
    const response = await request.get(`${API_URL}/order/${userId}`, {});

    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBe(true);

    if (responseBody.length > 0) {
      expect(responseBody[0]).toHaveProperty('id');
    }
  });

  test('API-03_2: GET /order/{userId} — получить все заказы юзера(негативный)', async ({
    request,
  }) => {
    const response = await request.get(`${API_URL}/order/${invalid}`, {});

    expect(response.status()).toBe(404);
    const errorBody = await response.json();
    expect(errorBody.message).toContain('not found');
  });

  test('API-04_1: PATCH /order/{userId} — изменить статус заказа', async ({
    request,
  }) => {
    // 1. Создаём заказ
    const createResponse = await request.post(`${API_URL}/order/${userId}`, {
      data: { items: [{ product_id: 116, quantity: 1 }] },
    });
    expect(createResponse.status()).toBe(201);
    const order = await createResponse.json();
    const orderId = order.orderId;

    // 2. Меняем статус
    const response = await request.patch(`${API_URL}/order/${orderId}/status`, {
      data: { status: 'SHIPPED' },
    });

    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody.status).toBe('SHIPPED');
  });

  test('API-04_2: PATCH /order/{userId} — изменить статус заказа(невалидный)', async ({
    request,
  }) => {
    const response = await request.patch(`${API_URL}/order/${invalid}/status`, {
      data: { status: 'SHIPPED' },
    });

    expect(response.status()).toBe(404);
    const errorBody = await response.json();
    expect(errorBody.message).toContain('not found');
  });
});
