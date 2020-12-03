# frozen_string_literal: true

# Utility class to take source code with spans marked up, and extract the marks as structured data
class MarksProcessor
  # rubocop:disable Metrics/BlockLength, Style/MultilineBlockChain
  def self.process_marks(contents)
    lines = contents.lines.map(&:chomp)
    lines.shift if lines[0].blank?
    lines.pop if lines[-1].blank?
    marks = {
      byLine: [],
      byNum: {},
    }
    count = 0
    (0...lines.length).each do |line_num|
      marks[:byLine][line_num] = []
      re_tag = /~ro:(\d+):([se])~/
      match = re_tag.match(lines[line_num])
      while match
        idx = match.begin(0)
        lines[line_num].sub!(match[0], '')
        if match[2] == 's'
          count += 1
          marks[:byNum][match[1]] = {
            from: {
              line: line_num,
              ch: idx,
            },
            options: {
              inclusiveLeft: (line_num.zero? && idx.zero?),
            },
          }
          if marks[:byLine][line_num][idx].nil?
            marks[:byLine][line_num][idx] = {
              open: [],
              close: [],
            }
          end
          marks[:byLine][line_num][idx][:open].push(marks[:byNum][match[1]])
        elsif !marks[:byNum][match[1]].nil?
          marks[:byNum][match[1]][:to] = {
            line: line_num,
            ch: idx,
          }
          last_line = line_num == lines.length - 1
          end_of_line = idx == lines[line_num].length
          marks[:byNum][match[1]][:options][:inclusiveRight] = last_line && end_of_line
          if marks[:byLine][line_num][idx].nil?
            marks[:byLine][line_num][idx] = {
              open: [],
              close: [],
            }
          end
          marks[:byLine][line_num][idx][:close].unshift(marks[:byNum][match[1]])
        else
          m = match.to_a.join(', ')
          raise "No information found for mark [#{m}]"
        end
        match = re_tag.match(lines[line_num], idx)
      end
    end
    {
      text: lines.join("\n"),
      marks: marks[:byNum].values,
    }
  end

  def self.process_marks_reverse(contents, marks)
    inserted_marks =
      marks
      .each_with_index.map do |mark, idx|
        a = {
          key: "~ro:#{idx + 1}:s~",
          location: mark['from'],
        }
        b = {
          key: "~ro:#{idx + 1}:e~",
          location: mark['to'],
        }
        [a, b]
      end
      .flatten
      .sort_by do |m1|
        [m1[:location]['line'], m1[:location]['ch']]
      end.reverse

    lines = contents.lines
    inserted_marks.each do |m|
      # After removing marks, it's possible that we have a line that
      # is completely blank, so `contents.lines` could drop that line,
      # So just in case, we'll ensure the line is present and at least 
      # as long as where the mark should be
      lines[m[:location]['line']] = (' ' * m[:location]['ch']) if lines[m[:location]['line']].nil?
      lines[m[:location]['line']].insert(m[:location]['ch'], m[:key])
    end
    lines.join
  end
  # rubocop:enable Metrics/BlockLength, Style/MultilineBlockChain
end
