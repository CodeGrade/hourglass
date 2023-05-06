# frozen_string_literal: true

source 'https://rubygems.org'
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby '2.7.8'

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '~> 6.1'
# Use postgresql as the database for Active Record
gem 'pg', '>= 0.18', '< 2.0'

gem 'graphql', '~> 1.12.17'
gem 'graphql-batch'
gem 'graphql-guard'

# Transpile app-like JavaScript. Read more: https://github.com/rails/webpacker
gem 'webpacker', '~> 6.0.0.rc.5'

gem 'react-rails'

gem 'devise', '~> 4.8.0'
gem 'omniauth-bottlenose', git: 'https://github.com/CodeGrade/omniauth-bottlenose'
gem 'omniauth-oauth2', '~> 1.7.0'
gem 'omniauth-rails_csrf_protection'

gem 'bootstrap_form', '>= 4.2.0'

gem 'headless' # needed to run Racket, and xvfb-run (the shell script) merges stdout and stderr

gem 'rubyzip'

gem 'pretender'

# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
# gem 'jbuilder', '~> 2.7'
# Use Redis adapter to run Action Cable in production
# gem 'redis', '~> 4.0'

# Use Capistrano for deployment
# gem 'capistrano-rails', group: :development

# Reduces boot times through caching; required in config/boot.rb
gem 'bootsnap', '>= 1.4.2', require: false

gem 'activerecord_json_validator', '~> 2.0'
gem 'json-schema', '~> 2.8'

gem 'listen', '~> 3.3'

group :development, :test do
  gem 'byebug'
  gem 'factory_bot_rails', require: false
  gem 'minitest-reporters'
  gem 'pry'
  gem 'pry-rails'
  gem 'pry-rescue'
  gem 'pry-stack_explorer'
  gem 'puma', '~> 4.1'
end

group :development do
  # https://github.com/BetterErrors/better_errors/issues/516
  gem 'better_errors', '2.9.1'

  gem 'binding_of_caller'
  gem 'rubocop-rails'
  gem 'spring', '4.0.0'
  # Access an interactive console on exception pages or by calling 'console' anywhere in the code.
  gem 'web-console', '>= 4.1.0'
end

group :test do
  gem 'capybara'
  gem 'selenium-webdriver'
  gem 'database_cleaner'
  gem 'webdrivers'
end

group :production do
  gem 'passenger', '>= 5.3.2', require: 'phusion_passenger/rack_handler'
end

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem 'tzinfo-data', platforms: [:mingw, :mswin, :x64_mingw, :jruby]
