# frozen_string_literal: true

decks = ARGF
  .each_line
  .map(&:chomp)
  .each_with_object([]) do |line, d|
    if line.start_with?("Player")
      d << []
    elsif line != ""
      d.last << line.to_i
    end
  end

loop do
  cards = decks.map(&:shift)
  winner = cards.each_with_index.max[1]
  decks[winner].push(*cards.sort.reverse)

  break if decks.any?(&:empty?)
end

decks
  .find { !it.empty? }
  .reverse
  .map.with_index { |v, i| v * (i + 1) }
  .sum
  .then { p it }
