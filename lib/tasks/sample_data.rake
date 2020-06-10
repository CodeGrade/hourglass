# frozen_string_literal: true

if Rails.env.development? || Rails.env.test?
  require 'factory_bot_rails'

  namespace :db do
    desc 'Fill database with sample data'
    task populate: :environment do
      include FactoryBot::Syntax::Methods

      Rake::Task['db:reset'].invoke
      make_users
    end
  end
end

def make_users
  FactoryBot.create(:admin, username: 'admin')
  cs2500prof = create(:user, username: 'cs2500prof')
  cs2500proctor = create(:user, username: 'cs2500proctor')
  cs2500student = create(:user, username: 'cs2500student')
  cs2500student2 = create(:user, username: 'cs2500student2')
  cs2500student_no_room = create(:user, username: 'cs2500student_no_room')

  cs3500prof = create(:user, username: 'cs3500prof')
  cs3500proctor = create(:user, username: 'cs3500proctor')
  cs3500student = create(:user, username: 'cs3500student')
end
