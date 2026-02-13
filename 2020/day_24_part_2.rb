# frozen_string_literal: true

require "matrix"

V = Vector

paths = ARGF
  .each_line
  .map(&:chomp)
  .map do |line|
    line.split(/(e|w|se|sw|nw|ne)/).reject { it == "" }
  end

# We can use a 2D coordinate system

MOVES_EVEN = {
  "e" => V[1, 0],
  "se" => V[1, 1],
  "sw" => V[0, 1],
  "w" => V[-1, 0],
  "ne" => V[1, -1],
  "nw" => V[0, -1]
}

MOVES_ODD = {
  "e" => V[1, 0],
  "se" => V[0, 1],
  "sw" => V[-1, 1],
  "w" => V[-1, 0],
  "ne" => V[0, -1],
  "nw" => V[-1, -1]
}

grid = Hash.new { false }

paths.each do |path|
  cursor = V[0, 0]

  path.each do |move|
    cursor += (cursor[1].even? ? MOVES_EVEN : MOVES_ODD)[move]
  end
  grid[cursor] = !grid[cursor]
end

100.times do
  previous = grid.dup
  previous
    .select { |_, v| v }
    .each do |(k, _)|
      adjacent = (k[1].even? ? MOVES_EVEN : MOVES_ODD).values.select do |move|
        previous[k + move]
      end.size
      next unless adjacent.zero? || adjacent > 2

      grid[k] = false
    end

  previous
    .select { |_, v| v }
    .flat_map do |(k, _)|
      (k[1].even? ? MOVES_EVEN : MOVES_ODD)
        .values
        .map { it + k }
        .reject { previous[it] }
    end
    .map do |k|
      adjacent = (k[1].even? ? MOVES_EVEN : MOVES_ODD)
        .values
        .select { previous[k + it] }
        .size

      grid[k] = true if adjacent == 2
    end
end

puts grid.filter { |_, v| v }.size
