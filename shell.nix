with import <nixpkgs> {};
let
  ruby = ruby_2_6;
  psql_setup_file = writeText "setup.sql" ''
    DO
    $do$
    BEGIN
      IF NOT EXISTS ( SELECT FROM pg_catalog.pg_roles WHERE rolname = 'hourglass') THEN
        CREATE ROLE hourglass CREATEDB LOGIN;
      END IF;
    END
    $do$
  '';
  gem_setup = ''
    mkdir -p .nix-gems
    export GEM_HOME=$PWD/.nix-gems
    export GEM_PATH=$GEM_HOME
    export PATH=$GEM_HOME/bin:$PATH
    gem install --conservative bundler
  '';
  postgres_setup = ''
    export PGDATA=$PWD/postgres_data
    export PGHOST=$PWD/postgres
    export LOG_PATH=$PWD/postgres/LOG
    export PGDATABASE=postgres
    export DATABASE_CLEANER_ALLOW_REMOTE_DATABASE_URL=true
    if [ ! -d $PGHOST ]; then
      mkdir -p $PGHOST
    fi
    if [ ! -d $PGDATA ]; then
      echo 'Initializing postgresql database...'
      initdb $PGDATA --auth=trust >/dev/null
    fi
  '';
  start_postgres = writeShellScriptBin "start_postgres" ''
    pg_ctl start -l $LOG_PATH -o "-c listen_addresses= -c unix_socket_directories=$PGHOST"
    psql -f ${psql_setup_file} > /dev/null
  '';
  stop_postgres = writeShellScriptBin "stop_postgres" ''
    pg_ctl -D $PGDATA stop
  '';
in mkShell {
  name = "hourglass";
  buildInputs = [
    solargraph
    ruby.devEnv
    bundler
    postgresql
    qt4
    curl.dev
    pcre
    nodejs
    yarn
    start_postgres
    stop_postgres
    nodePackages.typescript
    nodePackages.eslint_d
    racket
  ];

  shellHook = ''
    ${postgres_setup}
    ${gem_setup}
    export PATH=$PWD/node_modules/.bin:$PATH
  '';
}
