function populateDateFields() {
    const today = new Date();
    const year = today.getFullYear();
    let month = today.getMonth() + 1;
    let day = today.getDate();

    // Pad month and day with leading zeros if necessary
    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;

    const formattedDate = `${year}-${month}-${day}`;

    // Set the value of both date input fields
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
            let totalBalance = 0;
            data.data.forEach(item => {
                table += `<tr><td>${item.name}</td><td>${parseFloat(item.balance).toFixed(2)}</td><td>${item.entry_date}</td></tr>`;
                totalBalance += parseFloat(item.balance);
            });
            // Corrected total row addition:
            table += `</tbody><tfoot><tr><th>Total</th><th>${totalBalance.toFixed(2)}</th><th></th></tr></tfoot></table>`;
            balancesDiv.innerHTML += table;
        } else {
            console.error('Invalid or empty data received from get_current_balances.php');
        }
    } catch (error) {
        console.error('Error fetching current balances:', error);
    }
}

const accountColors = {}; // Mapping of account IDs to colors

async function fetchBalanceData(startDate, endDate) {
    try {
        const response = await fetch('api/get_accounts.php');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const accountsData = await response.json();

        const datasets = [];
        const monthlyData = {};

        if (accountsData && accountsData.data) {
            for (const account of accountsData.data) {
                const accountResponse = await fetch(`api/get_balances.php?id=${account.id}`);
                if (!accountResponse.ok) {
                    throw new Error(`HTTP error! status: ${accountResponse.status}`);
                }
                const balanceData = await accountResponse.json();

                if (balanceData && balanceData.data) {
                    balanceData.data.forEach(entry => {
                        const date = new Date(entry.entry_date);
                        if ((!startDate || date >= new Date(startDate)) && (!endDate || date <= new Date(endDate))) {
                            const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
                            if (!monthlyData[monthYear]) {
                                monthlyData[monthYear] = {};
                            }
                            if (!monthlyData[monthYear][account.id]) {
                                monthlyData[monthYear][account.id] = 0;
                            }
                            monthlyData[monthYear][account.id] += parseFloat(entry.balance);
                        }
                    });
                }
            }
        }

        const labels = Object.keys(monthlyData).sort();

        accountsData.data.forEach(account => {
            const data = [];
            labels.forEach(monthYear => {
                data.push(monthlyData[monthYear][account.id] || 0);
            });

            if (!accountColors[account.id]) {
                accountColors[account.id] = getRandomColor();
            }

            datasets.push({
                label: account.name,
                data: data,
                backgroundColor: accountColors[account.id],
            });
        });

        const ctx = document.getElementById('balanceChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets,
        },
        options: {
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        color: '#000' // Set x-axis tick color to black
                    }
                },
                y: {
                    beginAtZero: true,
                    stacked: true,
                    ticks: {
                        color: '#000' // Set y-axis tick color to black
                    }
                },
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#000' // Set legend label color to black
                    }
                }
            }
        },
    });
    } catch (error) {
        console.error('Error fetching balance data:', error);
    }
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
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
    fetchBalanceData(); // Call fetchBalanceData without accountId
});

document.getElementById('update-chart-button').addEventListener('click', () => {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    fetchBalanceData(startDate, endDate);
});

document.getElementById('show-add-account').addEventListener('click', () => {
    document.getElementById('add-account-form').classList.add('active');
    document.getElementById('add-balance-form').classList.remove('active');
    document.getElementById('update-balance-form').classList.remove('active');
});

document.getElementById('show-add-balance').addEventListener('click', () => {
    document.getElementById('add-account-form').classList.remove('active');
    document.getElementById('add-balance-form').classList.add('active');
    document.getElementById('update-balance-form').classList.remove('active');
});

document.getElementById('show-update-balance').addEventListener('click', () => {
    document.getElementById('add-account-form').classList.remove('active');
    document.getElementById('add-balance-form').classList.remove('active');
    document.getElementById('update-balance-form').classList.add('active');
});

document.addEventListener('DOMContentLoaded', () => {
    populateDateFields();
    fetchCurrentBalances();
    fetchAccounts();
    fetchBalanceData(); // Initial chart load
});
