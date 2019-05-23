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

  def self.capture3(*cmd, stdin_data: '', binmode: false, timeout: nil, signal: :TERM, **opts)
    Open3.popen3(*cmd, opts) do |i, o, e, t|
      if binmode
        i.binmode
        o.binmode
        e.binmode
      end
      out_reader = Thread.new { o.read }
      err_reader = Thread.new { e.read }
      begin
        i.write stdin_data
      rescue Errno::EPIPE
      end
      i.close
      timed_out = false
      if timeout
        if !t.join(timeout)
          timed_out = true
          Process.kill(signal, t.pid)
          # t.value below will implicitly .wait on the process
        end
      end
      [out_reader.value, err_reader.value, t.value, timed_out]
    end
  end
end
