module ApplicationHelper
  def flash_class(level)
    {
      "notice" => "alert-info",
      "success" => "alert-success",
      "error" => "alert-danger",
      "alert" => "alert-danger"
    }[level]
  end
end
