var prompt = require("prompt");
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
    console.log("connected as id " + connection.threadId);
});

function initialProductDisplay() {
    connection.query('SELECT * FROM Products', function(err, result) {
        if (err) throw err;
        console.log("\n================================================================================");
        for (var i = 0; i < result.length; i++) {
            console.log("--------------------------------------------------------------------------------");
            console.log("ID: " + result[i].ID + " || Product Name: " + result[i].ProductName + " || Price: " + result[i].Price);
        }
    });
};

function userInput() {
    prompt.get(schema, function(err, result) {
        console.log("  The product you chose is: " + result.productID);
        console.log("  The amount you'd like to purchase is: " + result.Quantity);
        connection.query("SELECT * FROM Products WHERE ?", { id: result.productID }, function(err, specificItem) {
            checkIfUserCanBuy(specificItem, result.Quantity);
        })
    });
}

function checkIfUserCanBuy(item, qtyDesired) {

    if (item[0].StockQuantity < qtyDesired) {
        console.log("Sorry; not enough in stock; please select another item:");
        initialProductDisplay();
        userInput();
    }
}

initialProductDisplay();

userInput();
