# frozen_string_literal: true

keys = []
locks = []

block = []

ARGF
  .read
  .each_line
  .map(&:chomp)
  .push("")
  .each do |line|
    if line == ""
      numbers = block.transpose.map { it.filter { it == "#" }.length }
      if block.first == "#####".chars
        locks << numbers
      else
        keys << numbers
      end
      block = []
    else
      block << line.split("")
    end
  end

locks.flat_map do |lock|
  keys.select do |key|
    key.each_with_index.all? do |x, i|
      x <= 7 - lock[i]
    end
  end
end.count.then { pp it }
