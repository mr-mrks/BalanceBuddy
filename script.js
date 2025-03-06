function populateDateFields() {
    const today = new Date();
    const year = today.getFullYear();
    let month = today.getMonth() + 1;
    let day = today.getDate();

    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;

    const formattedDate = `${year}-${month}-${day}`;

    document.getElementById('balance-date').value = formattedDate;
    document.getElementById('update-balance-date').value = formattedDate;
}

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
                fetchBalancesForUpdate();
            }
        } else {
            console.error('Invalid or empty data received from get_accounts.php');
        }
    } catch (error) {
        console.error('Error fetching accounts:', error);
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

document.getElementById('update-account-select').addEventListener('change', fetchBalancesForUpdate);

document.addEventListener('DOMContentLoaded', () => {
    populateDateFields();
    fetchCurrentBalances();
    fetchAccounts();
});
