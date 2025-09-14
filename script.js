const apiUrl = 'http://localhost:3000';

function showSection(id) {
  document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// --- Клиенты ---
async function fetchClients() {
  const res = await fetch(`${apiUrl}/clients`);
  const clients = await res.json();
  const ul = document.getElementById('clientsList');
  ul.innerHTML = '';
  clients.forEach(c => {
    const li = document.createElement('li');
    li.textContent = `${c.id}: ${c.name}`;
    ul.appendChild(li);
  });
  // Обновляем селекты для счетов, транзакций и налогов
  updateClientSelects(clients);
}

async function addClient() {
  const name = document.getElementById('clientName').value;
  if(!name) return;
  await fetch(`${apiUrl}/clients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  document.getElementById('clientName').value = '';
  fetchClients();
}

// --- Счета ---
async function fetchAccounts() {
  const res = await fetch(`${apiUrl}/accounts`);
  const accounts = await res.json();
  const table = document.getElementById('accountsTable');
  table.innerHTML = '<tr><th>ID</th><th>Клиент</th><th>Название</th><th>Баланс</th></tr>';
  accounts.forEach(a => {
    const row = table.insertRow();
    row.insertCell(0).textContent = a.id;
    row.insertCell(1).textContent = a.client_id;
    row.insertCell(2).textContent = a.name;
    row.insertCell(3).textContent = a.balance;
  });
  updateAccountSelects(accounts);
}

async function addAccount() {
  const client_id = document.getElementById('accountClientSelect').value;
  const name = document.getElementById('accountName').value;
  const balance = parseFloat(document.getElementById('accountBalance').value) || 0;
  if(!client_id || !name) return;
  await fetch(`${apiUrl}/accounts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id, name, balance })
  });
  document.getElementById('accountName').value = '';
  document.getElementById('accountBalance').value = '';
  fetchAccounts();
}

// --- Транзакции ---
async function fetchTransactions() {
  const res = await fetch(`${apiUrl}/transactions`);
  const txs = await res.json();
  const table = document.getElementById('transactionsTable');
  table.innerHTML = '<tr><th>ID</th><th>Счет</th><th>Тип</th><th>Сумма</th><th>Описание</th></tr>';
  txs.forEach(t => {
    const row = table.insertRow();
    row.insertCell(0).textContent = t.id;
    row.insertCell(1).textContent = t.account_id;
    row.insertCell(2).textContent = t.type;
    row.insertCell(3).textContent = t.amount;
    row.insertCell(4).textContent = t.description;
  });
}

async function addTransaction() {
  const account_id = document.getElementById('transactionAccountSelect').value;
  const type = document.getElementById('transactionType').value;
  const amount = parseFloat(document.getElementById('transactionAmount').value);
  const description = document.getElementById('transactionDesc').value;
  if(!account_id || !type || !amount) return;
  await fetch(`${apiUrl}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ account_id, type, amount, description })
  });
  document.getElementById('transactionAmount').value = '';
  document.getElementById('transactionDesc').value = '';
  fetchTransactions();
}

// --- Налоги ---
async function fetchTaxes() {
  const res = await fetch(`${apiUrl}/taxes`);
  const taxes = await res.json();
  const table = document.getElementById('taxesTable');
  table.innerHTML = '<tr><th>ID</th><th>Счет</th><th>Ставка</th></tr>';
  taxes.forEach(t => {
    const row = table.insertRow();
    row.insertCell(0).textContent = t.id;
    row.insertCell(1).textContent = t.account_id;
    row.insertCell(2).textContent = t.rate;
  });
}

async function addTax() {
  const account_id = document.getElementById('taxAccountSelect').value;
  const rate = parseFloat(document.getElementById('taxRate').value) || 0.2;
  if(!account_id) return;
  await fetch(`${apiUrl}/taxes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ account_id, rate })
  });
  document.getElementById('taxRate').value = '';
  fetchTaxes();
}

// --- Обновление селектов ---
function updateClientSelects(clients){
  const select = document.getElementById('accountClientSelect');
  select.innerHTML = '';
  clients.forEach(c => select.innerHTML += `<option value="${c.id}">${c.name}</option>`);
}

function updateAccountSelects(accounts){
  ['transactionAccountSelect','taxAccountSelect'].forEach(id=>{
    const select = document.getElementById(id);
    select.innerHTML = '';
    accounts.forEach(a=>select.innerHTML+=`<option value="${a.id}">${a.name}</option>`);
  });
}

// --- Инициализация ---
showSection('clients');
fetchClients();
fetchAccounts();
fetchTransactions();
fetchTaxes();
