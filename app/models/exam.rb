# coding: utf-8

class Exam < ApplicationRecord
  has_many :registrations
  has_many :users, through: :registrations
  has_many :rooms
  has_many :exam_messages
  has_one :upload, dependent: :destroy

  validates_presence_of :upload
  after_initialize :generate_secret_key!

  def finalized?
    registrations.all?(&:final)
  end

  def finalize!
    rooms.map(&:finalize!)
  end

  def exam_yaml
    # TODO need to validate that this file is part of the upload before allowing the upload
    #   in a `validates` in Upload
    upload.extracted_path.join("exam.yaml")
  end

  def policy_permits?(policy)
    policies.include? policy
  end

  def policies
    properties['policies']
  end

  def properties
    return @properties if @properties
    @properties = YAML.load(File.read(exam_yaml))
  end

  def map_reference(r)
    {
      type: r.keys.first,
      path: r.values.first
    }
  end
  def info()
    exam_info = properties['versions'][0]

    answers = exam_info['questions'].map do |q|
      q['parts'].map do |p|
        p['body'].map do |b|
          if b.is_a? String
            nil
          elsif b.is_a? Hash
            if b.key? 'AllThatApply'
              b['AllThatApply']['options'].map(&:values).flatten
            elsif b.key? 'Code'
              nil
            elsif b.key? 'CodeTag'
              {
                selectedFile: b['CodeTag']['correctAnswer']['filename'],
                lineNumber: b['CodeTag']['correctAnswer']['line']
              }
            elsif b.key? 'Matching'
              b['Matching']['correctAnswers']
            elsif b.key? 'MultipleChoice'
              b['MultipleChoice']['correctAnswer']
            elsif b.key? 'Text'
              nil
            elsif b.key? 'TrueFalse'
              if b['TrueFalse'] == !! b['YesNo']
                b['TrueFalse']
              else
                b['TrueFalse']['correctAnswer']
              end
            elsif b.key? 'YesNo'
              if b['YesNo'] == !! b['YesNo']
                b['YesNo']
              else
                b['YesNo']['correctAnswer']
              end
            else
              throw 'Bad body item'
            end
          end
        end
      end
    end

    e_reference = exam_info['reference']&.map{|r| map_reference r}
    questions = exam_info['questions'].map do |q|
      q_reference = q['reference']&.map{|r| map_reference r}
      {
        name: q['name'],
        separateSubparts: q['separateSubparts'],
        description: q['description'],                
        reference: q_reference,
        parts: q['parts'].map do |p|
          p_reference = p['reference']&.map{|r| map_reference r}
          {
            name: p['name'],
            description: p['description'],
            points: p['points'],
            reference: p_reference,
            body: p['body'].map do |b|
              if b.is_a? String
                {
                  type: 'HTML',
                  value: b
                }
              elsif b.is_a? Hash
                if b.key? 'AllThatApply'
                  {
                    type: 'AllThatApply',
                    prompt: b['AllThatApply']['prompt'],
                    options: b['AllThatApply']['options'].map(&:keys).flatten
                  }
                elsif b.key? 'Code'
                  {
                    type: 'Code',
                    prompt: b['Code']['prompt'],
                    lang: b['Code']['lang'],
                    initial: b['Code']['initial'],
                  }
                elsif b.key? 'CodeTag'
                  referent =
                    if b['CodeTag']['choices'] == 'part'
                      throw 'No reference for part.' if p_reference.nil?
                      p_reference
                    elsif b['CodeTag']['choices'] == 'question'
                      throw 'No reference for question.' if q_reference.nil?
                      q_reference
                    elsif b['CodeTag']['choices'] == 'all'
                      throw 'No reference for exam.' if e_reference.nil?
                      e_reference
                    else
                      throw "CodeTag reference is invalid."
                    end
                  {
                    type: 'CodeTag',
                    choices: referent,
                    prompt: b['CodeTag']['prompt'],
                  }
                elsif b.key? 'Matching'
                  {
                    type: 'Matching',
                    prompts: b['Matching']['prompts'],
                    values: b['Matching']['values']
                  }
                elsif b.key? 'MultipleChoice'
                  {
                    type: 'MultipleChoice',
                    prompt: b['MultipleChoice']['prompt'],
                    options: b['MultipleChoice']['options']
                  }
                elsif b.key? 'Text'
                  if b['Text'].nil?
                    {
                      type: 'Text',
                      prompt: []
                    }
                  else
                    {
                      type: 'Text',
                      prompt: b['Text']['prompt']
                    }
                  end
                elsif b.key? 'TrueFalse'
                  {
                    type: 'YesNo',
                    yesLabel: 'True',
                    noLabel: 'False',
                    prompt:
                      if b['TrueFalse'] == !!b['TrueFalse']
                        []
                      else
                        b['TrueFalse']['prompt']
                      end
                  }
                elsif b.key? 'YesNo'
                  {
                    type: 'YesNo',
                    prompt:
                      if b['YesNo'] == !!b['YesNo']
                        []
                      else
                        b['YesNo']['prompt']
                      end
                  }
                else
                  throw 'Bad question type.'
                end
              else
                throw 'Bad body item.'
              end
            end
          }
        end
      }
    end
    {
      contents: {
        questions: questions,
        reference: e_reference,
        instructions: exam_info['instructions']
      },
      answers: answers
    }
  end

  def process_marks(contents)
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

  def generate_secret_key!
    return unless new_record?

    unless secret_key.nil?
      raise Exception.new("Can't generate a second secret key for an exam.")
    end

    self.secret_key = SecureRandom.urlsafe_base64
  end

  def file(name)
    f = upload.extracted_path.join('files', name)
    raise "bad file '#{f}'!" unless File.exist? f

    f
  end

  def get_exam_files
    clean_up(get_raw_files(""))
  end

  def professors
    registrations.includes(:user).where(role: 'professor').map(&:user)
  end

  def students
    registrations.includes(:user).where(role: 'student').map(&:user)
  end

  def announcements
    exam_messages.where(recipient: nil, sender: professors)
  end

  def questions
    exam_messages.where(recipient: nil, sender: students)
  end

  def questions_by(user)
    exam_messages.where(recipient: nil, sender: user)
  end

  def private_messages_for(user)
    exam_messages.where(recipient: user)
  end

  def all_messages_for(user)
    if user.reg_for(self).professor?
      questions.or(announcements)
    else
      private_messages_for(user).or(announcements)
    end
  end

  private

  def with_extracted(item)
    return nil if item.nil?

    if item[:full_path]
      return nil if File.basename(item[:full_path].to_s) == ".DS_Store"

      mimetype = ApplicationHelper.mime_type(item[:full_path])
      contents = begin
        File.read(item[:full_path].to_s)
                 rescue Errno::EACCES => e
                   "Could not access file:\n#{e.to_s}"
                 rescue Errno::ENOENT => e
                   "Somehow, #{item[:full_path]} does not exist"
                 rescue Exception => e
                   "Error reading file:\n#{e.to_s}"
      end
      if mimetype.starts_with? "image/"
        contents = Base64.encode(contents)
        item[:contents] = ensure_utf8(contents, mimetype)
      else
        processed = process_marks(ensure_utf8(contents, mimetype))
        item[:contents] = processed[:text]
        item[:marks] = processed[:marks]
      end
      item[:text] = item[:path]
      # pdf_path: item[:converted_path],
      item[:type] = mimetype
      item[:filedir] = "file"
      item.delete(:full_path)
    elsif item[:link_to]
      item[:type] = "symlink"
    else
      return nil if item[:path] == "__MACOSX"
      item[:filedir] = "dir"
      item[:text] = item[:path] + "/"
      item[:selectable] = false
      item[:nodes] = item[:children].map { |n| with_extracted(n) }.compact
      item.delete(:children)
    end
    item
  end

  def ensure_utf8(str, mimetype)
    if ApplicationHelper.binary?(mimetype)
      str
    else
      if str.is_utf8?
        str
      else
        begin
          if str.dup.force_encoding(Encoding::CP1252).valid_encoding?
            str.encode(Encoding::UTF_8, Encoding::CP1252)
          else
            str.encode(Encoding::UTF_8, invalid: :replace, undef: :replace, replace: '?')
          end
        rescue Exception => e
          str
        end
      end
    end
  end

  def get_raw_files(folder)
    self.upload.extracted_files(folder, true)
  end

  def clean_up(raw_files)
    raw_files = raw_files.map do |f|
      with_extracted(f)
    end

    raw_files = raw_files.compact

    raw_files
  end

end
