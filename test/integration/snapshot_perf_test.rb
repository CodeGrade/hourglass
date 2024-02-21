# frozen_string_literal: true

require 'test_helper'

class ExamVersionAdministrationTest < ActionDispatch::IntegrationTest
  NUM_SNAPSHOTS = 200_000
  NUM_REGISTRATIONS = 400
  # test 'snapshots are fast enough' do
  def snapshot_speed
    old_sync = $stdout.sync
    old_logger = ActiveRecord::Base.logger
    ActiveRecord::Base.logger = nil
    begin
      $stdout.sync = true
      exam = create(:exam)
      create(:professor_course_registration, course: exam.course)
      ev = create(:exam_version, :cs3500_v1, exam: exam)
      course = exam.course
      3.times { create(:section, course: course) }
      sections = course.sections
      NUM_REGISTRATIONS.times do |i|
        s = create(:student_registration, section: sections[i % sections.count], user: create(:user))
        create(:registration, user: s.user, exam_version: ev)
      end
      exam.reload
      8.times do |i|
        create(:staff_registration, section: sections[i % sections.count], user: create(:user))
      end

      registrations = exam.registrations.to_a
      start_time = DateTime.now
      $stdout.print "Starting #{NUM_SNAPSHOTS} snapshots"
      timestamps = [start_time]
      long_answers = JSON.parse(Rails.root.join('test/fixtures/files/long-snapshot.json').read)
      default_answers = ev.default_answers
      NUM_SNAPSHOTS.times do |i|
        reg = registrations[i % registrations.count]
        if ((i / (5 * NUM_REGISTRATIONS)) % 2).zero?
          reg.save_answers(long_answers)
        else
          reg.save_answers(default_answers)
        end
        $stdout.print '.' if (i % 100).zero?
        next unless i.positive? && (i % 1000).zero?

        $stdout.print '|' if (i % 1000).zero?
        timestamps << DateTime.now
        cur = (timestamps[-1] - timestamps[-2]) / 1000.0
        total = (timestamps[-1] - timestamps[0]) / i.to_f
        $stdout.print "Cur #{cur}, total #{total}"
      end
      puts ''
      end_time = DateTime.now
      exam.reload
      puts "Average time #{(end_time - start_time) / NUM_SNAPSHOTS.to_f}"
      assert_equal NUM_SNAPSHOTS, Snapshot.where(registration: exam.registrations).count
      assert (end_time - start_time) < 1.minute
    ensure
      $stdout.sync = old_sync
      ActiveRecord::Base.logger = old_logger
    end
  end
end
