{
  description = "hourglass";

  inputs.nixpkgs.url = "github:nixos/nixpkgs/5e15d5da4abb74f0dd76967044735c70e94c5af1";
  # inputs.nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";

  # https://lazamar.co.uk/nix-versions/?channel=nixpkgs-unstable&package=ruby
  inputs.nixpkgs-ruby.url = "github:nixos/nixpkgs/5e15d5da4abb74f0dd76967044735c70e94c5af1";

  inputs.nixpkgs-watchman.url = "github:nixos/nixpkgs/4e9c02bcc709fe1737a746add0e8e0109133d808";

  outputs = { self, nixpkgs, nixpkgs-ruby, nixpkgs-watchman }: let
    pkgs = import nixpkgs {
      system = "x86_64-linux";
    };
    rubyPkgs = import nixpkgs-ruby {
      system = "x86_64-linux";
    };
    watchmanPkgs = import nixpkgs-watchman {
      system = "x86_64-linux";
    };
  in {
    devShell.x86_64-linux = let
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
          LC_ALL=C.utf8 initdb $PGDATA --auth=trust >/dev/null
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
      buildInputs = (with pkgs; [
        postgresql
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

        # passenger compilation libs
        libxcrypt
      ]) ++ (with rubyPkgs; [
        ruby_3_0
      ]) ++ (with watchmanPkgs; [
        watchman
      ]);

      shellHook = ''
        ${postgres_setup}
        ${gem_setup}
        export PATH=${pkgs.nodePackages_latest.yarn}/lib/node_modules/yarn/bin:$PWD/node_modules/.bin:$PATH
      '';
    };
  };
}
