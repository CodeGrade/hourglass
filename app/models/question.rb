# frozen_string_literal: true

# Questions from students during an exam.
class Question < ApplicationRecord
  belongs_to :registration

  delegate :exam, to: :registration
  delegate :user, to: :registration
  delegate :proctors_and_professors, to: :exam

  validates :registration, presence: true
  validates :body, presence: true, length: { maximum: 2000 }

  def visible_to?(check_user)
    proctors_and_professors.or(User.where(id: user.id)).exists? check_user.id
  end
end
