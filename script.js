"use strict";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: "Steven Thomas Williams",
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: "Sarah Smith",
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

////////////////////////////////////////////////////////////
// FUNCTION-TO-DISPLAY-MOVEMENTS
const dailyMovement = function (mov) {
  //removing the existing html content
  containerMovements.innerHTML = "";
  //adding the amounts from given array as argument
  mov.forEach((mov, i) => {
    //checking the type of transaction through ternary operator
    const type = mov > 0 ? "deposit" : "withdrawal";
    //creating a template string to add to the dom + values from array
    const html = `<div class="movements__row">
    <div class="movements__type movements__type--${type}"> ${
      i + 1
    } ${type}</div>
    <div class="movements__value">${mov}€</div>
  </div>`;
    //adds html string to dom using insertAdjacent
    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

////////////----FUNCTION TO DISPLAY BALANCE------////////////
const calcDisplayBalance = (account) => {
  //ARRAY METHODS  REDUCE
  account.balance = account.movements.reduce((acc, cur) => acc + cur, 0);
  labelBalance.textContent = `${account.balance} €`;
};

////////////----FUNCTION TO DISPLAY SUMMARY------////////////

const calcDisplaySummary = (account) => {
  const incomes = account.movements
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes}€`;

  const out = account.movements
    .filter((mov) => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(out)}€`;

  const interest = account.movements
    .filter((mov) => mov > 0)
    .map((deposit) => (deposit * account.interestRate) / 100)
    .filter((int, i, arr) => int > 1)
    .reduce((acc, int) => acc + int);
  labelSumInterest.textContent = `${interest}€`;
};

/////////////////////////////////////////////////
//FUNCTION TO CREATE AND ADD USERNAME FROM OWNERS NAME
const createUserName = (acc) => {
  acc.forEach((acc) => {
    acc.username = acc.owner
      .toLowerCase()
      .split(" ")
      //ARRAY MAP METHOD
      .map((name) => name[0])
      .join("");
  });
};

createUserName(accounts);

/////////////////////////////////////////////////
//FUNCTION TO UPDATE UI

function updateUI(account) {
  //Display Movements
  dailyMovement(account.movements);

  //Display Balance
  calcDisplayBalance(account);

  //Display Summary
  calcDisplaySummary(account);
}

//////////////////////////////////////////////////////
///////////EVENT LISTENER FOR LOGIN
//////////////////////////////////////////////////////

let currentAccount;

btnLogin.addEventListener("click", function (event) {
  //prevent FORM from reloading
  event.preventDefault();

  currentAccount = accounts.find(
    (acc) => acc.username === inputLoginUsername.value.trim()
  );

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    //display UI and Welcome Message
    labelWelcome.textContent = `Welcome Back ${
      currentAccount.owner.split(" ")[0]
    }`;

    //display account (OPACITY = 1)
    containerApp.style.opacity = 100;

    updateUI(currentAccount);

    //clear input fields ( assigning from right to left)
    inputLoginUsername.value = inputLoginPin.value = "";

    //to remove cursor focus
    inputLoginPin.blur();
  } else {
    console.log("error", `the username or password is wrong`);
  }

  console.log("currentAccount", currentAccount);
});

///////////EVENT LISTENER FOR MONEY TRANSFER

btnTransfer.addEventListener("click", function (event) {
  //to prevent the default reloading behavior of FORM on click
  event.preventDefault();
  const transferAmount = Number(inputTransferAmount.value);
  const transferTo = inputTransferTo.value;

  //loop through the object to match for account
  const receiverAccount = accounts.find(
    (account) => account.username === transferTo
  );

  //CONDITIONAL TRANSFER OF MONEY
  if (
    transferAmount > 0 &&
    receiverAccount &&
    transferAmount <= currentAccount.balance &&
    receiverAccount?.username !== currentAccount.username
  ) {
    //add the transferAmount in movements
    currentAccount.movements.push(-transferAmount);
    receiverAccount.movements.push(transferAmount);
    updateUI(currentAccount);
    inputTransferAmount.value = inputTransferTo.value = "";
    console.log(`transfer successful`);
  } else {
    console.log(`Invalid Transfer`);
  }
});

///////////EVENT LISTENER FOR LOAN BUTTON

///////////EVENT LISTENER FOR CLOSING THE ACCOUNT
btnClose.addEventListener("click", function (event) {
  event.preventDefault();
  //store userInfo
  const confirmUsername = inputCloseUsername.value;
  //store PIN
  const confirmPin = Number(inputClosePin.value);

  if (
    currentAccount.username === confirmUsername &&
    currentAccount.pin === confirmPin
  ) {
    const index = accounts.findIndex((account) => {
      return account.username === currentAccount.username;
    });
    console.log("index", index);
    //this will remove the user from accounts array
    accounts.splice(index, 1);
  }
  //clear the input fields
  inputCloseUsername.value = inputClosePin.value = "";
  inputClosePin.blur();
  containerApp.style.opacity = 0;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ["USD", "United States dollar"],
  ["EUR", "Euro"],
  ["GBP", "Pound sterling"],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////

//ARRAY METHODS  FILTER
//this will filter and return true boolean values base on statement below.
const deposits = movements.filter((mov) => mov > 0);

const withdrawals = movements.filter((mov) => mov < 0);

//CHAINING MAP FILTER REDUCE
const eurToUsd = 1.1;

//PIPELINE
const totalDepositUSD = movements
  .filter((mov) => mov > 0)
  .map((mov) => mov * eurToUsd)
  .reduce((acc, mov) => acc + mov, 0);

////////////////////////////---find--Account
const receiverAccount = accounts.find((acc) => {
  return acc.owner === "Jessica Davis";
});
