import 'chartjs-adapter-moment'; // Assuming you installed using npm
    
document.addEventListener('DOMContentLoaded', async () => {
    await populateAccountDropdown();
    displayChart();
});

async function populateAccountDropdown() {
    const select = document.getElementById('account-select');
    if (!select) {
        console.error("Account dropdown not found!"); 
        return; 
    }

    try {
        const response = await fetch('/api/accounts');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const accounts = await response.json();

        select.innerHTML = ''; 
        accounts.forEach(account => {
            const option = document.createElement('option');
            option.value = account;
            option.text = account;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching accounts:', error);
    }
}

async function displayChart() {
    try {
        const response = await fetch('/api/accounts');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const accounts = await response.json();

        const chartData = {
            labels: [],
            datasets: []
        };

        const allBalances = {};

        for (const account of accounts) {
            try {
                const accountResponse = await fetch(`/api/balance/${account}`);
                if (!accountResponse.ok) {
                    throw new Error(`HTTP error! status: ${accountResponse.status}`);
                }
                const accountData = await accountResponse.json();

                chartData.datasets.push({
                    label: account,
                    data: accountData.map(entry => ({ x: entry.date, y: entry.balance })),
                    borderColor: getRandomColor(),
                    fill: false,
                    tension: 0.4 
                }); 

                accountData.forEach(entry => {
                    const date = entry.date;
                    if (!allBalances[date]) {
                        allBalances[date] = {};
                    }
                    allBalances[date][account] = entry.balance;
                });
            } catch (error) {
                console.error(`Error fetching data for account ${account}:`, error);
                // Optionally, display a warning message to the user
            }
             updateBalanceTable(chartData.datasets);
        }

        chartData.labels = Object.keys(allBalances).sort();

        const totalBalanceData = chartData.labels.map(date => {
            let total = 0;
            for (const account in allBalances[date]) {
                total += allBalances[date][account];
            }
            return total;
        });

        chartData.datasets.push({
            label: 'Total',
            data: chartData.labels.map((date, index) => ({ x: date, y: totalBalanceData[index] })),
            borderColor: '#000',
            fill: false,
            tension: 0.4
        });

        const ctx = document.getElementById('balance-chart').getContext('2d');
        let chart = Chart.getChart('balance-chart'); 
        if (chart) {
            chart.destroy(); 
        }
        
        chart = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'month',
                            displayFormats: {
                                month: 'MMM YYYY'
                            }
                        },
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Value (EUR)' // Use EUR for consistency
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const datasetLabel = context.dataset.label || '';
                                const value = context.formattedValue;
                                const date = context.chart.data.labels[context.dataIndex];
                                return `${datasetLabel}: ${value} on ${date}`;
                            }
                        }
                    }
                }
            }
        });

    } catch (error) {
        console.error('Error displaying chart:', error);
        // Optionally, display a user-friendly error message
    }

    updateBalanceTable(chartData.datasets);
}

function updateBalanceTable(datasets) {
    const table = document.getElementById('balance-table');
    table.innerHTML = '';

    const headerRow = table.insertRow();
    headerRow.insertCell().textContent = 'Account';
    headerRow.insertCell().textContent = 'Current Balance (EUR)'; 

    let totalBalance = 0;

    datasets.forEach(dataset => {
        if (dataset.label !== 'Total') {
            const lastDataPoint = dataset.data[dataset.data.length - 1];
            const balance = lastDataPoint ? lastDataPoint.y : 0;
            totalBalance += balance;

            const row = table.insertRow();
            row.insertCell().textContent = dataset.label;
            row.insertCell().textContent = balance.toFixed(2) + ' EUR'; 
        }
    });

    const totalRow = table.insertRow();
    totalRow.insertCell().textContent = 'Total';
    totalRow.insertCell().textContent = totalBalance.toFixed(2) + ' EUR';
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Add balance form submission
const addBalanceForm = document.getElementById('add-balance-form');
addBalanceForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const account = document.getElementById('account-select').value;
    const balance = parseFloat(document.getElementById('balance').value);
    const date = document.getElementById('date').value;

    try {
        const response = await fetch(`/api/balance/${account}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ balance: balance, date: date })
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.error || 'Error adding balance.');
            return;
        }

        alert('Balance added successfully!');
        displayChart();
        addBalanceForm.reset();
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred.');
    }
});
