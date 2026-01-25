# frozen_string_literal: true

Gate = Data.define(:inputs, :type, :output)
OPERATIONS = { "OR" => :|, "AND" => :&, "XOR" => :^ }

# Wire values
wires = {}
# Wire to array of gates
connections = Hash.new { [] }

ARGF
  .read
  .each_line
  .map(&:chomp)
  .each do |line|
    case line
    when /(\w{3}): (1|0)/
      wire, value = Regexp.last_match.captures
      wires[wire] = value.to_i
    when /(\w{3}) (AND|OR|XOR) (\w{3}) -> (\w{3})/
      a, op, b, out = Regexp.last_match.captures
      gate = Gate.new([a, b], OPERATIONS[op], out)
      wires[out] = nil
      connections[a] = connections[a] << gate
      connections[b] = connections[b] << gate
    end
  end

z_gates = wires.keys.select { it.start_with?("z") }.sort_by { it[1..].to_i }
target_z_count = z_gates.length
z_count = 0

queue = wires.reject { |_, v| v.nil? }.keys
completed_gates = Set.new

catch :done do
  loop do
    wire = queue.shift

    connections[wire].each do |gate|
      next if completed_gates.include?(gate)
      next if gate.inputs.any? { wires[it].nil? }

      wires[gate.output] = wires[gate.inputs[0]].send(gate.type, wires[gate.inputs[1]])
      completed_gates << gate
      queue << gate.output
      z_count += 1 if z_gates.include?(gate.output)
      throw :done if z_count == target_z_count
    end
  end
end

pp z_gates.map { wires[it] }.reverse.join.to_i(2)
