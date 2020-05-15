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
        lines[lineNum].sub!(match[0], "")
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
          throw "No information found for mark [#{m}]"
        end
        match = reTag.match(lines[lineNum], idx)
      end
    end
    {
      text: lines.join("\n"),
      marks: marks[:byNum].values,
    }
  end
end
