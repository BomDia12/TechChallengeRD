require 'minitest/autorun'
require 'timeout'
class CustomerSuccessBalancing
  def initialize(customer_success, customers, customer_success_away)
    @customer_success = customer_success
    @customers = customers
    @customer_success_away = customer_success_away
  end

  # Returns the id of the CustomerSuccess with the most customers
  def execute
    # Runing funtions that distribute the customers
    set_up
    distribute_customers
    sort_customer_sucess_by_customers

    # If more than one customer sucess has the most amount of customers returns 0
    return 0 if @customer_success_by_customers[0][:customers].size == @customer_success_by_customers[1][:customers].size

    # Returns the id of the customer sucess with the most customers
    @customer_success_by_customers[0][:id]
  end

  # Private functions used only in functions inside of this class
  private

  # Sorts the lists by score and selects all available custumer sucess
  def set_up
    # Filters all the custumer sucess that are away
    @available_customer_sucess = @customer_success.filter { |customer_success| !@customer_success_away.include?(customer_success[:id]) }

    # Sorting customer sucess for easier handling
    @available_customer_sucess.sort_by! { |customer_success| customer_success[:score] }

    # Storing customers and storing in another array for easier handling and deletion of item from the list without data loss
    @available_customers = @customers.sort_by { |customer| customer[:score] }
  end

  # Distibutes customers for each customer sucess
  def distribute_customers
    @available_customer_sucess.each do |customer_success|
      # Initializing the customer value as an array
      customer_success[:customers] = []

      # Looping while there are still customers
      while !@available_customers.empty?
        # Checking if this customer sucess can take this customer
        if @available_customers[0][:score] <= customer_success[:score]
          # Removing a customer from the list of available customers and adding their id to their customer sucess
          customer_success[:customers] << @available_customers.shift[:id]
        else
          # If this customer sucess can't take this customer he can't take any customer with a higher score either
          break
        end
      end
    end
  end

  # Sorts all available customer sucess by amount of customers in decresing order
  def sort_customer_sucess_by_customers
    @customer_success_by_customers = @available_customer_sucess.sort { |a, b| b[:customers].size <=> a[:customers].size }
  end
end

class CustomerSuccessBalancingTests < Minitest::Test
  def test_scenario_one
    css = [{ id: 1, score: 60 }, { id: 2, score: 20 }, { id: 3, score: 95 }, { id: 4, score: 75 }]
    customers = [{ id: 1, score: 90 }, { id: 2, score: 20 }, { id: 3, score: 70 }, { id: 4, score: 40 }, { id: 5, score: 60 }, { id: 6, score: 10}]

    balancer = CustomerSuccessBalancing.new(css, customers, [2, 4])
    assert_equal 1, balancer.execute
  end

  def test_scenario_two
    css = array_to_map([11, 21, 31, 3, 4, 5])
    customers = array_to_map( [10, 10, 10, 20, 20, 30, 30, 30, 20, 60])
    balancer = CustomerSuccessBalancing.new(css, customers, [])
    assert_equal 0, balancer.execute
  end

  def test_scenario_three
    customer_success = (1..999).to_a
    customers = Array.new(10000, 998)

    balancer = CustomerSuccessBalancing.new(array_to_map(customer_success), array_to_map(customers), [999])

    result = Timeout.timeout(1.0) { balancer.execute }
    assert_equal 998, result
  end

  def test_scenario_four
    balancer = CustomerSuccessBalancing.new(array_to_map([1, 2, 3, 4, 5, 6]), array_to_map([10, 10, 10, 20, 20, 30, 30, 30, 20, 60]), [])
    assert_equal 0, balancer.execute
  end

  def test_scenario_five
    balancer = CustomerSuccessBalancing.new(array_to_map([100, 2, 3, 3, 4, 5]), array_to_map([10, 10, 10, 20, 20, 30, 30, 30, 20, 60]), [])
    assert_equal 1, balancer.execute
  end

  def test_scenario_six
    balancer = CustomerSuccessBalancing.new(array_to_map([100, 99, 88, 3, 4, 5]), array_to_map([10, 10, 10, 20, 20, 30, 30, 30, 20, 60]), [1, 3, 2])
    assert_equal 0, balancer.execute
  end

  def test_scenario_seven
    balancer = CustomerSuccessBalancing.new(array_to_map([100, 99, 88, 3, 4, 5]), array_to_map([10, 10, 10, 20, 20, 30, 30, 30, 20, 60]), [4, 5, 6])
    assert_equal 3, balancer.execute
  end

  def array_to_map(arr)
    out = []
    arr.each_with_index { |score, index| out.push({ id: index + 1, score: score }) }
    out
  end
end

Minitest.run