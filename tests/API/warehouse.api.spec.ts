import { test, expect } from '@playwright/test';

const API_URL = process.env.API_URL; //скрытый, создан глобально

const newWarehouse = () => {
  const timestamp = Date.now();
  return {
    title: ` ${timestamp}`,
    address: `Street ${timestamp},`.slice(0, 3),
  };
};

test.describe('API: WAREHOUSE', () => {
  test('API-01_1: POST /warehouse — создание нового warehouse', async ({
    request,
  }) => {
    const warehouseData = newWarehouse();
    const response = await request.post(`${API_URL}/warehouse`, {
      data: warehouseData,
    });

    expect(response.status()).toBe(201);

    const responseBody = await response.json();

    expect(responseBody).toHaveProperty('title');
    expect(responseBody).toHaveProperty('title');
    expect(responseBody.title).toBe(warehouseData.title);
    expect(responseBody.address).toBe(warehouseData.address);

    expect(typeof responseBody.id).toBe('number');
    expect(responseBody.id).toBeGreaterThan(0);
  });

  test('API-02_1: GET /warehouse — получить все warehouse', async ({
    request,
  }) => {
    const response = await request.get(`${API_URL}/warehouse`, {});
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody.length).toBeGreaterThan(0);
  });

  test('API-02_2: GET /warehouse/{warehouseId} — получить по ID warehouse', async ({
    request,
  }) => {
    const testWarehouse = {
      id: 1,
      title: 'mogilevпо',
      address: 'pervomaiskaya 2',
    };

    const response = await request.get(
      `${API_URL}/warehouse/${testWarehouse.id}`,
      {}
    );
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('title');
    expect(responseBody).toHaveProperty('address');
    expect(responseBody.title).toBe(testWarehouse.title);
    expect(responseBody.address).toBe(testWarehouse.address);
  });

  test('API-03_1: GET /warehouse — получить по ID warehouse(негативный)', async ({
    request,
  }) => {
    const response = await request.get(`${API_URL}/warehouse/${9999999}`, {});
    expect(response.status()).toBe(404);
  });

  test('API-04_1: PATCH /warehouse — обновить warehouse', async ({
    request,
  }) => {
    const response = await request.post(`${API_URL}/warehouse`, {
      data: newWarehouse(),
    });

    expect(response.status()).toBe(201);
    const responseBody = await response.json();

    const updateWarehouse = {
      title: `new title ${Date.now()}`,
      address: `new address_${Date.now()}`,
    };

    const responseUpdate = await request.patch(
      `${API_URL}/warehouse/${responseBody.id}`,
      {
        data: updateWarehouse,
      }
    );

    expect(responseUpdate.status()).toBe(200);

    const responseUpdateBody = await responseUpdate.json();

    expect(responseUpdateBody).toHaveProperty('title');
    expect(responseUpdateBody).toHaveProperty('address');
    expect(responseUpdateBody.title).toBe(updateWarehouse.title);
    expect(responseUpdateBody.address).toBe(updateWarehouse.address);
  });

  test('API-04_2: PATCH /warehouse — обновить warehouse(негативный)', async ({
    request,
  }) => {
    const updateWarehouse = {
      title: `new title ${Date.now()}`,
      address: `new address_${Date.now()}`,
    };

    const responseUpdate = await request.patch(
      `${API_URL}/warehouse/${99999999}`,
      {
        data: updateWarehouse,
      }
    );

    expect(responseUpdate.status()).toBe(404);
  });

  test.skip('API-05_1: POST /warehouse — обновить inventory', async ({
    request,
  }) => {
    //не реализована
  });
  test.skip('API-05_2: POST /warehouse — обновить inventory(негативный)', async ({
    request,
  }) => {
    //не реализована
  });
});
