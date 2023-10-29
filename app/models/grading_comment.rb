# frozen_string_literal: true

# A grading comment that contains a message for the student.
class GradingComment < ApplicationRecord
  belongs_to :creator, class_name: 'User'
  belongs_to :registration
  belongs_to :question
  belongs_to :part
  belongs_to :body_item

  delegate :exam_version, to: :registration
  belongs_to :preset_comment, optional: true

  validates :message, presence: true

  # negative - deduction
  # positive - bonus
  validates :points, presence: true, numericality: true

  delegate :user, to: :registration
  delegate :course, to: :exam_version

  validate :valid_qpb

  def valid_qpb
    if (question && question.exam_version != exam_version) ||
       (part && part.question != question) ||
       (body_item && body_item.part != part)

      errors.add(:base, 'Question, part, and body item must be self-consistent for the exam version.')
    end
  end

  # This method should be called only by registration_type, to
  # preemptively cache the registration's user without having to
  # load this object's registration field, to in turn get the user
  # to check in visible_to? below.
  def cache_user!(reg_user)
    @user = reg_user
  end

  def visible_to?(check_user, role_for_exam, _role_for_course)
    ((@user || user) == check_user) ||
      (role_for_exam >= Exam.roles[:staff]) ||
      course.all_staff.exists?(check_user.id)
  end
end
