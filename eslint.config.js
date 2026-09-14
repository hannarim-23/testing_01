/*
//Экспортируем объект с настройками наружу, чтобы утилита ESLint в твоем проекте смогла его прочитать и применить.
module.exports = {
    env: { //env (Окружение): Объясняем линтеру, в каких средах живет наш код, чтобы он не пугался стандартных команд.
      browser: true, //разрешает использовать браузерные объекты (например, если ты решишь внутри теста выполнить window.location).
      es2021: true, //разрешает синтаксис стандартов JavaScript до 2021 года.
      node: true, //разрешает использовать глобальные переменные Node.js (например, process.env для чтения паролей или адресов стендов из системных переменных).
    },
    // Наследуем стандарты, правила Playwright и отключаем конфликты с Prettier. Вместо ручного прописывания 500 правил, подключаем готовые наборы (пакеты):
    extends: [
      'eslint:recommended', //базовые правила чистого JS (находит опечатки, мертвый код).
      'plugin:playwright/recommended', //главная фишка: официальные рекомендации от команды Playwright. Этот набор автоматически объясняет линтеру, что ключевые слова test, expect, page — это не ошибки, а встроенные инструменты фреймворка.
      'plugin:prettier/recommended', //включает Prettier внутри ESLint и отключает те правила линтера, которые могут конфликтовать с форматированием пробелов и кавычек.
    ],
    parserOptions: { //(Параметры разборщика кода):
      ecmaVersion: 'latest', //говорим линтеру, что пишем на самой свежей версии JS (чтобы он понимал современную асинхронность).
      sourceType: 'module', //разрешает использовать современный синтаксис подключения файлов через import и export.
    },
    //(Плагины): активируем 2 внешних плагина, которые установили через npm. Они расширяют возможности ESLint, добавляя в него специфические проверки для Playwright и Prettier.
    plugins: ['playwright', 'prettier'],
    rules: {
      'prettier/prettier': 'error', //если код визуально не соответствует правилам файла .prettierrc.js, линтер подсветит это как ошибку (красным).
      'no-unused-vars': 'warn', //если ты создала переменную (напр, локатор), но забыла применить её в тесте, она подсветится желтым (предупреждение).
      'no-console': 'off', //выключает запрет на console.log. Для обычных разработчиков оставлять логи плохо, но для QA в тестах — это способ дебага.
      'prefer-const': 'error', //заставляет менять let на const, если переменная ни разу не перезаписывалась (это делает код тестов стабильнее).
      'no-undef': 'error', //запрещает использовать несуществующие переменные (моментально ловит опечатки в названиях локаторов).
  
      // --- ЭКСКЛЮЗИВНЫЕ ПРАВИЛА ДЛЯ PLAYWRIGHT ---
      
      // 1. Запрещает оставлять пустые тест-кейсы или закомментированные тесты (test.only) в репозитории
      'playwright/no-focused-test': 'error',
      
      // 2. Запрещает использовать сырые hard-coded ожидания вроде page.waitForTimeout(5000)
      // Вместо этого линтер будет заставлять тебя использовать веб-ферсты (web-first assertions)
      'playwright/no-wait-for-timeout': 'warn',
      
      // 3. Следит, чтобы внутри тестов были реальные проверки (expect), иначе тест не имеет смысла
      //предупреждает, если внутри теста появляются условия if/else. Тест должен быть линейным и предсказуемым. Если в тесте есть if, значит, ты сама не знаешь, какое состояние страницы сейчас проверится, а это плохая практика.
      'playwright/no-conditional-in-test': 'warn',
      
      // 4. Запрещает делать проверки expect() без await, если они асинхронные
      'playwright/valid-expect': 'error',
    },
  };
  */

const playwright = require('eslint-plugin-playwright');
const prettier = require('eslint-plugin-prettier');
const eslint = require('@eslint/js');

module.exports = [
  // 1. Игнорируемые папки
  {
    ignores: ['node_modules/**', 'playwright-report/**', 'test-results/**', 'playwright/.cache/**'],
  },

  // 2. Базовые рекомендуемые правила JS
  eslint.configs.recommended,

  // 3. Конфиг и правила для Playwright
  {
    ...playwright.configs['flat/recommended'],
    // Говорим проверять абсолютно все файлы .js и .ts в любых папках проекта:
    files: ['**/*.{js,ts}'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/no-focused-test': 'error',
      'playwright/no-wait-for-timeout': 'warn',
      'playwright/no-conditional-in-test': 'warn',
      'playwright/valid-expect': 'error',

      // ДОБАВЬ СТРОЧКУ НИЖЕ, ЧТОБЫ ВЫКЛЮЧИТЬ ПРОВЕРКУ NETWORKIDLE:
      'playwright/no-networkidle': 'off',
    },
  },

  // 4. Правила форматирования Prettier и глобальные переменные
  {
    plugins: {
      prettier: prettier,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs', // Указываем, что работаем в среде CommonJS
      parser: require('typescript-eslint').parser,
      globals: {
        process: 'readonly',
        console: 'readonly',
        window: 'readonly',
      },
    },
    rules: {
      'prettier/prettier': [
        'error',
        {
          semi: true,
          trailingComma: 'es5',
          singleQuote: true,
          printWidth: 100,
          tabWidth: 2,
          useTabs: false,
        },
      ],
      'no-unused-vars': 'warn',
      'no-console': 'off',
      'prefer-const': 'error',
      'no-undef': 'error',
    },
  },
];
