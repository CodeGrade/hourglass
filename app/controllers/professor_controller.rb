class ProfessorController < ApplicationController
  before_action :require_current_user
  before_action :require_admin_or_prof
end
