# frozen_string_literal: true

require 'test_helper'

class GradingCommentTest < ActiveSupport::TestCase
  def setup
    @course = create(:course)
    @section = create(:section, course: @course)
    @exam = create(:exam, course: @course)
    @version = create(:exam_version, exam: @exam)
    @reg = create(:registration, exam_version: @version)
    @reg2 = create(:registration, exam_version: @version)
    @grader = create(:user)
    @staff_reg = create(:staff_registration, user: @grader, section: @section)
    @comment = create(:grading_comment, creator: @grader, registration: @reg)
  end

  test 'grading comment factory' do
    assert @comment.valid?
  end

  test 'grading comment with empty message is invalid' do
    assert_not build(:grading_comment, registration: @reg2, message: '').valid?
  end

  test 'grading comment with zero points is valid' do
    assert build(:grading_comment, registration: @reg2, points: 0).valid?
  end

  test 'grading comment with deduction is valid' do
    assert build(:grading_comment, registration: @reg2, points: -5).valid?
  end

  test 'grading comment with bonus is valid' do
    assert build(:grading_comment, registration: @reg2, points: 5).valid?
  end

  def create_comment(reg, question, part, bodyitem, preset)
    GradingComment.create!(
      creator: @grader,
      registration: reg,
      question: question,
      part: part,
      body_item: bodyitem,
      preset_comment: preset,
      points: preset.points,
      message: preset.grader_hint,
    )
  end

  def setup_ec_exam
    @version = create(:exam_version, upload: create(:upload, :extra_credit))
    @exam = @version.exam
    @reg = create(:registration, exam_version: @version)
    @qp_pairs = @version.qp_pairs
    @total = @qp_pairs.sum { |qp| qp[:part].points }
    extra, normal = @qp_pairs.partition do |qp|
      qp[:question].extra_credit || qp[:part].extra_credit
    end
    @extra_points = extra.sum { |qp| qp[:part].points }
    @normal_points = normal.sum { |qp| qp[:part].points }
    # Confirm exam version is right
    assert_equal @normal_points, @version.total_points
    assert_equal @total, @version.total_points(include_extra_credit: true)
  end

  test 'score with extra credit is accurate: before grading' do
    setup_ec_exam
    assert_equal @total, @reg.current_score
  end

  test 'score with extra credit is accurate: fail all questions' do
    setup_ec_exam
    @qp_pairs.each do |qp|
      qp[:part].body_items.each do |bi|
        bi.preset_comments.where(points: 0).find_each do |preset|
          create_comment(@reg, qp[:question], qp[:part], bi, preset)
        end
      end
    end
    @reg.reload
    assert_equal 0, @reg.current_score
    assert_equal 0, @reg.current_score_percentage
  end

  test 'score with extra credit is accurate: normal points' do
    setup_ec_exam
    @reg.grading_comments.destroy_all
    @qp_pairs.each do |qp|
      if !qp[:question].extra_credit && !qp[:part].extra_credit
        qp[:part].body_items.each do |bi|
          bi.preset_comments.where.not(points: 0).find_each do |preset|
            create_comment(@reg, qp[:question], qp[:part], bi, preset)
          end
        end
      else
        qp[:part].body_items.each do |bi|
          bi.preset_comments.where(points: 0).find_each do |preset|
            create_comment(@reg, qp[:question], qp[:part], bi, preset)
          end
        end
      end
    end
    @reg.reload
    assert_equal @normal_points, @reg.current_score
    assert_equal 100, @reg.current_score_percentage
  end

  test 'score with extra credit is accurate: include extra credit' do
    setup_ec_exam
    @reg.grading_comments.destroy_all
    @qp_pairs.each do |qp|
      qp[:part].body_items.each do |bi|
        bi.preset_comments.where.not(points: 0).find_each do |preset|
          create_comment(@reg, qp[:question], qp[:part], bi, preset)
        end
      end
    end
    @reg.reload
    assert_equal @total, @reg.current_score
    assert_equal 100.0 * (@total / @normal_points), @reg.current_score_percentage
  end

  # test 'invalid qnum' do
  #   bad = build(:grading_check, qnum: @version.db_questions.length)
  #   assert_not bad.valid?
  #   assert_match(/item numbers must be valid/, bad.errors.full_messages.to_sentence)
  # end
end
