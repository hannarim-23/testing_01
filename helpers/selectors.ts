export const selectors = {
    // Регистрация
    firstnameInput: 'input[name="firstname"]',
    lastnameInput: 'input[name="lastname"]',
    emailInput: 'input[name="email"]',
    usernameInput: 'input[name="username"]',
    phoneInput: 'input[name="phoneNumber"]',
    passwordInput: 'input[name="password"]',
    submitButton: 'button[type="submit"]',
    //errorMessage: 'email must be an email',
    errorMessage: 'Неверный email или пароль',
    errorPassword: 'Пароль обязателен',
    errorEmail: 'Email обязателен',
    
    // Логин
    loginEmailInput: 'input[name="email"]',
    loginPasswordInput: 'input[name="password"]',
    loginButton: 'button[type="submit"]',
    loginErrorMessage: 'Неверный email или пароль',
    
    // Каталог
    productCard: '.product-card, [data-testid="product"]',
    addToCartButton: 'button:has-text("В корзину")',
    
    // Корзина
    cartIcon: '[data-testid="cart-icon"], .cart-icon, a[href*="cart"]',
    cartItem: '.cart-item, [data-testid="cart-item"]',
    removeButton: 'button:has-text("Удалить")',
    totalPrice: '.total-price, [data-testid="total-price"]',
    checkoutButton: 'button:has-text("Оформить заказ")',
    emptyCartMessage: 'text=Ваша корзина пуста',
    
    // Заказы
    orderSuccessMessage: 'text=Заказ успешно создан',
};