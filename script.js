async function fetchCurrentBalances() {
    const response = await fetch('api/get_current_balances.php');
    const data = await response.json();
    const balancesDiv = document.getElementById('current-balances');
    balancesDiv.innerHTML = '<h2>Current Balances</h2>';
    let table = '<table><thead><tr><th>Account</th><th>Balance</th><th>Last Updated</th></tr></thead><tbody>';
    data.data.forEach(item => {
        table += `<tr><td><span class="math-inline">\{item\.name\}</td\><td\></span>{item.balance}</td><td>${item.entry_date}</td></tr>`;
    });
    table += '</tbody></table>';
    balancesDiv.innerHTML += table;
}

async function fetchBalanceData(accountId) {
    const response = await fetch(`api/get_balances.php?id=${accountId}`);
    const data = await response.json();
    const labels = data.data.map(entry => entry.entry_date);
    const balances = data.data.map(entry => entry.balance);
    const ctx = document.getElementById('balanceChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Account Balance',
                data: balances,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

async function fetchAccounts(){
    const response = await fetch('api/get_accounts.php');
    const data = await response.json();
    const select = document.getElementById('account-select');
    const updateAccountSelect = document.getElementById('update-account-select');
    select.innerHTML = '';
    updateAccountSelect.innerHTML = '';

    data.data.forEach(account => {
        const option = document.createElement('option');
        option.value = account.id;
        option.textContent = account.name;
        select.appendChild(option);
        updateAccountSelect.appendChild(option.cloneNode(true));
    });
    fetchBalanceData(data.data[0].id);
}

async function addAccount() {
    const name = document.getElementById('new-account-name').value;
    const response = await fetch('api/add_account.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `name=${name}`
    });
    fetchAccounts();
}

async function addBalance() {
    const accountId = document.getElementById('account-select').value;
    const entryDate = document.getElementById('balance-date').value;
    const balance = document.getElementById('balance-amount').value;
    const response = await fetch('api/add_balance.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `account_id=<span class="math-inline">\{accountId\}&entry\_date\=</span>{entryDate}&balance=${balance}`
    });
    fetchCurrentBalances();
    fetchBalanceData(accountId);
}

async function fetchBalancesForUpdate(){
    const accountId = document.getElementById('update-account-select').value;
    const response = await fetch(`api/get_balances.php?id=${accountId}`);
    const data = await response.json();
    const select = document.getElementById('update-balance-select');
    select.innerHTML = '';
    data.data.forEach(balance => {
        const option = document.createElement('option');
        option.value = balance.id;
        option.textContent = `${balance.entry_date} - ${balance.balance}`;
        select.appendChild(option);
    });
}

async function updateBalance(){
    const balanceId = document.getElementById('update-balance-select').value;
    const entryDate = document.getElementById('update-balance-date').value;
    const balance = document.getElementById('update-balance-amount').value;
    const response = await fetch('api/update_balance.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `balanceid=<span class="math-inline">\{balanceId\}&entry\_date\=</span>{entryDate}&balance=${balance}`
    });
    fetchCurrentBalances();
    fetchBalanceData(document.getElementById('update-account-select').value);
}

document.getElementById('add-account-button').addEventListener('click', addAccount);
document.getElementById('add-balance-button').addEventListener('click', addBalance);
document.getElementById('update-balance-button').addEventListener('click', updateBalance);
document.getElementById('update-account-select').addEventListener('change', fetchBalancesForUpdate);

fetchCurrentBalances();
fetchAccounts();
