async function fetchCurrentBalances() {
    const response = await fetch('/currentbalances');
    const data = await response.json();
    const balancesDiv = document.getElementById('current-balances');
    balancesDiv.innerHTML = '<h2>Current Balances</h2>';
    let table = '<table><thead><tr><th>Account</th><th>Balance</th><th>Last Updated</th></tr></thead><tbody>';
    data.forEach(item => {
        table += `<tr><td>${item.account_name}</td><td>${item.balance}</td><td>${item.last_updated}</td></tr>`;
    });
    table += '</tbody></table>';
    balancesDiv.innerHTML += table;
}

async function fetchBalanceData() {
    const response = await fetch('/accounts/1/balances'); //example account ID.
    const data = await response.json();
    const labels = data.map(entry => entry.entry_date);
    const balances = data.map(entry => entry.balance);
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

fetchCurrentBalances();
fetchBalanceData();
