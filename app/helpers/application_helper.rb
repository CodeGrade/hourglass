module ApplicationHelper
  def flash_class
    { notice: 'info',
      success: 'success',
      error: 'danger',
      alert: 'danger'
    }
  end
end
