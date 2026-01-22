# frozen_string_literal: true

CODES = ARGF.read.each_line.map(&:chomp).to_a

BUTTONS = ["^", "<", "v", ">", "A"].freeze

KEYPAD_MOVEMENTS = {
  "A" => {
    "<" => "0",
    "^" => "3"
  }.freeze,
  "0" => {
    "^" => "2",
    ">" => "A"
  }.freeze,
  "1" => {
    "^" => "4",
    ">" => "2"
  }.freeze,
  "2" => {
    "<" => "1",
    "^" => "5",
    ">" => "3",
    "v" => "0"
  }.freeze,
  "3" => {
    "^" => "6",
    "v" => "A",
    "<" => "2"
  }.freeze,
  "4" => {
    "^" => "7",
    ">" => "5",
    "v" => "1"
  }.freeze,
  "5" => {
    "^" => "8",
    ">" => "6",
    "v" => "2",
    "<" => "4"
  }.freeze,
  "6" => {
    "^" => "9",
    "v" => "3",
    "<" => "5"
  }.freeze,
  "7" => {
    ">" => "8",
    "v" => "4"
  }.freeze,
  "8" => {
    ">" => "9",
    "v" => "5",
    "<" => "7"
  }.freeze,
  "9" => {
    "v" => "6",
    "<" => "8"
  }.freeze
}.freeze

PAD_MOVEMENTS = {
  "A" => {
    "<" => "^",
    "v" => ">"
  }.freeze,
  "^" => {
    ">" => "A",
    "v" => "v"
  }.freeze,
  "<" => {
    ">" => "v"
  }.freeze,
  "v" => {
    "^" => "^",
    "<" => "<",
    ">" => ">"
  }.freeze,
  ">" => {
    "^" => "A",
    "<" => "v"
  }.freeze
}.freeze

def iterate_path(from, to, movements)
  queue = [[from, [], []]]

  Enumerator.new do |y|
    loop do
      state = queue.pop
      break if state.nil?

      BUTTONS.each do |key|
        next_key = movements[state[0]][key]
        next if next_key.nil?
        next if state[2].include?(next_key)

        if next_key == to
          y << [*state[1], key]
        else
          queue << [next_key, [*state[1], key], [*state[2], next_key]]
        end
      end
    end
  end
end

CALCULATED_KEYPAD_MOVEMENTS = KEYPAD_MOVEMENTS.keys.permutation(2).to_h do |(from, to)|
  found = iterate_path(from, to, KEYPAD_MOVEMENTS).to_a.sort_by(&:length)
  found = found.select { it.length <= found[0].length }
  [[from, to], found]
end

CALCULATED_PAD_MOVEMENTS = PAD_MOVEMENTS.keys.permutation(2).to_h do |(from, to)|
  found = iterate_path(from, to, PAD_MOVEMENTS).to_a.sort_by(&:length)
  found = found.select { it.length <= found[0].length }
  [[from, to], found]
end

def possibility_generator(code, movements)
  Enumerator.new do |y|
    queue = [[[], code]]

    loop do
      break if queue.empty?

      queue.shift => calculated, [first, *remainder]

      next y << calculated if remainder.empty?

      if first == remainder.first
        queue << [[*calculated, "A"], remainder]
      else
        movements[[first, remainder.first]].each do |moves|
          queue << [[*calculated, *moves, "A"], remainder]
        end
      end
    end
  end
end

def min_movements(code)
  found = possibility_generator(code, CALCULATED_KEYPAD_MOVEMENTS).group_by(&:length)

  found = Enumerator::Chain.new(
    *found[found.keys.min].map do
      possibility_generator(["A", *it], CALCULATED_PAD_MOVEMENTS)
    end
  ).group_by(&:length)

  found = Enumerator::Chain.new(
    *found[found.keys.min].map do
      possibility_generator(["A", *it], CALCULATED_PAD_MOVEMENTS)
    end
  ).group_by(&:length)

  found.keys.min
end

def min_code(code)
  ["A", *code.chars].each_cons(2).sum do |(from, to)|
    min_movements([from, to])
  end
end

CODES
  .sum { min_code(it) * it.to_i }
  .then { pp it }
