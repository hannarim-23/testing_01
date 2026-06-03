export const newUser = () => {
  const timestamp = Date.now();
  return {
    firstname: 'Ivan',
    lastname: 'Ivanov',
    phoneNumber: `+37529${timestamp}`.slice(0, 13),
    email: `ivan.ivanov.${timestamp}@example.com`,
    username: `ivan_ivanov_${timestamp}`,
    password: '12345678',
    role: 'USER',
  };
};