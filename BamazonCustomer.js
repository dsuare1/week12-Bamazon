var prompt = require("prompt");
var inquirer = require("inquirer");
var mysql = require("mysql");

var schema = {
    properties: {
        productID: {
            description: "Please enter the ID of the product you'd like to purchase",
            pattern: /^\d+$/,
            message: "ProductID must be only numbers 1 - 10",
            required: true
        },
        Quantity: {
            description: "Ok, got it!  Please enter the amount of this product you'd like to purchase",
            pattern: /^\d+$/,
            message: "Please enter a quantity between 1 and 50",
            required: true
        }
    }
};

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "BamazonDB"
});

connection.connect(function(err) {
    if (err) throw err;
});

function calculateOverHeadCosts() {
    var costSports = 0,
        costMusic = 0,
        costHome = 0,
        costMisc = 0,
        costOffice = 0,
        costElectronics = 0,
        costLeisure = 0;
    var deptCosts = [];
    connection.query('SELECT * FROM Products', function(err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            if (res[i].DeptName == "Sports") {
                costSports += res[i].Price * res[i].StockQuantity;
            } else if (res[i].DeptName == "Music") {
                costMusic += res[i].Price * res[i].StockQuantity;
            } else if (res[i].DeptName == "Home") {
                costHome += res[i].Price * res[i].StockQuantity;
            } else if (res[i].DeptName == "Misc") {
                costMisc += res[i].Price * res[i].StockQuantity;
            } else if (res[i].DeptName == "Office") {
                costOffice += res[i].Price * res[i].StockQuantity;
            } else if (res[i].DeptName == "Electronics") {
                costElectronics += res[i].Price * res[i].StockQuantity;
            } else if (res[i].DeptName == "Leisure") {
                costLeisure += res[i].Price * res[i].StockQuantity;
            }
        }
        deptCosts.push(costSports);
        deptCosts.push(costMusic);
        deptCosts.push(costHome);
        deptCosts.push(costMisc);
        deptCosts.push(costOffice);
        deptCosts.push(costElectronics);
        deptCosts.push(costLeisure);
    });
    connection.query("SELECT * FROM Departments", function(err, result) {
        for (var i = 0; i < result.length; i++) {
            connection.query("UPDATE Departments SET OverHeadCosts = " + deptCosts[i].toFixed(2) + " WHERE ?", { DepartmentName: result[i].DepartmentName }, function(err, res) {
                return;
            });
        }
    })
}

function initialProductDisplay() {
    connection.query('SELECT * FROM Products', function(err, result) {
        if (err) throw err;
        console.log("\nWelcome to Bamazon!  Here's what we currently have to offer:");
        console.log("==========================================================================================");
        for (var i = 0; i < result.length; i++) {
            console.log("------------------------------------------------------------------------------------------");
            console.log("ID: " + result[i].ID + " || Product Name: " + result[i].ProductName + " || Price: $" + result[i].Price.toFixed(2));
        }
        console.log("\n");
        userInput();
    });
};

function userInput() {
    prompt.get(schema, function(err, result) {
        connection.query("SELECT * FROM Products WHERE ?", { id: result.productID },
            function(err, specificItem) {
                checkIfUserCanBuy(specificItem, result.Quantity);
            })
    });
}

function checkIfUserCanBuy(item, qtyDesired) {

    if (item[0].StockQuantity < qtyDesired) {
        console.log("\nSorry; not enough in stock; please select another item:");
        setTimeout(initialProductDisplay, 1000);
        setTimeout(userInput, 1500);
    } else {
        var deptName = item[0].DeptName;
        console.log("foo: " + deptName);
        var totalWithoutTax = qtyDesired * item[0].Price;
        var totalWithTax = (totalWithoutTax * 0.0825) + totalWithoutTax;
        console.log("\n\nOk great!  Here's your order:\n\nYou want " + qtyDesired + " of " + item[0].ProductName + " at $" + item[0].Price.toFixed(2) + " a piece.\n");
        console.log("\nYour total cost is: \n" + "    (before tax): $" + totalWithoutTax.toFixed(2) + "\n    (after tax): $" + totalWithTax.toFixed(2) + "\n\n");
        // update the Products Table in DB with new quantity for item
        connection.query("UPDATE Products SET ? WHERE ?", [{ StockQuantity: item[0].StockQuantity - qtyDesired }, { ID: item[0].ID }], function(err, res) {
        })

        // update the Departments Table in DB with sales earned for relevant department
        connection.query("SELECT * FROM Departments", function(err, resultAll) {
            var itemDept = "";
            for (var i = 0; i < resultAll.length; i++) {
                if (deptName == resultAll[i].DepartmentName) {
                    itemDept = deptName;
                }
            }
            connection.query("UPDATE Departments SET TotalSales = TotalSales + " + totalWithTax + " WHERE ?", { DepartmentName: itemDept }, function(err, res) {
                return;
            });
        });
        calculateOverHeadCosts();
    }
    promptForContinue();
}

function promptForContinue() {
    inquirer.prompt([{
        type: "list",
        message: "Would you like to keep shopping?",
        choices: ["Yes of course!", "No, I'm finished."],
        name: "continue"
    }]).then(function(cont) {
        if (cont.continue === "Yes of course!") {
            console.log("\nGreat!  Returning to item list...")
            setTimeout(initialProductDisplay, 2000);
        } else if (cont.continue === "No, I'm finished.") {
            console.log("\n\nOk!  Thanks for your time :)");
            // doesn't get out of the inquirer prompt ???
            return;
        }
    });
}

initialProductDisplay();
calculateOverHeadCosts();
