# frozen_string_literal: true

NUMBERS = ARGF.read.each_line.map(&:chomp).map(&:to_i)

def generate(number)
  number = ((number * 64) ^ number) % 16_777_216
  number = ((number / 32) ^ number) % 16_777_216
  ((number * 2048) ^ number) % 16_777_216
end

def prices(number)
  last = number.digits[0]
  Enumerator.new do |y|
    2000.times do
      number = generate(number)
      price = number.digits[0]
      y << [price, price - last]
      last = price
    end
  end
end

def price_sequences(number, costs)
  seen = Set.new
  prices(number)
    .each_cons(4)
    .map do |v|
      key = v.map { it[1] }
      value = v.last[0]

      unless seen.include?(key)
        costs[key] += value
        seen << key
      end

      [key, value]
    end
end

costs = Hash.new { 0 }
NUMBERS.each { price_sequences(it, costs) }

pp(costs.max_by { it[1] }[1])
