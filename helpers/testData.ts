// helpers/testData.ts
export const getTestUser = () => {
    const timestamp = Date.now();
    
    return {
        email: `testEmail_${timestamp}@mail.ru`,
        phone: `+375${timestamp}`.slice(0,13),
        username: `userName_${timestamp}`,
        firstname: 'Тест',
        lastname: 'Тестов',
        password: '12345678',
    };
};