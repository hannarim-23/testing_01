// helpers/testData.ts
export const getTestUser = () => {
    const timestamp = Date.now();
    
    return {
        email: `testEmail_${timestamp}@mail.ru`,
        phone: `+${timestamp}`,
        username: `userName_${timestamp}`,
        firstname: 'Тест',
        lastname: 'Тестов',
        password: '12345678',
    };
};