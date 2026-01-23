# frozen_string_literal: true

PAIRS = ARGF.read.each_line.map(&:chomp).map { it.split("-") }

connections = {}
groups = Set.new

PAIRS.each do |(a, b)|
  connections[a] ||= Set.new
  connections[b] ||= Set.new
  connections[a] << b
  connections[b] << a
end

connections.each do |c, to|
  to.to_a.combination(2).each do |(a, b)|
    next unless connections[a].include?(b)
    next unless connections[b].include?(a)

    groups << Set.new([c, a, b])
  end
end

pp groups.to_a.select { it.any? { it.start_with?("t") } }.count
