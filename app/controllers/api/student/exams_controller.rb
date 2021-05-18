# frozen_string_literal: true

module Api
  module Student
    # Exam-taking functionality.
    class ExamsController < StudentController
      prepend_before_action :require_current_user_unique_session
      before_action :find_exam_and_course

      before_action :require_student_reg
      before_action :check_over
      before_action :check_final
      before_action :check_anomaly, only: [:take]

      def take
        case params[:task]
        when 'start' then render json: start_exam!
        when 'snapshot' then render json: snapshot
        when 'submit' then render json: submit
        when 'anomaly' then render json: anomaly
        end
      end

      private

      def require_current_user_unique_session
        require_current_user
      rescue DoubleLoginException => e
        registration = Registration.find_by(
          user_id: e.user.id,
          exam_id: params[:exam_id],
        )
        Anomaly.create(registration: registration, reason: e.message) if registration
        render json: { lockout: true, reason: e.message }
      end

      def anomaly
        if @registration.user != current_user
          render json: { created: false }
          return
        end
        @anomaly = Anomaly.new(params.require(:anomaly).permit(:reason))
        @anomaly.registration = @registration
        saved = @anomaly.save
        {
          created: saved,
        }
      end

      def submit
        answers = answer_params
        saved = @registration.save_answers(answers)
        @registration.update(end_time: DateTime.now)
        { lockout: !saved }
      end

      def start_exam!
        @registration.update(start_time: DateTime.now) if @registration.start_time.nil?

        answers = @registration.current_answers
        version = @registration.exam_version
        {
          type: 'CONTENTS',
          exam: {
            questions: version.db_questions.as_json(format: :graphql), # TODO: RUBRICS, ANSWERS SHOULD NOT BE INCLUDED HERE
            references: version.db_references.as_json(format: :graphql),
            instructions: {
              type: 'HTML',
              value: version.instructions,
            },
            files: version.files,
          },
          time: {
            serverNow: DateTime.now,
            began: @registration.accommodated_start_time,
            ends: @registration.accommodated_end_time,
            start: @registration.start_time,
            stop: @registration.effective_end_time,
          },
          answers: answers,
        }
      end

      def snapshot
        answers = answer_params
        saved = @registration.save_answers(answers)
        {
          lockout: !saved,
        }
      end

      def check_over
        return unless @registration.over?

        last_snapshot = @registration.snapshots.last
        if last_snapshot
          render json: {
            finished: true,
            lastSaved: last_snapshot.created_at,
            message: 'Your exam is over.',
          }
        else
          render json: {
            finished: true,
            message: 'Your exam is over.',
          }
        end
      end

      def check_anomaly
        return unless @registration.anomalous?

        head :forbidden
      end

      def check_final
        return unless @registration.final?

        head :locked
      end

      def answer_params
        {
          answers: params.require(:answers).require(:answers).map do |qans|
            qans.map do |pans|
              pans.map do |bans|
                if bans.is_a? ActionController::Parameters
                  bans.permit!.to_h
                else
                  bans
                end
              end
            end
          end,
          scratch: params[:answers][:scratch],
        }.stringify_keys
      end
    end
  end
end
