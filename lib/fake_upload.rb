class FakeUpload
  attr_reader :path

  def initialize(path, content = nil)
    @path = path
    @name = File.basename(path)
    if content
      @content = content
      @size = content.length
    end
  end

  def read
    @content || File.read(@path)
  end

  def original_filename
    @name
  end

  def content_type
    'application/octet-stream'
  end

  def size
    @size || File.size(@path)
  end

  def rewind
  end
end
