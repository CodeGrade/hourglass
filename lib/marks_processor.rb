# frozen_string_literal: true

class MarksProcessor
  def self.process_marks(contents)
    lines = contents.lines.map &:chomp
    lines.shift if lines[0].blank?
    lines.pop if lines[-1].blank?
    marks = {
      byLine: [],
      byNum: {},
    }
    count = 0
    (0...lines.length).each do |lineNum|
      marks[:byLine][lineNum] = []
      reTag = /~ro:(\d+):([se])~/
      match = reTag.match(lines[lineNum])
      while match do
        idx = match.begin(0)
        lines[lineNum].sub!(match[0], '')
        if match[2] == 's'
          count += 1
          marks[:byNum][match[1]] = {
            from: {
              line: lineNum,
              ch: idx,
            },
            options: {
              inclusiveLeft: (lineNum == 0 && idx == 0),
            },
          }
          if marks[:byLine][lineNum][idx].nil?
            marks[:byLine][lineNum][idx] = {
              open: [],
              close: [],
            }
          end
          marks[:byLine][lineNum][idx][:open].push(marks[:byNum][match[1]])
        elsif !marks[:byNum][match[1]].nil?
          marks[:byNum][match[1]][:to] = {
            line: lineNum,
            ch: idx,
          }
          lastLine = lineNum == lines.length - 1
          endOfLine = idx == lines[lineNum].length
          marks[:byNum][match[1]][:options][:inclusiveRight] = lastLine && endOfLine
          if marks[:byLine][lineNum][idx].nil?
            marks[:byLine][lineNum][idx] = {
              open: [],
              close: [],
            }
          end
          marks[:byLine][lineNum][idx][:close].unshift(marks[:byNum][match[1]])
        else
          m = match.to_a.join(', ')
          raise "No information found for mark [#{m}]"
        end
        match = reTag.match(lines[lineNum], idx)
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
          location: mark['from']
        }
        b = {
          key: "~ro:#{idx + 1}:e~",
          location: mark['to']
        }
        [a, b]
      end
      .flatten
      .sort_by do |m1|
        [m1[:location]['line'], m1[:location]['ch']]
      end.reverse

    lines = contents.lines
    inserted_marks.each do |m|
      lines[m[:location]['line']].insert(m[:location]['ch'], m[:key])
    end
    lines.join
  end
end
