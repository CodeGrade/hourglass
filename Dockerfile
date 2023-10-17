FROM phusion/passenger-ruby30
RUN apt-get update && apt-get upgrade -y -o Dpkg::Options::="--force-confold"

RUN rm -f /etc/service/nginx/down
RUN rm /etc/nginx/sites-enabled/default
ADD hourglass.conf /etc/nginx/sites-enabled/hourglass.conf

RUN apt-get update
RUN apt-get install -y ca-certificates curl gnupg
RUN mkdir -p /etc/apt/keyrings
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
ENV NODE_MAJOR=20
RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
RUN apt-get update -qq && apt-get install -y nodejs postgresql-client
WORKDIR /home/app/hourglass
COPY Gemfile /home/app/hourglass/Gemfile
COPY Gemfile.lock /home/app/hourglass/Gemfile.lock
RUN bash -lc 'rvm install ruby-3.0.2'
RUN bash -lc 'rvm --default use ruby-3.0.2'
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
