const { contextBridge } = require('electron');
var fs = require('fs');

var expenseCategory = {
    MISC: "MISC",
    Housing: "Housing",
    Utilities: "Utilities",
    Transportation: "Transportation",
    Food: "Food",
    Splurge: "Splurge",
    Subscriptions: "Subscriptions",
};

function Transaction(name, amount, date, category)
{
    var _date = date;
    var _amount = amount;
    var _name = name;
    var _category = category;

    function getDate() {
        return _date;
    }

    function getAmount()
    {
        return _amount;
    }

    function getName()
    {
        return _name;
    }

    function getCategory()
    {
        return _category;
    }

    return {
        getDate: getDate,
        getAmount: getAmount,
        getName: getName,
        getCategory: getCategory,
    };
}

function BudgetManger() {
    var _expensePeriods = new Map();
    var _transactions = [];
    

    function ExpensePeriod(date)
    {
        var _total = 0;
        var _date = date;
        var _transactions = [];

        function getTotal() {
            _total = _transactions.reduce((oldValue, newValue) => {
                return oldValue + newValue.getAmount();
            }, 0.0);

            return _total;
        }

        function getDate()
        {
            return _date;
        }

        function getSurplus()
        {
            var income = 6000;
            return income + getTotal();
        }

        function addTransaction(transaction)
        {
            _transactions.push(transaction);
        }

        function getTransactions()
        {
            return _transactions;
        }

        return {
            addTransaction: addTransaction,
            getTotal: getTotal,
            getDate: getDate,
            getSurplus: getSurplus,
            getTransactions: getTransactions,
        };
    };

    function getExpensePeriods() {
        var expenseSet = [];
        _expensePeriods.forEach((value, key, amp) => {
            expenseSet.push(value);
        });
        expenseSet.sort((a, b) => {
            return a.getDate() > b.getDate() ? 1 : -1;
        });
        return expenseSet;
    }

    function getExpensePeriod(year, month)
    {
        var lookup = year + "-" + month;
        return _expensePeriods.get(lookup);
    }

    function addTransaction(transaction)
    {
        _transactions.push(transaction);
        var date = transaction.getDate();
        var lookup = date.getFullYear() + '-' + date.getMonth();
        var expensePeriod = _expensePeriods.has(lookup)
            ? _expensePeriods.get(lookup)
            : new ExpensePeriod(date);
        expensePeriod.addTransaction(transaction);
        _expensePeriods.set(lookup, expensePeriod);
    }

    function getTransactionCount()
    {
        return getExpensePeriods().length;
    }
    
    return {
        getExpensePeriods: getExpensePeriods,
        getExpensePeriod: getExpensePeriod,
        addTransaction: addTransaction,
        getTransactionCount: getTransactionCount,
    };
};


var budgetManager = new BudgetManger();
contextBridge.exposeInMainWorld('budgetManger', budgetManager);
contextBridge.exposeInMainWorld('expenseCategory', expenseCategory);

var basePathName = "C:\\Users\\ZERO\\Downloads\\";
var bankFileName = basePathName + "transactions.csv";
var creditCardFileName = basePathName + "Year to date.CSV";

fs.readFile(bankFileName, 'utf8', function (err, data) {
    if (err) {
        return console.log(err);
    }
    var ignoreTransactions = [
        "Robinhood",
        "capital one",
        "venmo",
        "vanguard",
        "CITI CARD",
        "Internet transfer",
        "Wire Transfer",
        "LOANCARE",
        "Nationstar dba",
    ];
    var rows = data.split("\n");
    rows.shift();
    rows.forEach(row => {
        if(row.length < 1) {
            return;
        }
        var columns = row.split(",");
        
        var date = new Date(columns[0]);
        var amount = parseFloat(columns[2]);
        var name = columns[4];
        var isWithdraw = columns[3] == "Withdrawal";
        name = name == null || name == undefined
            ? ''
            : name.toLowerCase();
        
        var isIgnoredByName = ignoreTransactions.reduce((previousValue, currentValue) => {
            return previousValue || name.includes(currentValue.toLowerCase());
        }, false);

        if(isIgnoredByName || !isWithdraw) {
            return;
        }
        
        var transaction = new Transaction(name, amount, date, name);
        budgetManager.addTransaction(transaction);        
    });
});

fs.readFile(creditCardFileName, 'utf8', (err, data) => {
    if(err) {
        console.log(err);
        return;
    }

    var rows = data.split("\n");
    rows.shift();
    rows.shift();
    rows.shift();
    rows.shift();
    rows.shift();
    rows.shift();
    rows.forEach(row => {
        var columns = row.split('"'+','+'"');
        var date = columns[0].substr(1);
        var name = columns[1];
        var amount = parseFloat(columns[2]);
        var categoryDescription = columns[3].substring(0, columns[3].length - 1);
        if(amount == 'NaN' || isNaN(amount)) {
            return;
        }

        var transaction = new Transaction(name, (amount * -1), new Date(date), categoryDescription);
        budgetManager.addTransaction(transaction);
    });
});