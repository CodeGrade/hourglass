# Hourglass
Web-based exam server

## TODOs and Current Progress

[Anomaly Detection Progress and TODOs](ANOMALIES.md)

[General TODOs](TODO.md)

## Database setup
Hourglass expects postgresql.

Databases can be created with `rails db:create` and the schema is loaded with `rails db:schema:load`.

To seed the database with some [defaults for development](db/seeds.rb), run `rails db:seed`.
