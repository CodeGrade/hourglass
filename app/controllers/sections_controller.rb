class SectionsController < ApplicationController
  before_action :require_current_user

  before_action :find_course
  before_action :find_section
  before_action :require_prof_reg

  def sync
    render json: { TODO: true }
  end
end
