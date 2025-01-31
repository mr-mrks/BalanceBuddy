async function addAccount() {
    const accountName = document.getElementById('account_name').value;
    const initialBalance = document.getElementById('initial_balance').value;
    const response = await fetch('/add_account', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ account_name: accountName, initial_balance: initialBalance })
    });
    const result = await response.json();
    alert(result.message);
}

async function updateBalance() {
    const accountName = document.getElementById('update_account_name').value;
    const newBalance = document.getElementById('new_balance').value;
    const timestamp = new Date().toISOString();
    const response = await fetch('/update_balance', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ account_name: accountName, new_balance: newBalance, timestamp: timestamp })
    });
    const result = await response.json();
    alert(result.message);
    if (response.ok) {
        loadChart(accountName);
    }
}

async function loadChart(accountName) {
    const response = await fetch(`/get_data?account_name=${accountName}`);
    const data = await response.json();
    const ctx = document.getElementById('balanceChart').getContext('2d');
    const chartData = {
        labels: data.history.map(entry => entry.timestamp),
        datasets: [{
            label: 'Balance',
            data: data.history.map(entry => entry.balance),
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: true
        }]
    };
    new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'month'
                    }
                }
            }
        }
    });
}
