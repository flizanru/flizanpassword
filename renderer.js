const { ipcRenderer } = require('electron');

document.getElementById('password-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = document.getElementById('name').value;
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  await ipcRenderer.invoke('save-password', { name, username, password });
  loadPasswords();
  document.getElementById('password-form').reset();
  showNotification('Пароль успешно сохранен!');
});

async function loadPasswords() {
  const passwords = await ipcRenderer.invoke('load-passwords');
  const passwordList = document.getElementById('password-list');
  passwordList.innerHTML = passwords.map((pw, index) => `
    <div class="password-item bg-gray-800 p-4 rounded shadow flex flex-col">
      <div class="flex justify-between items-center">
        <div>
          <p><strong>Сервис:</strong> ${pw.name}</p>
          <p><strong>Имя пользователя:</strong> ${pw.username}</p>
        </div>
        <div class="flex space-x-2">
          <button class="copy-button text-green-400 hover:text-green-500" data-index="${index}" title="Копировать">
            <i class="fas fa-copy"></i>
          </button>
          <button class="delete-button text-red-400 hover:text-red-500" data-index="${index}" title="Удалить">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
      <p class="password mt-2 blurred cursor-pointer" data-password="${pw.password}">
        <strong>Пароль:</strong> ${pw.password}
      </p>
    </div>
  `).join('');

  document.querySelectorAll('.password').forEach(element => {
    element.addEventListener('click', () => {
      if (element.classList.contains('blurred')) {
        element.classList.remove('blurred');
        element.classList.add('unblurred');
      } else {
        element.classList.add('blurred');
        element.classList.remove('unblurred');
      }
    });
  });

  document.querySelectorAll('.copy-button').forEach(button => {
    button.addEventListener('click', (event) => {
      event.stopPropagation(); 
      const index = button.getAttribute('data-index');
      const password = passwords[index].password;
      navigator.clipboard.writeText(password).then(() => {
        showNotification('Пароль скопирован в буфер обмена!');
      });
    });
  });

  document.querySelectorAll('.delete-button').forEach(button => {
    button.addEventListener('click', async (event) => {
      event.stopPropagation(); 
      const index = button.getAttribute('data-index');
      await ipcRenderer.invoke('delete-password', index);
      loadPasswords();
      showNotification('Пароль успешно удален!');
    });
  });
}

function showNotification(message) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.classList.add('opacity-100');
  notification.classList.remove('opacity-0');
  setTimeout(() => {
    notification.classList.remove('opacity-100');
    notification.classList.add('opacity-0');
  }, 3000);
}

function generatePassword(length = 10) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    password += charset.charAt(Math.floor(Math.random() * n));
  }
  return password;
}

document.getElementById('generate-password').addEventListener('click', () => {
  const passwordField = document.getElementById('password');
  const newPassword = generatePassword();

  passwordField.value = newPassword;
  passwordField.type = 'text'; 

  passwordField.classList.remove('blurred', 'text-gray-400');
  passwordField.classList.add('unblurred', 'text-white');

  showNotification('Пароль сгенерирован!');
});

document.getElementById('password').addEventListener('input', () => {
  const passwordField = document.getElementById('password');
  if (passwordField.type !== 'password') {
    passwordField.type = 'password';
    passwordField.classList.add('blurred', 'text-gray-400');
    passwordField.classList.remove('unblurred', 'text-white');
  }
});

loadPasswords();
