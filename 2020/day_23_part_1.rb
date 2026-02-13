# frozen_string_literal: true

cups = ARGF.read.strip.chars.map(&:to_i)

current = 0
100.times do
  label = cups[current]
  target_label = label
  removed = cups.slice!(current + 1, 3) || []
  removed.push(*cups.slice!(0, 3 - removed.length)) if removed.length < 3
  loop do
    target_label -= 1
    target_label = 9 if target_label.zero?
    break unless removed.include?(target_label)
  end
  target_index = cups.find_index(target_label)
  cups.insert(target_index + 1, *removed)

  current = cups.find_index(label)
  current += 1
  current = 0 if current == cups.length
end

index = cups.find_index(1)
puts (cups[(index + 1)..] + cups[0...index]).join
