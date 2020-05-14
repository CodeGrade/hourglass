# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)
case Rails.env
when "development"
  admin = User.new(
    username: "admin",
    password: "admin",
    role: :admin
  )
  admin.save!

  prof = User.new(
    username: "professor",
    password: "professor",
    role: :professor
  )
  prof.save!

  m1 = Exam.new(
    enabled: true,
    name: 'Midterm One',
    duration: 5,
    start_time: DateTime.now,
    end_time: DateTime.now + 3.months
  )

  m1_zip = Rails.root.join("test", "fixtures", "files", "midterm-one.zip")
  ArchiveUtils.create_zip m1_zip, Dir.glob(Rails.root.join("test", "fixtures", "files", "midterm-one", "**"))
  m1_upload = Upload.new(
    user: prof,
    file_name: m1_zip,
    exam: m1
  )
  m1_upload.upload_data = FakeUpload.new(m1_upload.file_name)

  m1.save!
  m1_upload.save!
  FileUtils.rm m1_zip

  m2 = Exam.new(
    enabled: true,
    name: 'Midterm Two',
    duration: 120,
    start_time: DateTime.now + 1.hour,
    end_time: DateTime.now + 3.days
  )

  m2_zip = Rails.root.join("test", "fixtures", "files", "midterm-two.zip")
  ArchiveUtils.create_zip m2_zip, Dir.glob(Rails.root.join("test", "fixtures", "files", "midterm-two", "**"))
  m2_upload = Upload.new(
    user: prof,
    file_name: m2_zip,
    exam: m2
  )
  m2_upload.upload_data = FakeUpload.new(m2_upload.file_name)

  m2.save!
  m2_upload.save!
  FileUtils.rm m2_zip

  %w[ben rebecca matthias amit].each do |student|
    user = User.new(
      username: student,
      password: student,
      role: :unprivileged
    )
    user.save!
  end

  which_room = true
  [m1, m2].each do |exam|
    r1 = Room.new(
      exam: exam,
      name: 'Room One'
    )
    r2 = Room.new(
      exam: exam,
      name: 'Room Two'
    )
    prof_reg = Registration.new(
      user: prof,
      exam: exam,
      role: :professor,
      room: r1
    )
    prof_reg.save!
    ExamMessage.create(
      exam: exam,
      sender: prof,
      body: "Welcome all to #{exam.name}!"
    )
    %w[ben rebecca matthias amit].each do |student|
      user = User.find_by(username: student)
      reg = Registration.new(
        user: user,
        exam: exam,
        role: :student,
        room: which_room ? r1 : r2
      )
      reg.save!

      ExamMessage.create(
        exam: exam,
        sender: prof,
        recipient: user,
        body: "Hello #{student} (in #{exam.name}), nice work."
      )

      which_room = !which_room
    end
  end
end
