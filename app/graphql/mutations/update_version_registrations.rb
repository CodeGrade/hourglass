# frozen_string_literal: true

module Types
  class VersionAssignment < Types::BaseInputObject
    description 'Assignment for students to a version.'
    argument :version_id, ID, required: true, loads: Types::ExamVersionType
    argument :student_ids, [ID], required: true
    def students
      HourglassSchema.objects_from_ids(student_ids, context)
    end
  end
end

module Mutations
  class UpdateVersionRegistrations < BaseMutation
    argument :exam_id, ID, required: true, loads: Types::ExamType
    argument :unassigned, [ID], required: true, description: 'Students to unassign.'
    argument :versions, [Types::VersionAssignment], required: true, description: 'Version assignments to create.'

    field :exam, Types::ExamType, null: false

    def authorized?(exam:, **_args)
      return true if exam.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(exam:, unassigned:, versions:)
      Registration.transaction do
        @cur_regs = exam.registrations.index_by(&:user_id)
        delete_unassigned! exam, lookup_ids(unassigned)
        @cur_regs = exam.registrations.index_by(&:user_id)
        assign_versions! exam, versions
        # NOTE: Because exam.registrations is defined :through .exam_versions, we need this .reload
        # to ensure that its ActiveRecord assocations are updated properly
        exam.reload 
        cache_authorization!(exam, exam.course)
        {
          exam: exam,
        }
      end
    end

    private

    def delete_unassigned!(exam, unassigned)
      unassigned.each do |user|
        student_reg = @cur_regs[user.id]
        next unless student_reg

        if student_reg.started?
          err = "Cannot delete registration for '#{user.display_name}' since they have already started."
          raise GraphQL::ExecutionError, err
        end
        student_reg.destroy!
      end
    end

    def assign_student!(exam, version, student)
      student_reg = @cur_regs[student.id] || Registration.new(user: student)
      return if student_reg.exam_version == version

      err = "Cannot update already started student '#{student.display_name}'"
      raise GraphQL::ExecutionError, err if student_reg.started?

      # If a student hasn't really started, and hasn't really been graded,
      # then should they really be prevented from switching versions?
      if (!student_reg.started? &&
           student_reg.final? &&
           student_reg.snapshots.empty? &&
           student_reg.grading_comments.empty? &&
           student_reg.grading_checks.empty?)
        student_reg.start_time = nil
        student_reg.grading_locks.destroy_all
      end

      err = "Cannot update already-finalized and graded student '#{student.display_name}'"
      finalized = student_reg.final?
      graded = student_reg.grading_locks.where.not(completed_by: nil).any?
      raise GraphQL::ExecutionError, err if (finalized && graded)

      student_reg.exam_version = version
      saved = student_reg.save
      raise GraphQL::ExecutionError, student_reg.errors.full_messages.to_sentence unless saved
    end

    def assign_version!(exam, version, students)
      students.each do |student|
        assign_student!(exam, version, student)
      end
    end

    def assign_versions!(exam, versions)
      versions.each do |item|
        assign_version!(exam, item[:version], item.students)
      end
    end
  end
end
