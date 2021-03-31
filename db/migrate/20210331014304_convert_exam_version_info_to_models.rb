class ConvertExamVersionInfoToModels < ActiveRecord::Migration[6.0]
  def up
    ExamVersion.all.each do |ev|
      ev.update(
        policies: ev.policies.join(','),
        instructions: ev.contents.dig('instructions', 'value') || '',
      )
      ev.reference.each_with_index do |ref, refnum|
        Reference.create(
          path: ref['path'],
          type: ref['type'],
          index: refnum,
          exam_version: ev,
        )
      end

      ev.questions.each_with_index do |q, qnum|
        q_answers = ev.answers[qnum]
        new_q = Question.create(
          exam_version: ev,
          index: qnum,
          name: q.dig('name', 'value'),
          description: q.dig('description', 'value'),
          extra_credit: q['extraCredit'] || false,
          separate_subparts: q['separateSubparts'] || false,
        )
        q['reference'].each_with_index do |ref, refnum|
          Reference.create(
            path: ref['path'],
            type: ref['type'],
            index: refnum,
            exam_version: ev,
            question: new_q,
          )
        end
        q['parts'].each_with_index do |p, pnum|
          p_answers = q_answers[pnum]
          new_p = Part.create(
            question: new_q,
            index: pnum,
            name: p.dig('name', 'value'),
            description: p.dig('description', 'value'),
            points: p['points'],
            extra_credit: p['extraCredit'] || false,
          )
          p['reference'].each_with_index do |ref, refnum|
            Reference.create(
              path: ref['path'],
              type: ref['type'],
              index: refnum,
              exam_version: ev,
              question: new_q,
              part: new_p,
            )
          end
          p['body'].each_with_index do |b, bnum|
            b_answer = p_answers[bnum]
            b_answer = nil if b_answer.is_a?(Hash) && b_answer['NO_ANS']
            new_b = BodyItem.create(
              part: new_p,
              index: bnum,
              answer: b_answer,
              info: b,
            )
          end
        end
      end
    end
  end

  def down
    Question.destroy_all
    Part.destroy_all
    BodyItem.destroy_all
    Reference.destroy_all
  end

  # TODO: another migration to remove infos once it is time
  # raise 'NOT YET IMPLEMENTED'
  # remove_column :exam_version, :info
end
