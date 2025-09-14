import { createClient } from '@supabase/supabase-js';
const supabaseUrl = "https://fanwgzwdaeuxnqqnyhcf.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhbndnendkYWV1eG5xcW55aGNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NTk4ODIsImV4cCI6MjA3MzQzNTg4Mn0.SY3Z7G_3TyLt-9ZuIVnqes1tvxFzrrT3oE9nX8Cw-Nc"
const supabase = supabase.createClient(supabaseUrl, supabaseKey);
function showSection(id) {
  document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// --- Клиенты ---
async function fetchClients() {
  const { data: clients, error } = await supabase.from('clients').select('*');
  if(error) return console.error(error);

  const ul = document.getElementById('clientsList');
  ul.innerHTML = '';
  clients.forEach(c => {
    const li = document.createElement('li');
    li.textContent = `${c.id}: ${c.name}`;
    ul.appendChild(li);
  });
  updateClientSelects(clients);
}

async function addClient() {
  const name = document.getElementById('clientName').value;
  if(!name) return;
  const { error } = await supabase.from('clients').insert([{ name }]);
  if(error) return console.error(error);
  document.getElementById('clientName').value = '';
  fetchClients();
}

// --- Счета ---
async function fetchAccounts() {
  const { data: accounts, error } = await supabase.from('accounts').select('*');
  if(error) return console.error(error);

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
  const { error } = await supabase.from('accounts').insert([{ client_id, name, balance }]);
  if(error) return console.error(error);
  document.getElementById('accountName').value = '';
  document.getElementById('accountBalance').value = '';
  fetchAccounts();
}

// --- Транзакции ---
async function fetchTransactions() {
  const { data: txs, error } = await supabase.from('transactions').select('*');
  if(error) return console.error(error);

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

  // Добавляем транзакцию
  const { error } = await supabase.from('transactions').insert([{ account_id, type, amount, description }]);
  if(error) return console.error(error);

  // Если доход, добавляем налог
  if(type === 'income') {
    const taxAmount = amount * 0.2;
    await supabase.from('transactions').insert([{ account_id, type: 'expense', amount: taxAmount, description: 'tax' }]);
  }

  document.getElementById('transactionAmount').value = '';
  document.getElementById('transactionDesc').value = '';
  fetchTransactions();
}

// --- Налоги ---
async function fetchTaxes() {
  const { data: taxes, error } = await supabase.from('taxes').select('*');
  if(error) return console.error(error);

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

  const { error } = await supabase.from('taxes').insert([{ account_id, rate }]);
  if(error) return console.error(error);

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
