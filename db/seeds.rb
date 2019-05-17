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
    email: "prof@example.com",
    password: "professor"
  )
  prof.save!

  student = User.new(
    username: "student",
    email: "student@example.com",
    password: "student"
  )
  student.save!

  exam = Exam.new(
    secret_key: "secret",
    enabled: true,
    name: "CS 2500 Midterm 1",
  )

  upload = Upload.new(
    user: prof,
    file_name: "exam1.yaml",
    secret_key: "secret",
    exam: exam
  )
  exam.save!
  upload.save!
end
