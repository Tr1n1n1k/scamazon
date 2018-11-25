var inquirer = require('inquirer');
var mysql = require('mysql');
var Table = require('cli-table');

// Connect to mySQL database
var connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'scamaway',
  database: 'scamazonDB'
});

connection.connect(function(err) {
  if (err) throw err;
});

var currentItemPrice;
var currentItemName;
var currentInventory;

function userWelcome() {
  console.log('');
  console.log('------------------------------------------------');
  console.log('Welcome to Scamazon. We Sell Dope Footware...Bam!');
  console.log('------------------------------------------------');
  console.log('');

  displayInventory();
}

userWelcome();

// Function that displays the current inventory for scamazon using CLI-Table
function displayInventory() {
  console.log('');
  console.log('------------------------------------------------');
  console.log("Here's a look at our current inventory selection");
  console.log('------------------------------------------------');
  console.log('');

  // Instantiate CLI table
  var table = new Table({
    head: ['Item', 'Product Name', 'Price', 'Avail.'],
    colWidths: [10, 20, 10, 10]
  });

  // Code below pulls back all data from the productstable
  connection.query('SELECT * FROM productstable', function(err, res) {
    if (err) throw err;
    for (var i = 0; i < res.length; i++) {
      // Code below pushing this into the CLI table package to display the inventory
      table.push([
        res[i].item_id,
        res[i].product_name,
        res[i].price,
        res[i].stock_quantity
      ]);
    }
    console.log(table.toString());
    console.log('');
  });
  setTimeout(userPrompt, 1000);
}

function userPrompt() {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'userItem',
        message:
          'Please enter the 4-digit item number you are interested in buying.'
      },

      {
        type: 'input',
        name: 'userQuantity',
        message:
          "Cool! Please enter how many you want and we'll confirm our inventory."
      }
    ])
    .then(function(userResponse) {
      userItemRequested = userResponse.userItem;
      userQuantityRequested = userResponse.userQuantity;
      checkInventory();
    });
}

function checkInventory() {
  connection.query(
    'SELECT * FROM productstable WHERE item_id=?',
    [userItemRequested],
    function(err, res) {
      if (err) throw err;
      currentInventory = res[0].stock_quantity;
      currentItemPrice = res[0].price;
      currentItemName = res[0].product_name;

      if (currentInventory >= userQuantityRequested) {
        enoughInventory();
      } else {
        notEnoughInventory();
      }
    }
  );
}

function enoughInventory() {
  console.log('');
  console.log('Thank you for your purcase of the ', currentItemName);
  var totalPrice = userQuantityRequested * currentItemPrice;
  console.log('Your total price is: ', totalPrice);
  console.log('Your items will be shipped out tommorrow.');
  decreaseInventory();
}

function notEnoughInventory() {
  console.log('');
  console.log(
    "Hey, sorry but we don't have ",
    userQuantityRequested,
    ' of those.'
  );
  console.log('Check out our selection and inventory again.');
  console.log('');
  userPrompt();
}

function decreaseInventory() {
  var remainingInventory = currentInventory - userQuantityRequested;

  connection.query(
    'UPDATE productstable SET stock_quantity=? WHERE item_id=?',
    [remainingInventory, userItemRequested],
    function(err, res) {
      if (err) throw err;
      console.log('');
      connection.end();
    }
  );
}
