# frozen_string_literal: true

module Api
  module Professor
    class VersionsController < ProfessorController
      before_action :find_version, only: [:show, :destroy, :export_file, :export_archive]
      before_action :find_exam_and_course

      before_action :require_prof_reg

      before_action :no_started_regs, only: [:destroy]

      def show
        render json: @version.serialize
      end

      def import
        uploaded_file = params.require(:upload)
        n = @exam.exam_versions.length + 1
        upload = Upload.new(uploaded_file)
        @version = ExamVersion.create(
          exam: @exam,
          name: "#{@exam.name} Version #{n}",
          files: upload.files,
          info: upload.info
        )
        @version.save!
        render json: {
          id: @version.id,
        }, status: :created
      end

      def destroy
        @version.destroy!
        render json: {}
      end

      def export_file
        fname = @version.name.gsub(/ /, '-') + '.json'
        send_data @version.export_json, type: :json, disposition: 'attachment', filename: fname
      end

      def export_archive
        fname = @version.name.gsub(/ /, '-') + '.zip'
        Dir.mktmpdir do |path|
          pathname = Pathname.new(path)
          zip_path = pathname.join(fname)
          contents_path = pathname.join('exam-contents')
          FileUtils.mkdir_p contents_path
          @version.export_all(contents_path)
          ArchiveUtils.create_zip zip_path, Dir.glob(contents_path.join('**'))
          send_data File.read(zip_path), type: :zip, disposition: 'attachment', filename: fname
        end
      end

      private

      def no_started_regs
        head :conflict if @version.any_started?
      end
    end
  end
end

