# frozen_string_literal: true

if Rails.env.development? || Rails.env.test?
  require 'factory_bot_rails'

  namespace :db do
    desc 'Fill database with sample data'
    task populate: :environment do
      include FactoryBot::Syntax::Methods

      Rake::Task['db:reset'].invoke
      make_sample_data
    end
  end
end

def make_sample_data
  admin = create(:admin, username: 'admin')

  cs2500 = create(:course, title: 'CS 2500')
  cs2500lec = create(:section, :lecture, course: cs2500)
  cs2500lab = create(:section, :lab, course: cs2500)
  cs2500midterm = create(:exam, course: cs2500, duration: 5)
  cs2500_v1 = create(:exam_version, :cs2500_v1, exam: cs2500midterm)
  cs2500_v2 = create(:exam_version, :cs2500_v2, exam: cs2500midterm)

  cs2500_room1 = create(:room, exam: cs2500midterm)
  cs2500_room2 = create(:room, exam: cs2500midterm)

  cs2500prof = create(:user, username: 'cs2500prof')
  create(:professor_course_registration, course: cs2500, user: cs2500prof)

  cs2500proctor = create(:user, username: 'cs2500proctor')
  create(:staff_registration, user: cs2500proctor, section: cs2500lec)
  create(:proctor_registration, user: cs2500proctor, room: cs2500_room1)

  cs2500student = create(:user, username: 'cs2500student')
  create(:student_registration, user: cs2500student, section: cs2500lec)
  create(:student_registration, user: cs2500student, section: cs2500lab)

  cs2500student2 = create(:user, username: 'cs2500student2')
  create(:student_registration, user: cs2500student2, section: cs2500lec)
  create(:student_registration, user: cs2500student2, section: cs2500lab)

  cs2500student_no_room = create(:user, username: 'cs2500student_no_room')
  create(:student_registration, user: cs2500student_no_room, section: cs2500lec)

  cs3500 = create(:course, title: 'CS 3500')
  cs3500lec = create(:section, :lecture, course: cs3500)
  cs3500lab = create(:section, :lab, course: cs3500)
  cs3500final = create(:exam, course: cs3500, duration: 15)
  cs3500_v1 = create(:exam_version, :cs3500_v1, exam: cs3500final)

  cs3500_room1 = create(:room, exam: cs3500final)

  cs3500prof = create(:user, username: 'cs3500prof')
  create(:professor_course_registration, course: cs3500, user: cs3500prof)

  cs3500proctor = create(:user, username: 'cs3500proctor')
  create(:staff_registration, user: cs3500proctor, section: cs3500lec)
  create(:proctor_registration, user: cs3500proctor, room: cs3500_room1)

  cs3500student = create(:user, username: 'cs3500student')
  create(:student_registration, user: cs3500student, section: cs3500lec)
  create(:student_registration, user: cs3500student, section: cs3500lab)
end
