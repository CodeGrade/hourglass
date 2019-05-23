# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)
case Rails.env
when "development"
  prof = User.new(
    username: "professor",
    password: "professor"
  )
  prof.save!

  student = User.new(
    username: "student",
    password: "student"
  )
  student.save!

  exam = Exam.new(
    enabled: true,
    name: "Demo Exam"
  )

  upload = Upload.new(
    user: prof,
    file_name: Rails.root.join("test", "fixtures", "files", "example.yaml"),
    exam: exam
  )
  exam.save!
  upload.save!

  student_reg = Registration.new(
    user: student,
    exam: exam,
    role: 0
  )
  student_reg.save!

  prof_reg = Registration.new(
    user: prof,
    exam: exam,
    role: 1
  )
  prof_reg.save!
end
