# frozen_string_literal: true

NUMBERS = ARGF.read.each_line.map(&:chomp).map(&:to_i)

def generate(number)
  number = ((number * 64) ^ number) % 16_777_216
  number = ((number / 32) ^ number) % 16_777_216
  ((number * 2048) ^ number) % 16_777_216
end

NUMBERS
  .map do |v|
    2000.times { v = generate(v) }
    v
  end
  .sum
  .then { pp it }
