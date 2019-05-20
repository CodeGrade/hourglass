module ApplicationHelper
  def flash_class
    { notice: 'info',
      success: 'success',
      error: 'danger',
      alert: 'danger'
    }
  end

  def mime_type(full_path)
    case File.extname(full_path).downcase
    when ".java"
      "text/x-java"
    when ".class"
      "application/java-vm"
    when ".js"
      "text/javascript"
    when ".arr"
      "pyret"
    when ".rkt", ".ss"
      "scheme"
    when ".ml", ".mli"
      "mllike"
    when ".md"
      "text/markdown"
    when ".mly"
      "text/x-ebnf"
    when ".c", ".h"
      "text/x-csrc"
    when ".cpp", ".c++"
      "text/x-c++src"
    when ".cs"
      "text/x-csharp"
    when ".py"
      "text/x-python"
    when ".gif"
      "image/gif"
    when ".jpg", ".jpeg"
      "image/jpeg"
    when ".png"
      "image/png"
    when ".tiff"
      "image/tiff"
    when ".webp"
      "image/webp"
    when ".yaml"
      "text/x-yaml"
    when ".jar"
      "jar"
    when ".zip"
      "zip"
    when ".7z"
      "application/x-7z-compressed"
    when ".svg", ".xml"
      "application/xml"
    when ".html"
      "text/html"
    when ".css"
      "text/css"
    when ".tap", ".txt", ".text"
      "text/plain"
    when ".pdf"
      "application/pdf"
    when ".rtf"
      "application/rtf"
    when ".mp3"
      "audio/mpeg"
    else
      case File.basename(full_path.to_s).downcase
      when "makefile"
        "text/x-makefile"
      when "readme"
        "text/plain"
      else
        "text/unknown"
      end
    end
  end
end
