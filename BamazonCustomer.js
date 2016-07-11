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
    console.log("connected as id " + connection.threadId);
})

connection.query('SELECT * FROM Products', function(err, res) {
    if (err) throw err;
    
    for (var i = 0; i < res.length; i++) {
    	console.log("ID: " + res[i].ID + " || Product Name: " + res[i].ProductName + " || Price: " + res[i].Price);
    }
});