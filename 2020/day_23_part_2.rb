# frozen_string_literal: true

cups = ARGF.read.strip.chars.map(&:to_i)
cups.concat((10..1_000_000).to_a)

# Use a linked list
# With a hash to lookup links

class Link
  attr_accessor :prev, :next, :value

  def initialize(value)
    @value = value
  end

  def inspect
    [prev&.value, value, self.next&.value]
  end
end

last = cups.last
i = 0
list = {}
loop do
  link = Link.new(cups[i])
  list[cups[i]] = link
  link.prev = list[cups[i - 1]] if i > 0
  list[cups[i - 1]].next = link if i > 0
  i += 1
  break if i >= cups.length
end
list[cups[0]].prev = list[last]
list[last].next = list[cups[0]]
max = cups.max

current = list[cups[0]]

10_000_000.times do
  removed = current.next
  current.next = removed.next.next.next
  removed.next.next.next.prev = current
  target_label = current.value
  loop do
    target_label -= 1
    target_label = max if target_label.zero?
    labels = [removed.value, removed.next.value, removed.next.next.value]
    break unless labels.include?(target_label)
  end
  target = list[target_label]
  removed.next.next.next = target.next
  target.next.prev = removed.next.next

  target.next = removed
  removed.prev = target
  current = current.next
end

puts list[1].next.value * list[1].next.next.value
