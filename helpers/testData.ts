// helpers/testData.ts
export const getTestUser = () => {
  const timestamp = Date.now();

  return {
    firstname: 'Тест',
    lastname: 'Тестов',
    email: `testEmail_${timestamp}@mail.ru`,
    phone: `+375${timestamp}`.slice(0, 13),
    username: `userName_${timestamp}`,
    password: '12345678',
  };
};
