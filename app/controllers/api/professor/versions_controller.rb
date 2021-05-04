# frozen_string_literal: true

module Api
  module Professor
    # API Controller for creating and exporting exam versions
    class VersionsController < ProfessorController
      before_action :find_version, only: [:export_file, :export_archive]
      before_action :find_exam_and_course

      before_action :require_prof_reg

      def import
        uploaded_file = params.require(:upload)
        n = @exam.exam_versions.length + 1
        default_name = "#{@exam.name} Version #{n}"
        upload = Upload.new(uploaded_file)
        @version = upload.build_exam_version(default_name)
        @version.exam = @exam
        @version.save!

        render json: {
          id: HourglassSchema.id_from_object(@version, Types::ExamVersionType, {}),
        }, status: :created
      rescue JSON::Schema::ValidationError, RuntimeError => e
        render json: {
          message: e.to_s,
        }, status: :not_acceptable
      end

      def export_file
        fname = "#{@version.name.gsub(/ /, '-')}.json"
        send_data @version.export_json(include_files: true), type: :json, disposition: 'attachment', filename: fname
      end

      def export_archive
        fname = "#{@version.name.gsub(/ /, '-')}.zip"
        ArchiveUtils.mktmpdir do |path|
          pathname = Pathname.new(path)
          zip_path = pathname.join(fname)
          contents_path = pathname.join('exam-contents')
          FileUtils.mkdir_p contents_path
          @version.export_all(contents_path)
          ArchiveUtils.create_zip zip_path, Dir.glob(contents_path.join('**'))
          send_data File.read(zip_path), type: :zip, disposition: 'attachment', filename: fname
        end
      end
    end
  end
end
