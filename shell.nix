{
  pkgs ? import <nixpkgs> {},
  ruby ? pkgs.ruby_2_7,
}:
let
  psql_setup_file = pkgs.writeText "setup.sql" ''
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
  start_postgres = pkgs.writeShellScriptBin "start_postgres" ''
    pg_ctl start -l $LOG_PATH -o "-c listen_addresses= -c unix_socket_directories=$PGHOST"
    psql -f ${psql_setup_file} > /dev/null
  '';
  stop_postgres = pkgs.writeShellScriptBin "stop_postgres" ''
    pg_ctl -D $PGDATA stop
  '';
in pkgs.mkShell {
  name = "hourglass";
  buildInputs = with pkgs; [
    ruby.devEnv
    bundler
    postgresql
    qt4
    curl.dev
    pcre
    nodejs-16_x
    nodePackages_latest.yarn
    start_postgres
    stop_postgres
    nodePackages.typescript-language-server
    # racket
    chromedriver
    chromium
    which
    lzma
    watchman
  ];

  shellHook = ''
    ${postgres_setup}
    ${gem_setup}
    export PATH=${pkgs.nodePackages_latest.yarn}/lib/node_modules/yarn/bin:$PWD/node_modules/.bin:$PATH
  '';
}
