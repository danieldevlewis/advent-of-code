# frozen_string_literal: true

card, door = ARGF
  .each_line
  .map(&:chomp)
  .map(&:to_i)

size = 1
key = 1
loop do
  key *= 7
  key %= 20_201_227
  break if key == door

  size += 1
end

key = 1
size.times do
  key *= card
  key %= 20_201_227
end

pp key
