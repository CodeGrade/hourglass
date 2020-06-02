# Hourglass

Web-based exam server.

Sister project of [Bottlenose][bottlenose].

[Anomaly Detection Progress](ANOMALIES.md)

## Development Environment Setup

A `shell.nix` is provided which should get you a reproducible environment for running hourglass.

[More info about Nix][nix].

It will also setup postgres to store data locally. Once in the `nix-shell` environment, run `bundle install` to install gems locally. You can then run `start_postgres` and `stop_postgres` to control the local postgres server.

## Manual Database setup

Hourglass expects postgresql.

Databases can be created with `rails db:create` and the schema is loaded with `rails db:schema:load`.

To setup the database with our test models, run `rails db:fixtures:load`.

[bottlenose]: https://github.com/CodeGrade/bottlenose
[nix]: https://nixos.org/nix/
