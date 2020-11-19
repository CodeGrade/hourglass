FROM ruby:2.7.2
RUN apt-get update -qq && apt-get install -y nodejs postgresql-client npm
RUN npm i -g yarn
WORKDIR /hourglass

COPY Gemfile /hourglass/
COPY Gemfile.lock /hourglass/
RUN bundle install

COPY package.json /hourglass/
COPY yarn.lock /hourglass/
RUN yarn install --frozen-lockfile

COPY entrypoint.sh /hourglass/
RUN chmod +x /hourglass/entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]

VOLUME ["/hourglass/app"]

EXPOSE 3000
CMD ["rails", "server", "-b", "0.0.0.0", "-p", "3000"]
