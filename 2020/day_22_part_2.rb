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

# This is very slow, even with jyit
# Is it Ruby, or was my input just a bit worse than others?

def first_player_wins?(decks)
  return decks[0][0] > decks[1][0] if decks[0][0] > decks[0].length - 1 || decks[1][0] > decks[1].length - 1

  result = play(decks.map.with_index { |d, i| d.slice(1...(decks[i][0] + 1)) })
  result[1].empty?
end

def play(decks)
  seen = Set.new

  loop do
    first_player_wins = seen.include?(decks) || first_player_wins?(decks)
    seen << decks.map(&:dup)
    a, b = decks.map(&:shift)
    if first_player_wins
      decks[0].push(a, b)
    else
      decks[1].push(b, a)
    end
    break if decks.any?(&:empty?)
  end

  decks
end

play(decks)

decks
  .find { !it.empty? }
  .reverse
  .map.with_index { |v, i| v * (i + 1) }
  .sum
  .then { p it }
