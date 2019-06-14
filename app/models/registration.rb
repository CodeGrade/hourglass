class Registration < ApplicationRecord
  belongs_to :user
  belongs_to :exam

  enum role: [:student, :proctor, :professor, :admin]
end
