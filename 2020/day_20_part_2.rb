# frozen_string_literal: true

tiles = []

class Tile
  attr_accessor :number, :lines

  def initialize(number, lines)
    @number = number
    @lines = lines
  end

  def eql?(other)
    other.number == number
  end
end

tile = Tile.new(0, [])

ARGF
  .each_line
  .map(&:chomp)
  .push("")
  .each do |line|
    if line == ""
      tiles << tile
      tile = Tile.new(0, [])
    elsif line.start_with?("Tile")
      tile.number = line.gsub(/[^\d]/, "").to_i
    else
      tile.lines << line.chars
    end
  end

# We can make some assumptions
# Each only has one matching side
# Edges will not match any side

$tile_edges = Hash.new { Set.new }

# Find all the edges and which tiles have them
tiles.each do |tile|
  [
    tile.lines.first,
    tile.lines.first.reverse,
    tile.lines.last,
    tile.lines.last.reverse,
    tile.lines.transpose.first,
    tile.lines.transpose.first.reverse,
    tile.lines.transpose.last,
    tile.lines.transpose.last.reverse
  ].each do |edge|
    $tile_edges[edge] = $tile_edges[edge].add(tile)
  end
end

def flip_x(tile)
  tile.lines.map!(&:reverse)
end

def flip_y(tile)
  tile.lines.reverse!
end

def rotate(tile)
  tile.lines = tile.lines.transpose.map(&:reverse)
end

def match_edge(tile, side)
  edge = get_edge(tile, side)
  ($tile_edges[edge] + $tile_edges[edge.reverse] - [tile]).uniq
end

def get_edge(tile, side)
  case side
  when "top"
    tile.lines.first
  when "right"
    tile.lines.transpose.last
  when "bottom"
    tile.lines.last
  when "left"
    tile.lines.transpose.first
  end
end

def top(tile)
  tile.lines.first
end

def bottom(tile)
  tile.lines.last
end

def left(tile)
  tile.lines.transpose.first
end

def right(tile)
  tile.lines.transpose.last
end

def fit(tile, edge, side)
  catch :done do
    4.times do
      throw :done if get_edge(tile, side) == edge

      rotate(tile)
    end
    flip_x(tile)
    4.times do
      throw :done if get_edge(tile, side) == edge

      rotate(tile)
    end
    flip_y(tile)
    4.times do
      throw :done if tile.lines.transpose.first == edge

      rotate(tile)
    end
  end
end

# The corners will have two edges not used by any other tile
corners = tiles.select do |tile|
  [
    match_edge(tile, "top"),
    match_edge(tile, "left"),
    match_edge(tile, "right"),
    match_edge(tile, "bottom")
  ].select(&:empty?).count == 2
end

grid = []

# We can start with any corner
corner = corners.first

loop do
  break if match_edge(corner, "top").empty? && match_edge(corner, "left").empty?

  rotate(corner)
end

grid << [corner]

i = 0
loop do
  loop do
    tile = grid[i].last
    edge = tile.lines.transpose.last
    next_tile = ($tile_edges[edge] - [tile]).first
    break unless next_tile

    fit(next_tile, edge, "left")

    grid[i] << next_tile
  end

  tile = grid[i].first
  edge = tile.lines.last
  next_tile = ($tile_edges[edge] - [tile]).first
  break unless next_tile

  fit(next_tile, edge, "top")
  i += 1
  grid[i] = [next_tile]
end

full_grid = grid.flat_map do |row|
  row.first.lines[1...-1].map.with_index do |_, i|
    row.map do |tile|
      tile.lines[i + 1][1...-1]
    end.flatten
  end
end

sea_monster = [
  "                  #",
  "#    ##    ##    ###",
  " #  #  #  #  #  #"
]

sea_monster_coords = sea_monster.flat_map.with_index do |line, y|
  line.chars.map.with_index do |char, x|
    next if char == " "

    [x, y]
  end
end.compact

monsters = catch(:done) do
  %w[flip_x flip_y _].each do |flip|
    4.times do
      monsters = 0
      (0..(full_grid.first.length - sea_monster.map(&:length).max)).each do |x|
        (0..(full_grid.length - 3)).each do |y|
          next unless sea_monster_coords.all? do |(dx, dy)|
            full_grid[y + dy][x + dx] == "#"
          end

          monsters += 1
        end
      end
      throw :done, monsters if monsters > 0

      full_grid = full_grid.transpose.map(&:reverse)
    end

    full_grid.map!(&:reverse) if flip == "flip_x"
    full_grid.reverse! if flip == "flip_y"
  end
end

full_grid
  .map { it.select { it == "#" }.length }
  .sum
  .then { it - (sea_monster.map { it.tr(" ", "").length }.sum * monsters) }
  .then { p it }
