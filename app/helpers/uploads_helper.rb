# frozen_string_literal: true

require 'fileutils'
require 'audit'
require 'open3'
require 'headless'

module UploadsHelper
  # Converts back and forth between upload and saved exam.yaml formats
  class FormatConverter
    # rubocop:disable Metrics/PerceivedComplexity, Metrics/BlockLength, Metrics/BlockNesting
    def self.build_exam_version(properties, default_name, files, destination = nil)
      contents = properties['contents']

      policies = properties['policies'] || []
      str_policies = policies.join(',')
      instructions = contents.dig('instructions') || ''

      version = destination || ExamVersion.new
      version.assign_attributes(
        name: default_name,
        files: files || [],
        policies: str_policies,
        instructions: instructions,
        info: {placeholder: true},
      )

      avail_references = {
        "exam" => false,
        "question" => false,
        "part" => false,
      }

      contents['reference']&.each_with_index do |ref, refnum|
        new_ref = convert_reference(ref, refnum, ev)
        next unless new_ref
        ev.association(:db_references).add_to_target(new_ref)
        avail_references["exam"] = true
      end

      contents['questions'].each do |q|
        if q['parts'].length == 1 && q['separateSubparts']
          raise 'Cannot separateSubparts for a question with only one part'
        end
      end

      e_rubric = convert_rubric({exam_version: version}, contents['examRubric'])
      version.association(:rubrics).add_to_target(e_rubric)

      contents['questions'].each_with_index do |qinfo, qnum|
        question = Question.new(
          name: qinfo['name'],
          separate_subparts: !!qinfo['separateSubparts'],
          description: qinfo['description'],
          extra_credit: !!qinfo['extraCredit'],
          index: qnum,
        )
        version.association(:db_questions).add_to_target(question)
        q_rubric = convert_rubric({exam_version: version, question: question}, qinfo['questionRubric'])
        question.association(:rubrics).add_to_target(q_rubric)
        avail_references["question"] = false
        qinfo['reference']&.each_with_index do |ref, refnum|
          new_ref = convert_reference(ref, refnum, version)
          next unless new_ref
          question.association(:references).add_to_target(new_ref)
          avail_references["question"] = true
        end

        qinfo['parts'].each_with_index do |pinfo, pnum|
          part = Part.new(
            name: pinfo['name'],
            description: pinfo['description'],
            points: pinfo['points'],
            extra_credit: !!pinfo['extraCredit'],
            index: pnum,
          )
          question.association(:parts).add_to_target(part)
          p_rubric = convert_rubric({exam_version: version, question: question, part: part}, pinfo['partRubric'])
          part.association(:rubrics).add_to_target(p_rubric)
          avail_references["part"] = false
          pinfo['reference']&.each_with_index do |ref, refnum|
            new_ref = convert_reference(ref, refnum, ev)
            next unless new_ref
            part.association(:references).add_to_target(new_ref)
            avail_references["part"] = true
          end

          pinfo['body'].each_with_index do |binfo, bnum|
            item = nil
            b_rubric = nil
            case binfo
            when String
              item = BodyItem.new(info: binfo)
              owners = {exam_version: version, question: question, part: part, body_item: item}
              b_rubric = convert_rubric(owners, nil)
            when Hash
              rubric_val = binfo.values.first.delete('rubric')
              if binfo['CodeTag']
                choices = binfo['CodeTag']['choices']
                unless avail_references[choices]
                  raise "No reference for #{choices} @(#{qnum}, #{pnum}, #{bnum})."
                end
              end
              item = BodyItem.from_yaml(binfo.keys.first, binfo.values.first)
              owners = {exam_version: version, question: question, part: part, body_item: item}
              b_rubric = convert_rubric(owners, rubric_val)
            else
              raise 'Bad body item.'
            end
            item.index = bnum
            item.association(:rubrics).add_to_target(b_rubric)
            part.association(:body_items).add_to_target(item)
          end
        end
      end

      version
    end

    def self.convert_reference(ref, refnum, ev)
      return if ref.nil?
      type = ref.keys.first
      path = ref.values.first

      new_ref = Reference.new(
        path: path,
        type: type,
        index: refnum,
        exam_version: ev,
      )
    end

    # TODO fixme and unparse_preset OR rubric_as_json
    def self.unparse_info(info, rubrics)
      info = info.deep_stringify_keys
      questions = info['contents']['questions'].each_with_index.map do |q, qnum|
        q_answers = info['answers'][qnum]
        q_rubrics = rubrics['questions'][qnum]
        q_reference = q['reference']&.map { |r| unmap_reference r }
        q_reference = nil if q_reference.blank?
        {
          name: unmake_html_val(q['name']),
          description: unmake_html_val(q['description'], true),
          extraCredit: q['extraCredit'],
          reference: q_reference,
          separateSubparts: q['separateSubparts'],
          questionRubric: revert_rubric(q_rubrics['questionRubric']),
          parts: q['parts'].each_with_index.map do |p, pnum|
            p_answers = q_answers[pnum]
            p_rubrics = q_rubrics['parts'][pnum]
            p_reference = p['reference']&.map { |r| unmap_reference r }
            p_reference = nil if p_reference.blank?
            {
              name: unmake_html_val(p['name']),
              description: unmake_html_val(p['description'], true),
              points: p['points'],
              extraCredit: p['extraCredit'],
              reference: p_reference,
              partRubric: revert_rubric(p_rubrics['partRubric']),
              body: p['body'].each_with_index.map do |b, bnum|
                b_answer = p_answers[bnum]
                b_rubric = p_rubrics['body'][bnum]
                case b['type']
                when 'HTML'
                  b['value']
                when 'AllThatApply'
                  {
                    AllThatApply: {
                      prompt: unmake_html_val(b['prompt'], true),
                      options: b['options'].zip(b_answer).map do |opt, ans|
                        { unmake_html_val(opt) => ans }
                      end,
                      rubric: revert_rubric(b_rubric),
                    }.compact,
                  }.compact.deep_stringify_keys
                when 'Code'
                  initial = b['initial']
                  unless initial.nil?
                    if initial.key? 'file'
                      # potentially nothing to do here; confirm with parse_info
                    else
                      unprocessed = MarksProcessor.process_marks_reverse(initial['text'], initial['marks'])
                      initial = { 'code' => unprocessed }
                    end
                  end
                  {
                    Code: {
                      prompt: unmake_html_val(b['prompt'], true),
                      lang: b['lang'],
                      initial: initial,
                      correctAnswer:
                        if b_answer['NO_ANS'] || b_answer['text'].blank?
                          nil
                        else
                          MarksProcessor.process_marks_reverse(b_answer['text'], b_answer['marks'])
                        end,
                      rubric: revert_rubric(b_rubric),
                    }.compact,
                  }.compact.deep_stringify_keys
                when 'CodeTag'
                  {
                    CodeTag: {
                      prompt: unmake_html_val(b['prompt'], true),
                      choices: b['choices'],
                      correctAnswer: {
                        filename: b_answer['selectedFile'],
                        line: b_answer['lineNumber'],
                      },
                      rubric: revert_rubric(b_rubric),
                    }.compact,
                  }.compact.deep_stringify_keys
                when 'Matching'
                  {
                    Matching: {
                      prompt: unmake_html_val(b['prompt'], true),
                      promptsLabel: unmake_html_val(b['promptsLabel'], true),
                      valuesLabel: unmake_html_val(b['valuesLabel'], true),
                      prompts: unmake_html_vals(b['prompts']),
                      values: unmake_html_vals(b['values']),
                      correctAnswers: b_answer,
                      rubric: revert_rubric(b_rubric),
                    }.compact,
                  }.compact.deep_stringify_keys
                when 'MultipleChoice'
                  {
                    MultipleChoice: {
                      prompt: unmake_html_val(b['prompt'], true),
                      options: unmake_html_vals(b['options']),
                      correctAnswer: b_answer,
                      rubric: revert_rubric(b_rubric),
                    }.compact,
                  }.compact.deep_stringify_keys
                when 'Text'
                  {
                    Text: {
                      prompt: unmake_html_val(b['prompt'], true),
                      correctAnswer:
                        if b_answer['NO_ANS'] || b_answer['text'].blank?
                          nil
                        else
                          b_answer
                        end,
                      rubric: revert_rubric(b_rubric),
                    }.compact,
                  }.compact.deep_stringify_keys
                when 'YesNo'
                  case b['yesLabel']
                  when 'Yes'
                    if b['prompt'] == ''
                      { 'YesNo' => b_answer }
                    else
                      {
                        YesNo: {
                          prompt: unmake_html_val(b['prompt'], true),
                          correctAnswer: b_answer,
                          rubric: revert_rubric(b_rubric),
                        }.compact,
                      }.compact.deep_stringify_keys
                    end
                  else
                    if b['prompt'] == ''
                      { 'TrueFalse' => b_answer }
                    else
                      {
                        TrueFalse: {
                          prompt: unmake_html_val(b['prompt'], true),
                          correctAnswer: b_answer,
                          rubric: revert_rubric(b_rubric),
                        }.compact,
                      }.compact.deep_stringify_keys
                    end
                  end
                else
                  raise 'Bad body item.'
                end
              end,
            }.compact
          end,
        }.compact
      end

      e_reference = info.dig('contents', 'reference')&.map { |r| unmap_reference r }
      e_reference = nil if e_reference.blank?
      {
        policies: info['policies'],
        contents: {
          instructions: unmake_html_val(info.dig('contents', 'instructions'), true),
          questions: questions,
          reference: e_reference,
          examRubric: revert_rubric(rubrics['examRubric']),
        }.compact,
      }.compact.deep_stringify_keys
    end
    # rubocop:enable Metrics/PerceivedComplexity, Metrics/BlockLength, Metrics/BlockNesting

    class << self
      private

      def map_reference(ref)
        return nil if ref.nil?

        {
          type: ref.keys.first,
          path: ref.values.first,
        }
      end

      def unmap_reference(ref)
        return nil if ref.nil?

        { ref['type'] => ref['path'] }
      end

      def make_html_val(str)
        return nil if str.nil?

        {
          type: 'HTML',
          value: str,
        }
      end

      def unmake_html_val(html, nil_if_blank = false)
        return nil if html.nil?
        return nil if html.blank? && nil_if_blank

        html['value']
      end

      def make_html_vals(arr)
        return nil if arr.nil?

        arr.map { |i| make_html_val(i) }
      end

      def unmake_html_vals(arr)
        return nil if arr.nil?

        arr.map { |i| unmake_html_val(i) }
      end

      def convert_presets(preset, parent)
        return nil if preset.nil?

        rp = RubricPreset.new(
          label: preset['label'],
          direction: preset['direction'],
          mercy: preset['mercy'],
        )
        preset['presets']&.map do |p|
          pc = PresetComment.new(
            label: p['label'],
            grader_hint: p['graderHint'],
            student_feedback: p['studentFeedback'],
            points: p['points'],
          )
          rp.association(:preset_comments).add_to_target(pc)
        end

        parent.rubric_preset = rp

        rp
      end

      def revert_presets(preset)
        # N.B. seems to be an identity function; are there any changes to be made?
        return nil if preset.nil?

        {
          label: preset['label'].presence,
          direction: preset['direction'],
          mercy: preset['mercy'],
          presets: preset['presets']&.map do |p|
            {
              label: p['label'].presence,
              graderHint: p['graderHint'],
              studentFeedback: p['studentFeedback'],
              points: p['points'],
            }.compact
          end&.compact,
        }.compact
      end

      def convert_rubric(owners, rubric, parent = nil)
        if rubric.nil?
          ret = Rubric.new(
            **owners,
            type: 'None',
          )
          parent.association(:subsections).add_to_target(ret) if parent.present?
          return ret
        end

        ret = Rubric.new(
          **owners,
          type: rubric['type'].capitalize,
          description: rubric['description'],
          points: rubric['points'],
        )
        parent.association(:subsections).add_to_target(ret) if parent.present?
        if rubric['choices'].is_a? Array
          rubric['choices'].map { |c| convert_rubric(owners, c, ret) }
        else
          convert_presets(rubric['choices'], ret)
        end

        ret
      end

      def revert_rubric(rubric)
        return nil if rubric.nil? || rubric['type'] == 'none'

        {
          type: rubric['type'],
          description: unmake_html_val(rubric['description'], true),
          points: rubric['points'],
          choices:
          if rubric['choices'].is_a? Array
            rubric['choices'].map { |c| revert_rubric(c) }
          else
            revert_presets(rubric['choices'])
          end,
        }.compact
      end

      def ensure_utf8(str, mimetype)
        return str if ApplicationHelper.binary?(mimetype)
        return str if str.is_utf8?
    
        begin
          if str.dup.force_encoding(Encoding::CP1252).valid_encoding?
            str.encode(Encoding::UTF_8, Encoding::CP1252)
          else
            str.encode(Encoding::UTF_8, invalid: :replace, undef: :replace, replace: '?')
          end
        rescue RuntimeError
          str
        end
      end
    end
  end

  # Handles post-extraction tasks for uploaded files
  class Postprocessor
    PROCS = {}
    private_constant :PROCS

    def self.create_handler(name, &block)
      name = name.to_s
      # slight shenanigans to access the private :define_method and :remove_method methods
      # but this avoids the icky "warning: tried to create Proc object without a block"
      PROCS.class.send(:define_method, :temp_method, &block)
      PROCS[name] = PROCS.class.instance_method(:temp_method).bind(PROCS)
      PROCS.class.send(:remove_method, :temp_method)
    end

    def self.alias_handler(new_name, old_name)
      new_name = new_name.to_s
      old_name = old_name.to_s
      PROCS[new_name] = PROCS[old_name]
    end

    def self.process(extracted_path, filename)
      ext = File.extname(filename)[1..]
      PROCS[ext]&.call(extracted_path, filename)
    end

    def self.no_files_found(extracted_path)
      File.open(extracted_path.join('no_files.txt'), 'w') do |f|
        f.write "This is an automated message:\nNo files were found in this submission"
      end
    end

    create_handler :rtf do |extracted_path, f|
      return false unless (File.read(f, 6) == '{\\rtf1' rescue false)

      # Creates the path .../converted/directory/where/file/is/
      # and excludes the filename from the directory structure,
      # since only one output file is created
      converted_path = extracted_path.dirname.join('converted')
      output_path = File.dirname(f).to_s.gsub(extracted_path.to_s, converted_path.to_s)
      Pathname.new(output_path).mkpath
      output, err, status, timed_out = ApplicationHelper.capture3('soffice', '--headless',
                                                                  '--convert-to', 'pdf:writer_pdf_Export',
                                                                  '--outdir', output_path,
                                                                  f,
                                                                  timeout: 30)
      if status.success? && !timed_out
        Audit.log "Successfully processed #{f} to #{output_path}"
        return true
      else
        FileUtils.rm "#{output_path}/#{File.basename(f, '.*')}.pdf", force: true
        Audit.log <<~ERROR
          ================================
          Problem processing #{f}:
          Status: #{status}
          Error: #{err}
          Output: #{output}
          ================================
        ERROR
        return false
      end
    end

    create_handler :doc do |extracted_path, f|
      return false unless (File.read(f, 8) == "\xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1" rescue false)

      # Creates the path .../converted/directory/where/file/is/
      # and excludes the filename from the directory structure,
      # since only one output file is created
      converted_path = extracted_path.dirname.join('converted')
      output_path = File.dirname(f).to_s.gsub(extracted_path.to_s, converted_path.to_s)
      Pathname.new(output_path).mkpath
      output, err, status, timed_out = ApplicationHelper.capture3('soffice', '--headless',
                                                                  '--convert-to', 'pdf:writer_pdf_Export',
                                                                  '--outdir', output_path,
                                                                  f,
                                                                  timeout: 30)
      if status.success? && !timed_out
        Audit.log "Successfully processed #{f} to #{output_path}"
        return true
      else
        FileUtils.rm "#{output_path}/#{File.basename(f, '.*')}.pdf", force: true
        Audit.log <<~ERROR
          ================================
          Problem processing #{f}:
          Status: #{status}
          Error: #{err}
          Output: #{output}
          ================================
        ERROR
        return false
      end
    end

    create_handler :docx do |extracted_path, f|
      return false unless (File.read(f, 4) == "\x50\x4B\x03\x04" rescue false)

      # Creates the path .../converted/directory/where/file/is/
      # and excludes the filename from the directory structure,
      # since only one output file is created
      converted_path = extracted_path.dirname.join('converted')
      output_path = File.dirname(f).to_s.gsub(extracted_path.to_s, converted_path.to_s)
      Pathname.new(output_path).mkpath
      output, err, status, timed_out = ApplicationHelper.capture3('soffice', '--headless',
                                                                  '--convert-to', 'pdf:writer_pdf_Export',
                                                                  '--outdir', output_path,
                                                                  f,
                                                                  timeout: 30)
      if status.success? && !timed_out
        Audit.log "Successfully processed #{f} to #{output_path}"
        return true
      else
        FileUtils.rm "#{output_path}/#{File.basename(f, '.*')}.pdf", force: true
        Audit.log <<~ERROR
          ================================
          Problem processing #{f}:
          Status: #{status}
          Error: #{err}
          Output: #{output}
          ================================
        ERROR
        return false
      end
    end

    create_handler :rkt do |extracted_path, filename|
      embeds_path = extracted_path.dirname.join('embedded')
      # Creates the path .../embedded/path/to/filename.rkt/embed#.png
      # includes the filename in the directory structure deliberately,
      # in case multiple racket files coexist in the same directory
      output_path = filename.to_s.gsub(extracted_path.to_s, embeds_path.to_s)
      Pathname.new(output_path).mkpath
      Headless.ly(display: output_path.hash % Headless::MAX_DISPLAY_NUMBER, autopick: true) do
        output, err, status, timed_out = ApplicationHelper.capture3(
          { 'XDG_RUNTIME_DIR' => nil },
          'racket', Rails.root.join('lib/assets/render-racket.rkt').to_s,
          '-e', output_path,
          '-o', "#{filename}ext",
          f,
          timeout: 30
        )
        if status.success? && !timed_out
          contents = File.read "#{filename}ext"
          File.open(filename, 'w') do |f|
            f.write contents.gsub(Upload.base_upload_dir.to_s, '/files')
          end
          FileUtils.rm "#{filename}ext"
          Audit.log "Successfully processed #{filename} to #{output_path}"
          return true
        else
          FileUtils.rm "#{ffilename}ext", force: true
          Audit.log <<~ERROR
            ================================
            Problem processing #{filename}:
            Status: #{status}
            Error: #{err}
            Output: #{output}
            ================================
          ERROR
          return false
        end
      end
    end
    alias_handler :ss, :rkt
  end
end
