# frozen_string_literal: true

Gate = Struct.new(:inputs, :type, :output)
OPERATIONS = { "OR" => :|, "AND" => :&, "XOR" => :^ }

# Wire values
wires = {}
# Wire to array of gates
connections = Hash.new { [] }
gates = []

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
      gates << gate
    end
  end

X_WIRES = wires.keys.select { it.start_with?("x") }.sort_by { it[1..].to_i }.reverse
Y_WIRES = wires.keys.select { it.start_with?("y") }.sort_by { it[1..].to_i }.reverse
Z_WIRES = wires.keys.select { it.start_with?("z") }.sort_by { it[1..].to_i }.reverse

SWAPS = [
  %w[nbf z30],
  %w[jgt mht],
  %w[z05 hdt],
  %w[z09 gbf]
]

SWAPS.each do |(from, to)|
  gate_from = gates.find { it.output == from }
  gate_to = gates.find { it.output == to }
  gate_from.output = to
  gate_to.output = from
end

# The easiest way of doing this is to output in graphviz
# and look for the exceptions in the pattern

def to_graphviz(gates, connections)
  nodes = gates.flat_map do |from|
    node = "\"#{from.inputs[0]} #{from.type} #{from.inputs[1]}\n#{from.output}\""

    [
      from.output.start_with?("z") && "#{node} -> #{from.output};",
      from.inputs[0].start_with?(/x|y/) && "#{from.inputs[0]} -> #{node};",
      from.inputs[1].start_with?(/x|y/) && "#{from.inputs[1]} -> #{node};",
      *connections[from.output].map do |to|
        "#{node} -> \"#{to.inputs[0]} #{to.type} #{to.inputs[1]}\n#{to.output}\";"
      end
    ].select(&:itself)
  end
  <<~GRAPHVIZ
    digraph G {
      #{nodes.join("\n")}
      subgraph z {
        rank = same;
        #{Z_WIRES.join(' -> ')} [style=invis];
      }
      subgraph x {
        rank = same;
        #{Y_WIRES.join(' -> ')} [style=invis];
      }
      subgraph y {
        rank = same;
        #{X_WIRES.join(' -> ')} [style=invis];
      }
    }
  GRAPHVIZ
end

# puts to_graphviz(gates, connections)
# dot -Tsvg day_24.dot > day_24.svg

def test(initial_wires, connections)
  wires = initial_wires.dup
  target_z_count = Z_WIRES.length
  z_count = 0

  queue = wires.reject { |_, v| v.nil? }.keys
  completed_gates = Set.new

  catch :done do
    loop do
      wire = queue.shift
      return false if wire.nil?

      connections[wire].each do |gate|
        next if completed_gates.include?(gate)
        next if gate.inputs.any? { wires[it].nil? }

        wires[gate.output] = wires[gate.inputs[0]].send(gate.type, wires[gate.inputs[1]])
        completed_gates << gate
        queue << gate.output
        z_count += 1 if Z_WIRES.include?(gate.output)
        throw :done if z_count == target_z_count
      end
    end
  end

  x = X_WIRES.map { wires[it] }.join.to_i(2)
  y = Y_WIRES.map { wires[it] }.join.to_i(2)
  z = Z_WIRES.map { wires[it] }.join.to_i(2)

  pp [
    (0..X_WIRES.length).map { it.digits[0] }.join.reverse,
    x.to_s(2).ljust(X_WIRES.length + 1, "0"),
    y.to_s(2).ljust(X_WIRES.length + 1, "0"),
    (x + y).to_s(2).ljust(X_WIRES.length + 1, "0"),
    z.to_s(2).ljust(Z_WIRES.length, "0"),
    x + y == z
  ]
end

test(wires.transform_values { it.nil? ? nil : 0 }, connections)
test(wires.transform_values { it.nil? ? nil : 1 }, connections)
test(wires.to_h { |k, v| [k, k.start_with?("x") ? 1 : v && 0] }, connections)
test(wires.to_h { |k, v| [k, k.start_with?("y") ? 1 : v && 0] }, connections)
test(wires, connections)
puts SWAPS.flatten.sort.join(",")
