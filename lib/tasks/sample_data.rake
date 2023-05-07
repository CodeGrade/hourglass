# frozen_string_literal: true

namespace :db do
  desc 'Fill database with sample data'
  task populate: :environment do
    require 'factory_bot_rails'
    include FactoryBot::Syntax::Methods

    if Rails.env.development? || ENV["STRESSTESTING"]
      make_sample_data
    end
  end
end

NUM_SIM_USERS = 1000

def create_simulation_users(lecture:, lab:, room:, exam_version:)
  puts "Creating simulation users..."
  (0..NUM_SIM_USERS).each do |i|
    student = create(:user, username: "stresstest#{i}")
    create(:student_registration, user: student, section: lecture)
    create(:student_registration, user: student, section: lab)
    reg = create(:registration, user: student, room: room, exam_version: exam_version)
    create(:snapshot, registration: reg)
  end
end

def make_sample_data
  ActiveRecord::Base.transaction do
    puts "Loading sample data"
    create(:admin, username: 'admin')
    make_cs2500
    make_cs3500
  end
end

def make_cs2500
  puts "Creating CS2500..."
  fall2021 = create(:term, year: 2021, semester: Term.semesters['fall'])
  cs2500 = create(:course, title: 'CS 2500', term: fall2021)
  cs2500lec = create(:section, :lecture, course: cs2500)
  cs2500lab = create(:section, :lab, course: cs2500)
  cs2500midterm = create(:exam, name: 'CS2500 Midterm', course: cs2500, duration: 5.minutes)
  create(:exam_announcement, exam: cs2500midterm)

  cs2500_v1 = create(:exam_version, :cs2500_v1, exam: cs2500midterm)
  create(:version_announcement, exam_version: cs2500_v1)

  cs2500_v2 = create(:exam_version, :cs2500_v2, exam: cs2500midterm)
  create(:version_announcement, exam_version: cs2500_v2)

  cs2500_room1 = create(:room, exam: cs2500midterm)
  create(:room_announcement, room: cs2500_room1)

  cs2500_room2 = create(:room, exam: cs2500midterm)
  create(:room_announcement, room: cs2500_room2)

  cs2500prof = create(:user, username: 'cs2500prof')
  cs2500prof_reg = create(:professor_course_registration, course: cs2500, user: cs2500prof)

  cs2500proctor = create(:user, username: 'cs2500proctor')
  create(:staff_registration, user: cs2500proctor, section: cs2500lec)
  create(:proctor_registration, user: cs2500proctor, exam: cs2500midterm, room: cs2500_room1)

  cs2500student = create(:user, username: 'cs2500student')
  create(:student_registration, user: cs2500student, section: cs2500lec)
  create(:student_registration, user: cs2500student, section: cs2500lab)
  cs2500student_reg = create(:registration, user: cs2500student, room: cs2500_room1, exam_version: cs2500_v1)
  create(:snapshot, registration: cs2500student_reg)

  if ENV["STRESSTESTING"]
    create_simulation_users(lecture: cs2500lec, lab: cs2500lab, room: cs2500_room1, exam_version: cs2500_v1)
  end

  create(:student_question, registration: cs2500student_reg)
  create(:message, sender: cs2500prof, registration: cs2500student_reg)

  cs2500student2 = create(:user, username: 'cs2500student2')
  create(:student_registration, user: cs2500student2, section: cs2500lec)
  create(:student_registration, user: cs2500student2, section: cs2500lab)
  create(:registration, user: cs2500student2, room: cs2500_room1, exam_version: cs2500_v2)

  cs2500student_no_room = create(:user, username: 'cs2500student_no_room')
  create(:student_registration, user: cs2500student_no_room, section: cs2500lec)
end

def make_cs3500
  puts "Creating CS3500..."
  spring2022 = create(:term, year: 2022, semester: Term.semesters['spring'])
  cs3500 = create(:course, title: 'CS 3500', term: spring2022)
  cs3500lec = create(:section, :lecture, course: cs3500)
  cs3500lab = create(:section, :lab, course: cs3500)
  cs3500final = create(:exam, name: 'CS3500 Final', course: cs3500, duration: 15.minutes)
  create(:exam_announcement, exam: cs3500final)

  cs3500_v1 = create(:exam_version, :cs3500_v1, exam: cs3500final)
  create(:version_announcement, exam_version: cs3500_v1)

  cs3500_room1 = create(:room, exam: cs3500final)
  create(:room_announcement, room: cs3500_room1)

  cs3500prof = create(:user, username: 'cs3500prof')
  create(:professor_course_registration, course: cs3500, user: cs3500prof)

  cs3500proctor = create(:user, username: 'cs3500proctor')
  create(:staff_registration, user: cs3500proctor, section: cs3500lec)
  create(:proctor_registration, user: cs3500proctor, exam: cs3500final, room: cs3500_room1)

  cs3500student = create(:user, username: 'cs3500student')
  create(:student_registration, user: cs3500student, section: cs3500lec)
  create(:student_registration, user: cs3500student, section: cs3500lab)
  cs3500student_reg = create(:registration, user: cs3500student, room: cs3500_room1, exam_version: cs3500_v1)
  create(:accommodation, registration: cs3500student_reg)
  create(:snapshot, registration: cs3500student_reg)
end
