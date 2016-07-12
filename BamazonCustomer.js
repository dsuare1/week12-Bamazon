var prompt = require("prompt");
var inquirer = require("inquirer");
var mysql = require("mysql");

var schema = {
    properties: {
        productID: {
            description: "Please enter the ID of the product you'd like to purchase",
            pattern: /[1-9|10]/,
            message: "ProductID must be only numbers 1 - 10",
            required: true
        },
        Quantity: {
            description: "Ok, got it!  Please enter the amount of this product you'd like to purchase",
            pattern: /^(?:[1-9]|[1-4][0-9]|50)$/,
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
    // console.log("connected as id " + connection.threadId);
});

function initialProductDisplay() {
    connection.query('SELECT * FROM Products', function(err, result) {
        if (err) throw err;
        console.log("\nWelcome to Bamazon!  Here's what we currently have to offer:");
        console.log("================================================================================");
        for (var i = 0; i < result.length; i++) {
            console.log("--------------------------------------------------------------------------------");
            console.log("ID: " + result[i].ID + " || Product Name: " + result[i].ProductName + " || Price: $" + result[i].Price);
        }
        console.log("\n");
    });
};

function userInput() {
    prompt.get(schema, function(err, result) {
        console.log("  The product you chose is: " + result.productID);
        console.log("  The amount you'd like to purchase is: " + result.Quantity);
        connection.query("SELECT * FROM Products WHERE ?", { id: result.productID },
            function(err, specificItem) {
                checkIfUserCanBuy(specificItem, result.Quantity);
            })
    });
}

function checkIfUserCanBuy(item, qtyDesired) {

    if (item[0].StockQuantity < qtyDesired) {
        console.log("Sorry; not enough in stock; please select another item:");
        setTimeout(initialProductDisplay, 1000);
        setTimeout(userInput, 3000);
    } else {
        var totalWithoutTax = qtyDesired * item[0].Price;
        var totalWithTax = (totalWithoutTax * 0.0825) + totalWithoutTax;
        console.log("Ok great!  Just to confirm...\n\nYou want " + qtyDesired + " of " + item[0].ProductName + " at $" + item[0].Price + " a piece.\n");
        console.log("\nYour total cost is: \n" + "    (before tax): $" + totalWithoutTax + "\n    (after tax): $" + totalWithTax.toFixed(2) + "\n\n");

        promptForConfirm();

        // update DB
        // connection.query(sqlGetQuery, function(err, result) {
        //     if (err) throw err;
        //     console.log("foo: " + result);
        // });




        // sqlUpdateQuery = "UPDATE Products SET ='',last_name='$last_name',user_city='$city_name' WHERE user_id=".$_GET['edit_id'];
    }
}

function promptForConfirm() {
    inquirer.prompt([{
        type: "list",
        message: "Are you sure you want to purchase the above item(s)?",
        choices: ["Yes; send them my way!", "No, I'd like to keep looking."],
        name: "confirm"
    }]).then(function(input) {
        if (input.confirm === "Yes; send them my way!") {
            console.log("\n\nGreat!  We'll start getting your order ready!\n\n");
            inquirer.prompt([{
                type: "list",
                message: "Would you like to keep shopping?",
                choices: ["Yes of course!", "No, I'm finished."],
                name: "continue"
            }]).then(function(cont) {
                if (cont.continue === "Yes of course!") {
                    console.log("Great!  Returning to item list...")
                    setTimeout(initialProductDisplay, 2000);
                    setTimeout(userInput, 2500);
                } else if (cont.continue === "No, I'm finished.") {
                    console.log("\n\nOk!  Thanks for your time :)");
                    return;
                }
            });
        } else if (input.confirm === "No, I'd like to keep looking.") {
            console.log("Ok, no problem.  Returning to item list...")
            setTimeout(initialProductDisplay, 2000);
            setTimeout(userInput, 2500);
        }
    });
}

initialProductDisplay();

setTimeout(userInput, 1000);
