class ExamsController < ApplicationController
  before_action :find_exam

  before_action :require_proctor_reg, only: [:finalize, :proctor]

  def finalize
    @exam.finalize!
    redirect_back fallback_location: exam_path(@exam), notice: 'Exam finalized.'
  end

  def edit
    @page_title = "Edit #{@exam.name}"
    @keepnavbar = true
    render inline: "TODO: exam editor for #{@exam.name}"
  end

end
