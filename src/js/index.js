var budgetManger = window.budgetManger;
var totalsContainer = null;
var monthlyContainer = null;
var transactionContainer = null;
var periodTable = null;

document.addEventListener("DOMContentLoaded", function() {
    totalsContainer = document.getElementById('totals-container');
    monthlyContainer = document.getElementById('period-container');
    transactionContainer = document.getElementById('transactions-container');

    createTotalsTable();
    createPeriodTable();

    
});

function createTotalsTable()
{
    var totalsTable = document.createElement('table');
    var thead = document.createElement('thead');
    var totalsHeaders = ["Surplus", "Expense", "Period"];
    totalsTable.setAttribute("class", "table table-striped");
    for(var i = 0; i < totalsHeaders.length; i++) {
        var headerRow = document.createElement('th');
        headerRow.innerHTML = totalsHeaders[i];
        thead.appendChild(headerRow);
    }
    totalsTable.appendChild(thead);
    
    var expensePeriods = budgetManger.getExpensePeriods();

    var totalIncome = 0;
    var totalExpense = 0;
    expensePeriods.forEach(expensePeriod => {
        var date = expensePeriod.getDate();
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var row = totalsTable.insertRow();
        row.setAttribute("class", "totals-month")
        row.setAttribute("data-month", month);
        row.setAttribute("data-year", year);
        row.onclick = onTotalsRowClicked;
        var surplusCell = row.insertCell();
        var expenseCell = row.insertCell();
        var periodCell = row.insertCell();

        
        surplusCell.innerHTML = expensePeriod.getSurplus().toLocaleString('us-US', { style: 'currency', currency: 'USD' });
        expenseCell.innerHTML = expensePeriod.getTotal().toLocaleString('us-US', { style: 'currency', currency: 'USD' });
        periodCell.innerHTML = date.toLocaleString('default', { month: 'long' }) + " " + date.getFullYear();

        totalIncome += expensePeriod.getSurplus();
        totalExpense += expensePeriod.getTotal();
    });

    var row = totalsTable.insertRow();
    row.setAttribute("class", "table-warning");
    var surplusCell = row.insertCell();
    var expenseCell = row.insertCell();
    var periodCell = row.insertCell();
    surplusCell.innerHTML = totalIncome.toLocaleString('us-US', { style: 'currency', currency: 'USD' });
    expenseCell.innerHTML = totalExpense.toLocaleString('us-US', { style: 'currency', currency: 'USD' });
    periodCell.innerHTML = "";
    totalsContainer.appendChild(totalsTable);
}

function createPeriodTable()
{
    var table = document.createElement('table');
    var thead = document.createElement('thead');
    var headers = ["Surplus", "Expense", "Period"];
    table.setAttribute("class", "table table-striped");
    table.setAttribute("id", "period-table");
    for(var i = 0; i < headers.length; i++) {
        var headerRow = document.createElement('th');
        headerRow.innerHTML = headers[i];
        thead.appendChild(headerRow);
    }
    table.appendChild(thead);
    monthlyContainer.appendChild(table);
}

function createTransctionTable()
{
    
}

function onTotalsRowClicked(event)
{
    var element = this;
    var month = element.getAttribute('data-month');
    var year = element.getAttribute('data-year');
    var expensePeriod = budgetManger.getExpensePeriod(year, month);
    var transactions = expensePeriod.getTransactions();
    var transactionBreakdownTable = document.getElementById("period-table");

    transactionBreakdownTable.innerHTML = "";
    var row = transactionBreakdownTable.insertRow();
    var nameCell = row.insertCell();
    var amountCell = row.insertCell();
    var categoryCell = row.insertCell();
    nameCell.innerHTML = "Name";
    amountCell.innerHTML = "Amount";
    categoryCell.innerHTML = "Category";

    transactions.forEach(t => {
        var row = transactionBreakdownTable.insertRow();
        var nameCell = row.insertCell();
        var amountCell = row.insertCell();
        var categoryCell = row.insertCell();

        nameCell.innerHTML = t.getName();
        amountCell.innerHTML = t.getAmount().toLocaleString('us-US', { style: 'currency', currency: 'USD' });
    });
}

