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

best = 0
connections.each do |c, to|
  (2..to.length).reverse_each do |i|
    break if best >= i + 1

    to.to_a.combination(i).each do |set|
      next unless set.all? { |a| (set - [a]).all? { connections[it].include?(a) } }

      groups << Set.new([c, *set])
      best = set.size + 1
    end
  end
end

puts groups.to_a.max_by(&:length).sort.join(",")
