FROM centos:7.7.1908
RUN yum install -y epel-release centos-release-scl
RUN yum install -y libpng-devel libcurl-devel openssl-devel qt5-qtwebkit-devel rh-nodejs12 yum-utils git rh-postgresql96 libpqxx-devel
RUN yum-config-manager --enable rhel-server-rhscl-7-rpms
RUN yum install -y rh-ruby27* devtoolset-9
RUN yum install -y scl-utils
RUN curl --silent --location https://dl.yarnpkg.com/rpm/yarn.repo > /etc/yum.repos.d/yarn.repo
RUN curl --fail -sSLo /etc/yum.repos.d/passenger.repo https://oss-binaries.phusionpassenger.com/yum/definitions/el-passenger.repo
RUN yum install -y yarn mod_passenger httpd-devel passenger-devel

ENV PGDATA="/var/opt/rh/rh-postgresql96/lib/pgsql/data" PGSTARTTIMEOUT="270" PG_OOM_ADJUST_FILE="/proc/self/oom_score_adj" PG_OOM_ADJUST_VALUE="0"

RUN su - postgres -c "scl enable rh-postgresql96 -- env PGDATA=/var/opt/rh/rh-postgresql96/lib/pgsql/data initdb"
RUN su -c "/opt/rh/rh-postgresql96/root/usr/libexec/postgresql-ctl start -D ${PGDATA} -s -w -t ${PGSTARTTIMEOUT}" - postgres && \
      su - postgres -c "scl enable rh-postgresql96 -- createuser -d hourglass"

RUN useradd -d /opt/hourglass hourglass -G users && cp -r /etc/skel/. /opt/hourglass
USER hourglass
WORKDIR /opt/hourglass

ENV PATH=/opt/hourglass/bin:/opt/rh/rh-nodejs12/root/usr/bin:/opt/rh/rh-ruby27/root/usr/local/bin:/opt/rh/rh-ruby27/root/usr/bin:$PATH \
    LD_LIBRARY_PATH=/opt/rh/rh-ruby27/root/usr/local/lib64:/opt/rh/rh-ruby27/root/usr/lib64:$LD_LIBRARY_PATH

ENV RAILS_ENV=production NODE_ENV=production RACK_ENV=production

ADD --chown=hourglass:hourglass Gemfile /opt/hourglass/
ADD --chown=hourglass:hourglass Gemfile.lock /opt/hourglass/
RUN sed -i "s/ruby '2\.7\.2'/ruby '2.7.1'/" Gemfile
RUN echo '2.7.1' > .ruby-version
RUN gem install bundler
RUN bundle config set path '/opt/hourglass/.gem'
RUN bundle install

ADD --chown=hourglass:hourglass package.json /opt/hourglass/
ADD --chown=hourglass:hourglass yarn.lock /opt/hourglass/
RUN yarn install

ADD --chown=hourglass:hourglass . /opt/hourglass
RUN sed -i "s/ruby '2\.7\.2'/ruby '2.7.1'/" Gemfile
RUN echo '2.7.1' > .ruby-version

ADD --chown=hourglass:hourglass app/javascript/relay/data/schema.json /opt/hourglass/app/javascript/relay/data/schema.json
RUN env RAILS_ENV=development yarn run relay-new
RUN env SECRET_KEY_BASE=$(bundle exec rails secret) bundle exec rake assets:precompile

USER root
ENTRYPOINT ["./entrypoint-root.sh"]

EXPOSE 3000
CMD ["rails", "server", "-b", "0.0.0.0", "-p", "3000"]
