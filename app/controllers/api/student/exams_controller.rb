# frozen_string_literal: true

module Api
  module Student
    # Exam-taking functionality.
    class ExamsController < StudentController
      prepend_before_action :require_current_user_unique_session
      before_action :find_exam_and_course
      before_action :require_exam_enabled

      before_action :require_student_reg
      before_action :check_anomaly, only: [:take]
      before_action :check_final, only: [:take]

      def show
        render json: {
          railsExam: {
            id: @exam.id,
            name: @exam.name,
            policies: @registration.exam_version.policies
          },
          railsRegistration: {
            id: @registration.id,
            anomalous: @registration.anomalous?
          },
          railsCourse: {
            id: @course.id
          },
          final: @registration.final?
        }
      end

      def take
        case params[:task]
        when 'start' then render json: exam_contents
        when 'snapshot' then render json: snapshot
        when 'submit' then render json: submit
        when 'anomaly' then render json: anomaly
        when 'question' then render json: question
        end
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

      def question
        q_params = params.require(:question).permit(:body)
        q = Question.new body: q_params[:body], exam: @exam, sender: current_user
        {
          success: q.save,
          messages: q.errors.full_messages
        }
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
          created: saved
        }
      end

      def submit
        answers = answer_params
        saved = @registration.save_answers(answers)
        @registration.update(end_time: DateTime.now)
        { lockout: !saved }
      end

      def exam_contents
        answers = @registration.current_answers
        version = @registration.exam_version
        {
          type: 'CONTENTS',
          exam: {
            questions: version.contents['questions'],
            reference: version.contents['reference'],
            instructions: version.contents['instructions'],
            files: version.files
          },
          answers: answers,
          messages: messages,
          questions: questions
        }
      end

      def snapshot
        last_message_id = params.require(:lastMessageId)
        answers = answer_params
        saved = @registration.save_answers(answers)
        {
          lockout: !saved,
          messages: messages_after(last_message_id)
        }
      end

      def check_anomaly
        return unless @registration.anomalous?

        head :forbidden
      end

      def check_final
        return unless @registration.final?

        head :locked
      end

      def messages_after(last_message_id)
        # TODO
        []
        # msgs = @registration
        #        .all_messages_for(current_user)
        #        .where('id > ?', last_message_id)
        #        .order(:created_at)
        # msgs.map(&:serialize)
      end

      # Returns all of the questions the current user has asked for this exam.
      def questions
        qs = @registration.my_questions.order(created_at: :desc)
        qs.map(&:serialize)
      end

      # Returns the announcements and messages for the current registration.
      def messages
        msgs = @registration.all_messages_for(current_user).sort_by(&:id)
        msgs.map(&:serialize)
      end

      private
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
          scratch: params[:answers][:scratch]  
        }.stringify_keys
      end
    end
  end
end
