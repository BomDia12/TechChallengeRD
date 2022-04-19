/**
 * Sorts the items in a list by their scores
 * @param {integer} a
 * @param {integer} b
 */
const sortByScore = (a, b) => {
  return a.score - b.score;
};

/**
 * Process the data, sorting and filtering it
 * @param {array} customerSuccess
 * @param {array} customers
 * @param {array} customerSuccessAway
 *
 * @returns {object} availableCustomerSuccess, availableCustomers
 */
const processData = (
  customerSuccess,
  customers,
  customerSuccessAway
) => {
  const availableCustomerSuccess = customerSuccess.filter((cs) => {return !customerSuccessAway.includes(cs.id)});
  availableCustomerSuccess.sort(sortByScore);
  const availableCustomers = customers.sort(sortByScore);
  return { availableCustomerSuccess, availableCustomers };
}

const distributeCustomers = (
  availableCustomerSuccess,
  availableCustomers
) => {
  availableCustomerSuccess.map(custumerSuccess => {
    custumerSuccess.customers = []
    while (availableCustomers.length) {
      if (availableCustomers[0].score <= custumerSuccess.score) {
        custumerSuccess.customers.push(availableCustomers.shift().id)
      } else {
        break
      }
    }
  })
  return availableCustomerSuccess
};

const sortWorkingCustomerSuccess = (customerSuccess) => {
  return customerSuccess.sort((a, b) => b.customers.length - a.customers.length)
}

/**
 * Returns the id of the CustomerSuccess with the most customers
 * @param {array} customerSuccess
 * @param {array} customers
 * @param {array} customerSuccessAway
 */
function customerSuccessBalancing(
  customerSuccess,
  customers,
  customerSuccessAway
) {

  const { availableCustomerSuccess, availableCustomers } = processData(
    customerSuccess,
    customers,
    customerSuccessAway
  );

  const workingCustomerSuccess = distributeCustomers(availableCustomerSuccess, availableCustomers)

  const sortedCustomerSuccess = sortWorkingCustomerSuccess(workingCustomerSuccess)

  if (sortedCustomerSuccess[0].customers.length === sortedCustomerSuccess[1].customers.length){
    return 0
  }

  return sortedCustomerSuccess[0].id
}

test("Scenario 1", () => {
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

function arraySeq(count, startAt){
  return Array.apply(0, Array(count)).map((it, index) => index + startAt)
}

test("Scenario 2", () => {
  const css = mapEntities([11, 21, 31, 3, 4, 5]);
  const customers = mapEntities([10, 10, 10, 20, 20, 30, 30, 30, 20, 60]);
  const csAway = [];

  expect(customerSuccessBalancing(css, customers, csAway)).toEqual(0);
});

test("Scenario 3", () => {
  const testTimeoutInMs = 100;
  const testStartTime = new Date().getTime();

  const css = mapEntities(arraySeq(999, 1))
  const customers = buildSizeEntities(10000, 998);
  const csAway = [999];

  // The provided test had the expected result as 999, but, seeing as 999 is away
  // and the equivalent ruby test expects 998, I changed the expected result to 998.
  expect(customerSuccessBalancing(css, customers, csAway)).toEqual(998);

  if (new Date().getTime() - testStartTime > testTimeoutInMs) {
    throw new Error(`Test took longer than ${testTimeoutInMs}ms!`);
  }
});

test("Scenario 4", () => {
  const css = mapEntities([1, 2, 3, 4, 5, 6]);
  const customers = mapEntities([10, 10, 10, 20, 20, 30, 30, 30, 20, 60]);
  const csAway = [];

  expect(customerSuccessBalancing(css, customers, csAway)).toEqual(0);
});

test("Scenario 5", () => {
  const css = mapEntities([100, 2, 3, 3, 4, 5]);
  const customers = mapEntities([10, 10, 10, 20, 20, 30, 30, 30, 20, 60]);
  const csAway = [];

  expect(customerSuccessBalancing(css, customers, csAway)).toEqual(1);
});

test("Scenario 6", () => {
  const css = mapEntities([100, 99, 88, 3, 4, 5]);
  const customers = mapEntities([10, 10, 10, 20, 20, 30, 30, 30, 20, 60]);
  const csAway = [1, 3, 2];

  expect(customerSuccessBalancing(css, customers, csAway)).toEqual(0);
});

test("Scenario 7", () => {
  const css = mapEntities([100, 99, 88, 3, 4, 5]);
  const customers = mapEntities([10, 10, 10, 20, 20, 30, 30, 30, 20, 60]);
  const csAway = [4, 5, 6];

  expect(customerSuccessBalancing(css, customers, csAway)).toEqual(3);
});
