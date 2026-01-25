# frozen_string_literal: true

tiles = []

Tile = Struct.new(:number, :lines)
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

tile_edges = Hash.new { Set.new }

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
    tile_edges[edge] = tile_edges[edge].add(tile)
  end
end

# The corners will have two edges not used by any other tile
edges = tiles.select do |tile|
  [
    tile.lines.first,
    tile.lines.transpose.last,
    tile.lines.last,
    tile.lines.transpose.first
  ].select do |edge|
    tile_edges[edge].to_a == [tile] || tile_edges[edge.reverse].to_a == [tile]
  end.count == 2
end

pp edges.map(&:number).inject(:*)
