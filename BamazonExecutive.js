var inquirer = require("inquirer");
var prompt = require("prompt");
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

inquirer.prompt([{
    type: "list",
    message: "Choose a command to execute:",
    choices: ["View Product Sales by Department", "Create New Department", "Exit"],
    name: "command"
}]).then(function(choice) {
    if (choice.command == "View Product Sales by Department") {
        viewProductSalesByDepartment();
    } else if (choice.command == "Create New Department") {
        createNewDepartment();
    } else {
        console.log("Exiting...");
        // doesn't get out of the prompt ???
        return;
    }
});

function viewProductSalesByDepartment() {
    connection.query("SELECT * FROM Departments", function(err, result) {
        var currDepts = [];
        for (var i = 0; i < result.length; i++) {
            currDepts.push(result[i].DepartmentName);
        }
        inquirer.prompt([{
            type: "list",
            message: "Please select from one of the following Departments:",
            choices: currDepts,
            name: "dept"
        }]).then(function(response) {
            connection.query("SELECT * FROM Departments WHERE ?", { DepartmentName: response.dept }, function(err, result) {
                // console.log(result);
                console.log("\n  Viewing details for " + response.dept + " Department...");
                console.log("\n    Total Overhead Costs for " + response.dept + ": " + result[0].OverHeadCosts.toFixed(2));
                console.log("\n    Total Sales for " + response.dept + ": " + result[0].TotalSales.toFixed(2));
                console.log("\n    Total Profit for this Department: " + (result[0].TotalSales - result[0].OverHeadCosts).toFixed(2));
            })
        });
    });
}

function createNewDepartment() {

}
