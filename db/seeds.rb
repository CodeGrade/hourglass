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

  student = User.new(
    username: "student",
    password: "student",
    role: :unprivileged
  )
  student.save!

  exam = Exam.new(
    enabled: true,
    name: "Demo Exam"
  )

  upload = Upload.new(
    user: prof,
    file_name: Rails.root.join("test", "fixtures", "files", "demo-exam.zip"),
    exam: exam
  )
  upload.upload_data = FakeUpload.new(upload.file_name)

  exam.save!
  upload.save!

  student_reg = Registration.new(
    user: student,
    exam: exam,
    role: :student
  )
  student_reg.save!

  prof_reg = Registration.new(
    user: prof,
    exam: exam,
    role: :professor
  )
  prof_reg.save!
end
