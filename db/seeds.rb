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

  exam = Exam.new(
    enabled: true,
    name: "Demo Exam"
  )

  zipfile = Rails.root.join("test", "fixtures", "files", "demo-exam.zip")
  ArchiveUtils.create_zip zipfile, Dir.glob(Rails.root.join("test", "fixtures", "files", "demo-exam", "**"))
  upload = Upload.new(
    user: prof,
    file_name: zipfile,
    exam: exam
  )
  upload.upload_data = FakeUpload.new(upload.file_name)

  exam.save!
  upload.save!
  FileUtils.rm zipfile

  room_one = Room.new(
    exam: exam,
    name: "Room One"
  )
  room_two = Room.new(
    exam: exam,
    name: "Room Two"
  )

  prof_reg = Registration.new(
    user: prof,
    exam: exam,
    role: :professor,
    room: room_one
  )
  prof_reg.save!

  which_room = true
  %w(ben rebecca matthias amit).each do |student|
    user = User.new(
      username: student,
      password: student,
      role: :unprivileged
    )
    user.save!
    student_reg = Registration.new(
      user: user,
      exam: exam,
      role: :student,
      room: which_room ? room_one : room_two
    )
    student_reg.save!

    which_room = !which_room
  end
end
