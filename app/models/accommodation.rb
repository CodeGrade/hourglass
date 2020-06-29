# frozen_string_literal: true

# Special accommodations for a student's exam.
# Extra time / alternate start times.
class Accommodation < ApplicationRecord
  belongs_to :registration

  validates :registration, presence: true
  validates :percent_time_expansion, numericality: {
    only_integer: true,
    greater_than_or_equal_to: 0,
  }

  delegate :user, to: :registration

  def factor
    (percent_time_expansion.to_f / 100.0) + 1.0
  end
end
