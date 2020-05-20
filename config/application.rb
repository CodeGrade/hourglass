require_relative 'boot'

require 'rails'
require 'active_model/railtie'
require 'active_job/railtie'
require 'active_record/railtie'
require 'action_controller/railtie'
require 'action_mailer/railtie'
require 'action_view/railtie'
require 'sprockets/railtie'
require 'rails/test_unit/railtie'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Hourglass
  class Application < Rails::Application
    config.load_defaults 6.0

    config.before_configuration do
      ENV['BOTTLENOSE_URL'] =
        if Rails.env.production?
          'https://handins.ccs.neu.edu'
        else
          'http://127.0.0.1:3000'
        end
    end

    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration can go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded after loading
    # the framework and any gems in your application.

    config.autoload_paths << Rails.root.join('lib')
  end
end
