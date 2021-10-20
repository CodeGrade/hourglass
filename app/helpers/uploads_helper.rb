# frozen_string_literal: true

require 'fileutils'
require 'audit'
require 'open3'
# require 'headless'

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
      )

      avail_references = {
        "exam" => false,
        "question" => false,
        "part" => false,
      }

      contents['reference']&.each_with_index do |ref, refnum|
        new_ref = convert_reference(ref, refnum, version)
        next unless new_ref
        version.association(:db_references).add_to_target(new_ref)
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
        question.exam_version = version
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
            new_ref = convert_reference(ref, refnum, version)
            next unless new_ref
            part.association(:references).add_to_target(new_ref)
            avail_references["part"] = true
          end

          pinfo['body'].each_with_index do |binfo, bnum|
            item = nil
            b_rubric = nil
            case binfo
            when String
              item = BodyItem.new(info: convert_html(binfo))
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

    # rubocop:enable Metrics/PerceivedComplexity, Metrics/BlockLength, Metrics/BlockNesting

    class << self
      private

      def convert_html(val)
        {
          type: 'HTML',
          value: val,
        }
      end

      def convert_presets(preset, parent)
        return nil if preset.nil?

        rp = RubricPreset.new(
          label: preset['label'],
          direction: preset['direction'],
          mercy: preset['mercy'],
        )
        preset['presets']&.each_with_index&.map do |p, pindex|
          pc = PresetComment.new(
            order: pindex,
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

      def convert_rubric(owners, rubric, ancs = [], order = nil)
        if rubric.nil?
          ret = Rubric.new(
            **owners,
            order: order,
            type: 'None',
          )
          ancs.each_with_index do |a, depth| 
            a.association(:descendant_links).add_to_target(RubricTreePath.new(ancestor: a, descendant: ret, path_length: depth + 1)) 
          end
          return ret
        end

        ret = Rubric.new(
          **owners,
          type: rubric['type'].capitalize,
          description: rubric['description'],
          points: rubric['points'],
          order: order,
        )
        ancs.each_with_index do |a, depth| 
          a.association(:descendant_links).add_to_target(RubricTreePath.new(ancestor: a, descendant: ret, path_length: depth + 1)) 
        end
        if rubric['choices'].is_a? Array
          rubric['choices'].each_with_index do |c, cindex|
            convert_rubric(owners, c, [ret, *ancs], cindex)
          end
        else
          convert_presets(rubric['choices'], ret)
        end

        ret
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

    # TODO: setup xvfb and racket handler
    # create_handler :rkt do |extracted_path, filename|
    #   embeds_path = extracted_path.dirname.join('embedded')
    #   # Creates the path .../embedded/path/to/filename.rkt/embed#.png
    #   # includes the filename in the directory structure deliberately,
    #   # in case multiple racket files coexist in the same directory
    #   output_path = filename.to_s.gsub(extracted_path.to_s, embeds_path.to_s)
    #   Pathname.new(output_path).mkpath
    #   Headless.ly(display: output_path.hash % Headless::MAX_DISPLAY_NUMBER, autopick: true) do
    #     output, err, status, timed_out = ApplicationHelper.capture3(
    #       { 'XDG_RUNTIME_DIR' => nil },
    #       'racket', Rails.root.join('lib/assets/render-racket.rkt').to_s,
    #       '-e', output_path,
    #       '-o', "#{filename}ext",
    #       filename,
    #       timeout: 30
    #     )
    #     if status.success? && !timed_out
    #       contents = File.read "#{filename}ext"
    #       File.open(filename, 'w') do |f|
    #         f.write contents.gsub(Upload.base_upload_dir.to_s, '/files')
    #       end
    #       FileUtils.rm "#{filename}ext"
    #       Audit.log "Successfully processed #{filename} to #{output_path}"
    #       return true
    #     else
    #       FileUtils.rm "#{filename}ext", force: true
    #       Audit.log <<~ERROR
    #         ================================
    #         Problem processing #{filename}:
    #         Status: #{status}
    #         Error: #{err}
    #         Output: #{output}
    #         ================================
    #       ERROR
    #       return false
    #     end
    #   end
    # end
    # alias_handler :ss, :rkt
  end
end
