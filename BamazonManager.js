var inquirer = require("inquirer");
var mysql = require("mysql");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "BamazonDB"
});

connection.connect(function(err) {
    if (err) throw err;
    // console.log("connected as id " + connection.threadId);
});

function start() {
    inquirer.prompt([{
        type: "list",
        message: "Choose a command to execute:",
        choices: ["View All Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"],
        name: "command"
    }]).then(function(choice) {
        if (choice.command == "View All Products for Sale") {
            viewAllProducts();
        } else if (choice.command == "View Low Inventory") {
            viewLowInventory();
        } else if (choice.command == "Add to Inventory") {
            addToInventory();
        } else if (choice.command == "Add New Product") {
            addNewProduct();
        } else {
        	console.log("Exiting...");
        	// doesn't get out of the prompt ???
        	return;
        }
    });
}

function viewAllProducts() {
    connection.query("SELECT * FROM Products", function(err, result) {
        if (err) throw err;
        console.log("\nCurrent status of ALL Inventory:");
        console.log("==========================================================================================================================================================================");
        for (var i = 0; i < result.length; i++) {
            console.log("--------------------------------------------------------------------------------------------------------------------------------------------------------------------------");
            console.log("ID: " + result[i].ID + " || Product Name: " + result[i].ProductName + " || DeptName:  " + result[i].DeptName + " || Price: $" + result[i].Price.toFixed(2) + " || StockQuantity: " + result[i].StockQuantity);
        }
        console.log("--------------------------------------------------------------------------------------------------------------------------------------------------------------------------");
        console.log("\n");
        setTimeout(start, 500);
    });
}

function viewLowInventory() {
    connection.query("SELECT * FROM Products", function(err, result) {
        if (err) throw err;
        console.log("\nItems with StockQuantity less than 5:");
        console.log("==========================================================================================================================================================================");

        var lowQtyItems = [];
        for (var i = 0; i < result.length; i++) {
            if (result[i].StockQuantity < 5) {
                lowQtyItems.push(result[i]);
            }
        }

        for (var i = 0; i < lowQtyItems.length; i++) {
            console.log("--------------------------------------------------------------------------------------------------------------------------------------------------------------------------");
            console.log("ID: " + lowQtyItems[i].ID + " || Product Name: " + lowQtyItems[i].ProductName + " || DeptName:  " + lowQtyItems[i].DeptName + " || Price: $" + lowQtyItems[i].Price.toFixed(2) + " || StockQuantity: " + lowQtyItems[i].StockQuantity);
        }
        console.log("--------------------------------------------------------------------------------------------------------------------------------------------------------------------------");
        console.log("\n");
        setTimeout(start, 500);
    })
}

// ******************************************************************************************
// not working
// ******************************************************************************************

function addToInventory() {
    // inquirer.prompt([{
    //     type: "list",
    //     message: "Ok; do you need to see the current inventory to get the ID of the item you want to update?",
    //     choices: ["Yes, I need to get the item's ID", "No, I know the item's ID"],
    //     name: "update"
    // }]).then(function(choice) {
    //     if (choice.update == "Yes, I need to get the item's ID") {
    //         viewAllProducts();
    //         setTimeout(addToInventory, 2000);
    //     } else {
    inquirer.prompt([{
        type: "input",
        message: "Ok, enter the ID number of the product you want to update:",
        name: "ID"
    }, {
        type: "input",
        message: "How many would you like to add?",
        name: "QTY"
    }]).then(function(updateInfo) {
        connection.query("UPDATE Products SET ? WHERE ?", [{StockQuantity: + updateInfo.QTY}, {ID: updateInfo.ID}],
            function(err, res) {
                console.log("\nSuccessfully added " + updateInfo.QTY + "unit(s) of product with ID of " + updateInfo.ID + " to inventory;\n\nDisplaying updated DataBase info...");
                setTimeout(viewAllProducts, 2500);
                setTimeout(start, 3000);
            })
    })
}
// })

// }

// ******************************************************************************************

function addNewProduct() {
    inquirer.prompt([{
        type: "input",
        message: "Enter the Product Name",
        name: "ProductName"
    }, {
        type: "input",
        message: "Enter the Department Name",
        name: "DeptName"
    }, {
        type: "input",
        message: "Enter the Price of the item",
        name: "Price"
    }, {
        type: "input",
        message: "Enter the Stock Quantity of the item",
        name: "StockQuantity"
    }]).then(function(response) {
        // need to add validation here

        connection.query("INSERT INTO Products (ProductName, DeptName, Price, StockQuantity) VALUES ('" + response.ProductName + "', '" + response.DeptName + "', " + response.Price + ", " + response.StockQuantity + ");");
        setTimeout(start, 500);
    })
}

start();
