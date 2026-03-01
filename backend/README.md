# Backend — Rails API

Rails 8.1 API-only application with PostgreSQL.

## Setup

```bash
bundle install
bin/rails db:create db:migrate db:seed
bin/rails server
```

## Testing

The project uses **RSpec** for testing. Specs live in the `spec/` directory.

```bash
# Run all specs
bundle exec rspec

# Run model specs only
bundle exec rspec spec/models

# Run request specs only
bundle exec rspec spec/controllers

# Run a specific spec file
bundle exec rspec spec/models/user_spec.rb
```

### Spec structure

```
spec/
├── controllers/
│   └── users_controller_spec.rb  # UsersController specs
├── models/
│   └── user_spec.rb              # User model validations
├── rails_helper.rb
└── spec_helper.rb
```

### First-time test DB setup

```bash
bin/rails db:create RAILS_ENV=test
RAILS_ENV=test bin/rails db:schema:load
```
