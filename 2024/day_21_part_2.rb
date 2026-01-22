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

# Find all possible movements from one key to another
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

# Cache of basic keypad movements - always take the shortest
CALCULATED_KEYPAD_MOVEMENTS = KEYPAD_MOVEMENTS.keys.permutation(2).to_h do |(from, to)|
  found = iterate_path(from, to, KEYPAD_MOVEMENTS).to_a.sort_by(&:length)
  found = found.select { it.length <= found[0].length }
  [[from, to], found]
end

# Cache of basic pad movements - always take the shortest
CALCULATED_PAD_MOVEMENTS = PAD_MOVEMENTS.keys.permutation(2).to_h do |(from, to)|
  found = iterate_path(from, to, PAD_MOVEMENTS).to_a.sort_by(&:length)
  found = found.select { it.length <= found[0].length }
  [[from, to], found]
end

# Find all possible movements to generate a code using the cached keypad movements
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

# Optimises the pad movements to find the
# best option where there are two options
# by checking subsequent layers
def optimise(options)
  options = options.to_h { [it, [it]] }
  loop do
    options = options.transform_values do |possibilities|
      possibilities.flat_map do |possibility|
        possibility_generator(possibility, CALCULATED_PAD_MOVEMENTS).to_a
      end
    end

    options
      .transform_values { it.map(&:length).min }
      .then do |f|
        v, min = f.min_by { it[1] }
        return v if f.values.tally[min] == 1
      end
  end
end

CALCULATED_PAD_MOVEMENTS.transform_values! do |options|
  next [optimise(options)] if options.length > 1

  options
end

def movement(code)
  possibility_generator(["A", *code.chars], CALCULATED_PAD_MOVEMENTS)
    .first
end

def min_pad_movements(code)
  counts = code.split(/(?<=A)/).tally
  cache = {}

  25.times do
    new_counts = Hash.new { 0 }

    counts.each do |c, count|
      cache[c] ||= movement(c).join.split(/(?<=A)/).tally
      cache[c].each do |n, t|
        new_counts[n] += count * t
      end
    end

    counts = new_counts
  end

  counts.sum { |n, t| n.length * t }
end

def min_movements(code)
  found = possibility_generator(["A", *code.chars], CALCULATED_KEYPAD_MOVEMENTS)

  found.map do |key|
    min_pad_movements(key.join)
  end.min
end

CODES
  .sum { min_movements(it) * it.to_i }
  .then { pp it }
