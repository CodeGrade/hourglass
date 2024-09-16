FROM phusion/passenger-ruby33:3.0.7
RUN apt-get update && apt-get upgrade -y -o Dpkg::Options::="--force-confold"

RUN rm -f /etc/service/nginx/down
RUN rm /etc/nginx/sites-enabled/default
ADD hourglass.conf /etc/nginx/sites-enabled/hourglass.conf

RUN apt-get update
RUN apt-get install -y ca-certificates curl gnupg graphviz openjdk-17-jdk-headless
RUN curl -fsSL https://deb.nodesource.com/setup_20.x -o nodesource_setup.sh
RUN bash nodesource_setup.sh
RUN apt-get update -qq && apt-get install -y nodejs postgresql-client
WORKDIR /home/app/hourglass
COPY Gemfile /home/app/hourglass/Gemfile
COPY Gemfile.lock /home/app/hourglass/Gemfile.lock
RUN bundle config set --local without 'test development'
RUN bundle install

COPY package.json /home/app/hourglass/package.json
COPY yarn.lock /home/app/hourglass/yarn.lock
RUN npm install --global yarn
RUN yarn install --frozen-lockfile

COPY ./ /home/app/hourglass

RUN mkdir -pv app/packs/relay/data/ && RAILS_ENV=development rake graphql:update_schema
RUN yarn run relay-persist
RUN SECRET_KEY_BASE="aaaa" rake assets:precompile
RUN chown -R app:app /home/app/hourglass
