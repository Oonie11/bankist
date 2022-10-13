"use strict";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2020-04-01T10:17:24.185Z",
    "2020-05-08T14:11:59.604Z",
    "2022-10-10T17:01:17.194Z",
    "2022-10-11T23:36:17.929Z",
    "2022-10-12T10:51:36.790Z",
  ],
  currency: "EUR",
  locale: "pt-PT", // de-DE
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2020-04-10T14:43:26.374Z",
    "2020-06-25T18:49:59.371Z",
    "2020-07-26T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const accounts = [account1, account2];

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

const locale = navigator.language;

let currentAccount, timer;

////////////////////////////////////////////////////////////

//FUNCTION FOR TIME-STAMP
const formatMovementDate = function (date, locale) {
  const calPassedDays = (date1, date2) =>
    Math.round(Math.abs((date2 - date1) / (1000 * 60 * 60 * 24)));
  const daysPassed = calPassedDays(new Date(), date);

  if (daysPassed === 0) return `today`;
  if (daysPassed === 1) return `yesterday`;
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    const day = `${date.getDate()}`.padStart(2, 0);
    const month = `${date.getMonth() + 1}`.padStart(2, 0);
    const year = date.getFullYear();
    // return `${month}/${day}/${year}`;
    return new Intl.DateTimeFormat(locale).format(date);
  }
};

//FUNC FORMAT-CURRENCY
function formatCurrency(value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(value);
}

// FUNCTION-TO-DISPLAY-MOVEMENTS
const displayMovement = function (account, sort = false) {
  //removing the existing html content
  containerMovements.innerHTML = "";

  //sorting the display order
  //creating a copy of movements with .slice() to keep original data unmuted
  const movs = sort
    ? account.movements.slice().sort((a, b) => a - b)
    : account.movements;
  //adding the amounts from given array as argument
  movs.forEach((mov, i) => {
    //checking the type of transaction through ternary operator
    const type = mov > 0 ? "deposit" : "withdrawal";

    const date = new Date(account.movementsDates[i]);
    const displayDate = formatMovementDate(date, account.locale);

    //internationalizing numbers
    const formattedMov = formatCurrency(mov, account.locale, account.currency);

    //creating a template string to add to the dom + values from array
    const html = `<div class="movements__row">
    <div class="movements__type movements__type--${type}"> ${
      i + 1
    } ${type}</div>
    <div class="movements__date">${displayDate}</div>
    <div class="movements__value">${formattedMov}</div>
  </div>`;
    //adds html string to dom using insertAdjacent
    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

////////////----FUNCTION TO DISPLAY BALANCE------////////////
const calcDisplayBalance = (account) => {
  //ARRAY METHODS  REDUCE
  account.balance = account.movements.reduce((acc, cur) => acc + cur, 0);
  //internationalizing numbers

  labelBalance.textContent = `${formatCurrency(
    account.balance,
    account.locale,
    account.currency
  )}`;
  // labelBalance.textContent = `${formatCurrency(account.balance)}`;
};

////////////----FUNCTION TO DISPLAY SUMMARY------////////////

const calcDisplaySummary = (account) => {
  const incomes = account.movements
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${formatCurrency(
    incomes,
    account.locale,
    account.currency
  )}`;

  const out = account.movements
    .filter((mov) => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${formatCurrency(
    Math.abs(out),
    account.locale,
    account.currency
  )}`;

  const interest = account.movements
    .filter((mov) => mov > 0)
    .map((deposit) => (deposit * account.interestRate) / 100)
    .filter((int, i, arr) => int > 1)
    .reduce((acc, int) => acc + int);
  labelSumInterest.textContent = `${formatCurrency(
    interest,
    account.locale,
    account.currency
  )}`;
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
  displayMovement(account);

  //Display Balance
  calcDisplayBalance(account);

  //Display Summary
  calcDisplaySummary(account);
}

/////////////////////////////////////////////////
//FUNCTION LOGOUT TIMER
function startLogOutTimer() {
  const tick = () => {
    const min = String(Math.trunc(logoutTime / 60)).padStart(2, 0);
    const sec = String(logoutTime % 60).padStart(2, 0);
    //in each call print the remaining time
    labelTimer.textContent = `${min}:${sec}`;
    //when timer is 0, stop time and log out
    if (logoutTime === 0) {
      clearInterval(timer);
      labelWelcome.textContent = `Login to get Started`;
      containerApp.style.opacity = 0;
    }
    logoutTime--;
  };

  //set time to 5 min
  let logoutTime = 30;
  tick(logoutTime);
  //call timer every-second
  const timer = setInterval(tick, 1000, logoutTime);
  return timer;
}

//////////////////////////////////////////////////////
///////////----FAKE ALWAYS LOGGED IN
//////////////////////////////////////////////////////
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

//locale for timestamp
function localeTimeStamp(locale = navigator.language) {
  //experimenting with time API
  const date = new Date();
  const options = {
    hour: "numeric",
    minute: "numeric",
    day: "numeric",
    month: "numeric",
    year: "numeric",
    // weekday: "long",
  };

  labelDate.textContent = new Intl.DateTimeFormat(locale, options).format(date);
}

//////////////////////////////////////////////////////
///////////EVENT LISTENER FOR LOGIN
//////////////////////////////////////////////////////

btnLogin.addEventListener("click", function (event) {
  //prevent FORM from reloading
  event.preventDefault();
  currentAccount = accounts.find(
    (acc) => acc.username === inputLoginUsername.value.trim()
  );

  if (currentAccount?.pin === +inputLoginPin.value) {
    //display UI and Welcome Message
    labelWelcome.textContent = `Welcome Back ${
      currentAccount.owner.split(" ")[0]
    }`;

    //----TIME STAMPS
    // const currentDate = new Date();
    // const day = `${currentDate.getDate()}`.padStart(2, 0);
    // const month = `${currentDate.getMonth() + 1}`.padStart(2, 0);
    // const year = currentDate.getFullYear();
    // const hour = `${currentDate.getHours()}`.padStart(2, 0);
    // const min = `${currentDate.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${month}/${day}/${year}, ${hour}:${min}`;
    localeTimeStamp(currentAccount.locale);

    //display account (OPACITY = 1)
    containerApp.style.opacity = 100;

    if (timer) {
      clearInterval(timer);
    }
    timer = startLogOutTimer();
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
  const transferAmount = +inputTransferAmount.value;
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
    //add timestamp to the transaction
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAccount.movementsDates.push(new Date().toISOString());

    //RESET TIMER
    clearInterval(timer);
    timer = startLogOutTimer();
    updateUI(currentAccount);
    inputTransferAmount.value = inputTransferTo.value = "";
    console.log(`transfer successful`);
  } else {
    console.log(`Invalid Transfer`);
  }
});

///////////EVENT LISTENER FOR LOAN BUTTON
btnLoan.addEventListener("click", function (event) {
  event.preventDefault();
  const requestedLoanAmount = Math.floor(inputLoanAmount.value);
  const loanSecurityCheck = currentAccount.movements.some(
    (mov) => requestedLoanAmount * 0.1 < mov
  );

  //RESET TIMER
  clearInterval(timer);
  timer = startLogOutTimer();

  if (loanSecurityCheck && requestedLoanAmount > 0) {
    //deposit the requested amount
    setTimeout(function () {
      currentAccount.movements.push(requestedLoanAmount);
      currentAccount.movementsDates.push(new Date().toISOString());
      updateUI(currentAccount);
    }, 2500);

    inputLoanAmount.value = "";
  } else {
    console.log("loan: ", `loan cannot be approved`);
  }

  console.log(`loan requested`, `securityCheck: ${loanSecurityCheck}`);
});

///////////EVENT LISTENER FOR CLOSING THE ACCOUNT
btnClose.addEventListener("click", function (event) {
  event.preventDefault();
  //store userInfo
  const confirmUsername = inputCloseUsername.value;
  //store PIN
  const confirmPin = +inputClosePin.value;

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

///////////EVENT LISTENER FOR SORTING THE MOVEMENTS
//creating a state variable
let sorted = false;
btnSort.addEventListener("click", function (event) {
  event.preventDefault();
  displayMovement(currentAccount, !sorted);
  sorted = !sorted;
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
