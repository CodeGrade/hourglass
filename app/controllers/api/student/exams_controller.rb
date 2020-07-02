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

      def questions
        render json: {
          questions: all_questions,
        }
      end

      def question
        q_params = params.require(:question).permit(:body)
        q = Question.new body: q_params[:body], exam: @exam, sender: current_user
        render json: {
          success: q.save,
          messages: q.errors.full_messages,
        }
      end

      def messages
        render json: {
          messages: messages_to_send,
        }
      end

      private

      def require_current_user_unique_session
        require_current_user
      rescue DoubleLoginException => e
        registration = Registration.find_by(
          user_id: e.user.id,
          exam_id: params[:exam_id]
        )
        if registration
          Anomaly.create(registration: registration, reason: e.message)
        end
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
        if @registration.start_time.nil?
          @registration.update(start_time: DateTime.now)
        else
          # TODO: post-anomaly log back in..
        end
        answers = @registration.current_answers
        version = @registration.exam_version
        {
          type: 'CONTENTS',
          exam: {
            questions: version.contents['questions'],
            reference: version.contents['reference'],
            instructions: version.contents['instructions'],
            files: version.files,
          },
          time: {
            began: @registration.accommodated_start_time,
            ends: @registration.accommodated_end_time,
          },
          answers: answers,
          messages: {
            personal: @registration.private_messages.map(&:serialize),
            room: @registration.room&.room_announcements&.map(&:serialize) || [],
            version: version.version_announcements.map(&:serialize),
            exam: @exam.exam_announcements.map(&:serialize),
          },
          questions: all_questions,
        }
      end

      def messages_to_send
        last_message_ids = params.require(:lastMessageIds).permit(:personal, :room, :version, :exam)
        version = @registration.exam_version
        {
          personal: after(@registration.private_messages, last_message_ids[:personal]).map(&:serialize),
          room: after(@registration.room&.room_announcements, last_message_ids[:room]).map(&:serialize),
          version: after(version.version_announcements, last_message_ids[:version]).map(&:serialize),
          exam: after(@exam.exam_announcements, last_message_ids[:exam]).map(&:serialize),
        }
      end

      def snapshot
        answers = answer_params
        saved = @registration.save_answers(answers)
        {
          lockout: !saved,
          messages: messages_to_send,
        }
      end

      def after(arr, last_id)
        return [] unless arr

        arr.where('id > ?', last_id)
      end

      def check_over
        return unless @registration.over?

        head :forbidden
      end

      def check_anomaly
        return unless @registration.anomalous?

        head :forbidden
      end

      def check_final
        return unless @registration.final?

        head :locked
      end

      # Returns all of the questions the current user has asked for this exam.
      def all_questions
        qs = @registration.my_questions.order(created_at: :desc)
        qs.map(&:serialize)
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
