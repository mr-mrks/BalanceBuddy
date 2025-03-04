async function fetchCurrentBalances() {
    try {
        const response = await fetch('api/get_current_balances.php');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data && data.data) {
            const balancesDiv = document.getElementById('current-balances');
            balancesDiv.innerHTML = '<h2>Current Balances</h2>';
            let table = '<table><thead><tr><th>Account</th><th>Balance</th><th>Last Updated</th></tr></thead><tbody>';
            data.data.forEach(item => {
                table += `<tr><td>${item.name}</td><td>${item.balance}</td><td>${item.entry_date}</td></tr>`;
            });
            table += '</tbody></table>';
            balancesDiv.innerHTML += table;
        } else {
            console.error('Invalid or empty data received from get_current_balances.php');
        }
    } catch (error) {
        console.error('Error fetching current balances:', error);
    }
}

async function fetchBalanceData(accountId) {
    try {
        const response = await fetch(`api/get_balances.php?id=${accountId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data && data.data) {
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
        } else {
            console.error('Invalid or empty data received from get_balances.php');
        }
    } catch (error) {
        console.error('Error fetching balance data:', error);
    }
}

async function fetchAccounts() {
    try {
        const response = await fetch('api/get_accounts.php');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data && data.data) {
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
            if(data.data.length > 0){
                fetchBalanceData(data.data[0].id);
            }
        } else {
            console.error('Invalid or empty data received from get_accounts.php');
        }
    } catch (error) {
        console.error('Error fetching accounts:', error);
    }
}

async function addAccount() {
    try {
        const name = document.getElementById('new-account-name').value;
        const response = await fetch('api/add_account.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `name=${name}`
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        fetchAccounts();
    } catch (error) {
        console.error('Error adding account:', error);
    }
}

async function addBalance() {
    try {
        const accountId = document.getElementById('account-select').value;
        const entryDate = document.getElementById('balance-date').value;
        const balance = document.getElementById('balance-amount').value;
        const response = await fetch('api/add_balance.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `account_id=${accountId}&entry_date=${entryDate}&balance=${balance}`
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        fetchCurrentBalances();
        fetchBalanceData(accountId);
    } catch (error) {
        console.error('Error adding balance:', error);
    }
}

async function fetchBalancesForUpdate() {
    try {
        const accountId = document.getElementById('update-account-select').value;
        const response = await fetch(`api/get_balances.php?id=${accountId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data && data.data) {
            const select = document.getElementById('update-balance-select');
            select.innerHTML = '';
            data.data.forEach(balance => {
                const option = document.createElement('option');
                option.value = balance.id;
                option.textContent = `${balance.entry_date} - ${balance.balance}`;
                select.appendChild(option);
            });
        } else {
            console.error('Invalid or empty data received from get_balances.php for update');
        }
    } catch (error) {
        console.error('Error fetching balances for update:', error);
    }
}

async function updateBalance() {
    try {
        const balanceId = document.getElementById('update-balance-select').value;
        const entryDate = document.getElementById('update-balance-date').value;
        const balance = document.getElementById('update-balance-amount').value;
        const response = await fetch('api/update_balance.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `balanceid=${balanceId}&entry_date=${entryDate}&balance=${balance}`
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        fetchCurrentBalances();
        fetchBalanceData(document.getElementById('update-account-select').value);
    } catch (error) {
        console.error('Error updating balance:', error);
    }
}

document.getElementById('add-account-button').addEventListener('click', addAccount);
document.getElementById('add-balance-button').addEventListener('click', addBalance);
document.getElementById('update-balance-button').addEventListener('click', updateBalance);
document.getElementById('update-account-select').addEventListener('change', fetchBalancesForUpdate);

fetchCurrentBalances();
fetchAccounts();
