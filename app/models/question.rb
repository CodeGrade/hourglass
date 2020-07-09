# frozen_string_literal: true

# Questions from students during an exam.
class Question < ApplicationRecord
  belongs_to :registration

  delegate :exam, to: :registration

  validates :registration, presence: true
  validates :body, presence: true, length: { maximum: 2000 }
end
