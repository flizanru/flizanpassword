const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
let secretKey = null; 
let iv = crypto.randomBytes(16);
let appDataPath = '';
const keyFileName = 'encryption.key';

function init(userDataPath) {
  appDataPath = path.join(userDataPath, 'passwords.json');
  const keyPath = path.join(userDataPath, keyFileName);

  if (fs.existsSync(keyPath)) {
    secretKey = fs.readFileSync(keyPath);
  } else {
    secretKey = crypto.randomBytes(32);
    fs.writeFileSync(keyPath, secretKey);
  }
}

function encrypt(text) {
  iv = crypto.randomBytes(16); 
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

function savePassword({ name, username, password }) {
  const encryptedPassword = encrypt(password);
  const data = { name, username, password: encryptedPassword };

  let passwords = [];
  if (fs.existsSync(appDataPath)) {
    passwords = JSON.parse(fs.readFileSync(appDataPath));
  }

  passwords.push(data);
  fs.writeFileSync(appDataPath, JSON.stringify(passwords));
  return data;
}

function loadPasswords() {
  if (!fs.existsSync(appDataPath)) return [];
  const passwords = JSON.parse(fs.readFileSync(appDataPath));
  return passwords.map(item => ({
    ...item,
    password: decrypt(item.password)
  }));
}

function deletePassword(index) {
  if (!fs.existsSync(appDataPath)) return;
  let passwords = JSON.parse(fs.readFileSync(appDataPath));
  passwords.splice(index, 1);
  fs.writeFileSync(appDataPath, JSON.stringify(passwords));
}

module.exports = {
  init,
  savePassword,
  loadPasswords,
  deletePassword
};