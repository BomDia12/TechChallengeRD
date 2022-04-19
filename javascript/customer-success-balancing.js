/* eslint-disable no-undef */
/**
 * Sorts the items in a list by their scores
 * @param {array} array an array of objects with the score value
 *
 * @returns {array} the sorted array, by the score atribute
 */
const sortByScore = (array) => array.sort((a, b) => a.score - b.score);

/**
 * Filters the CustomerSuccess by those who are away, removing them from the list
 * @param {array} custumerSuccess the array of customerSuccess objects
 * @param {array} customerSuccessAway the array with the ids of the customerSuccess who are away
 *
 * @returns {array} the array with only the objects of the customerSuccess who are available
 */
const filterCustomerSuccess = (
  customerSuccess,
  customerSuccessAway,
) => customerSuccess.filter((cs) => !customerSuccessAway.includes(cs.id));

/**
 * Process the data, sorting and filtering it
 * @param {array} customerSuccess the array of customerSuccess objects
 * @param {array} customers the array of customer objects
 * @param {array} customerSuccessAway the array eith th ids of the customerSuccess wich are away
 *
 * @returns {object} {availableCustomerSuccess, availableCustomers}
 */
const processData = (
  customerSuccess,
  customers,
  customerSuccessAway,
) => {
  const filteredCustomerSuccess = filterCustomerSuccess(customerSuccess, customerSuccessAway);

  return {
    availableCustomerSuccess: sortByScore(filteredCustomerSuccess),
    availableCustomers: sortByScore(customers),
  };
};

/**
 * Ditributes the available clients to the closest apt customerSuccess
 * @param {array} availableCustomerSuccess the array with the available customerSuccess objects
 * sorted by score
 * @param {array} availableCustomers the array with the customer objects sorted by score
 *
 * @returns {array} an array with the customerSuccess objects with their customers' ids
 */
const distributeCustomers = (
  availableCustomerSuccess,
  availableCustomers,
) => {
  const result = availableCustomerSuccess; // Variable in orther not to alter the params
  for (let i = 0, size = availableCustomerSuccess.length; i < size; i += 1) {
    result[i].customers = [];
    while (availableCustomers.length) {
      if (availableCustomers[0].score <= result[i].score) {
        // Removing items from the customer array allows for better performance
        result[i].customers.push(availableCustomers.shift().id);
      } else {
        // If the customerSuccess can't take this client,
        // then it can't take any bigger clients either
        break;
      }
    }
  }
  return availableCustomerSuccess;
};

/**
 * Returns the array sorted by the length of the customers value in decreasing order
 * @param {array} customerSuccess an array of objects with the customers item as an array
 *
 * @returns {array} the same array but sorted by the size of the customers value
 */
const sortWorkingCustomerSuccess = (
  customerSuccess,
) => customerSuccess.sort((a, b) => b.customers.length - a.customers.length);

/**
 * Returns the id of the CustomerSuccess with the most customers
 * @param {array} customerSuccess
 * @param {array} customers
 * @param {array} customerSuccessAway
 *
 * @returns {integer} id of the customerSuccess with the most clients, or, if there's
 * a tie at the top, 0
 */
function customerSuccessBalancing(
  customerSuccess,
  customers,
  customerSuccessAway,
) {
  const { availableCustomerSuccess, availableCustomers } = processData(
    customerSuccess,
    customers,
    customerSuccessAway,
  );

  const workingCustomerSuccess = distributeCustomers(
    availableCustomerSuccess,
    availableCustomers,
  );

  const sortedCustomerSuccess = sortWorkingCustomerSuccess(workingCustomerSuccess);

  // If the two customerSuccess with the most clients have the same amount, returns 0
  if (sortedCustomerSuccess[0].customers.length === sortedCustomerSuccess[1].customers.length) {
    return 0;
  }

  // If only one customerSuccess has the most clients, then returns it's id
  return sortedCustomerSuccess[0].id;
}

test('Scenario 1', () => {
  const css = [
    { id: 1, score: 60 },
    { id: 2, score: 20 },
    { id: 3, score: 95 },
    { id: 4, score: 75 },
  ];
  const customers = [
    { id: 1, score: 90 },
    { id: 2, score: 20 },
    { id: 3, score: 70 },
    { id: 4, score: 40 },
    { id: 5, score: 60 },
    { id: 6, score: 10 },
  ];
  const csAway = [2, 4];

  expect(customerSuccessBalancing(css, customers, csAway)).toEqual(1);
});

function buildSizeEntities(size, score) {
  const result = [];
  for (let i = 0; i < size; i += 1) {
    result.push({ id: i + 1, score });
  }
  return result;
}

function mapEntities(arr) {
  return arr.map((item, index) => ({
    id: index + 1,
    score: item,
  }));
}

function arraySeq(count, startAt) {
  return Array.apply(0, Array(count)).map((it, index) => index + startAt);
}

test('Scenario 2', () => {
  const css = mapEntities([11, 21, 31, 3, 4, 5]);
  const customers = mapEntities([10, 10, 10, 20, 20, 30, 30, 30, 20, 60]);
  const csAway = [];

  expect(customerSuccessBalancing(css, customers, csAway)).toEqual(0);
});

test('Scenario 3', () => {
  const testTimeoutInMs = 100;
  const testStartTime = new Date().getTime();

  const css = mapEntities(arraySeq(999, 1));
  const customers = buildSizeEntities(10000, 998);
  const csAway = [999];

  // The provided test had the expected result as 999, but, seeing as 999 is away
  // and the equivalent ruby test expects 998, I changed the expected result to 998.
  expect(customerSuccessBalancing(css, customers, csAway)).toEqual(998);

  if (new Date().getTime() - testStartTime > testTimeoutInMs) {
    throw new Error(`Test took longer than ${testTimeoutInMs}ms!`);
  }
});

test('Scenario 4', () => {
  const css = mapEntities([1, 2, 3, 4, 5, 6]);
  const customers = mapEntities([10, 10, 10, 20, 20, 30, 30, 30, 20, 60]);
  const csAway = [];

  expect(customerSuccessBalancing(css, customers, csAway)).toEqual(0);
});

test('Scenario 5', () => {
  const css = mapEntities([100, 2, 3, 3, 4, 5]);
  const customers = mapEntities([10, 10, 10, 20, 20, 30, 30, 30, 20, 60]);
  const csAway = [];

  expect(customerSuccessBalancing(css, customers, csAway)).toEqual(1);
});

test('Scenario 6', () => {
  const css = mapEntities([100, 99, 88, 3, 4, 5]);
  const customers = mapEntities([10, 10, 10, 20, 20, 30, 30, 30, 20, 60]);
  const csAway = [1, 3, 2];

  expect(customerSuccessBalancing(css, customers, csAway)).toEqual(0);
});

test('Scenario 7', () => {
  const css = mapEntities([100, 99, 88, 3, 4, 5]);
  const customers = mapEntities([10, 10, 10, 20, 20, 30, 30, 30, 20, 60]);
  const csAway = [4, 5, 6];

  expect(customerSuccessBalancing(css, customers, csAway)).toEqual(3);
});
