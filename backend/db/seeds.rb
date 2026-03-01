# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

users = [
  { first_name: "Alice", last_name: "Johnson", email: "alice@example.com", nickname: "bluegirl" },
  { first_name: "Bob", last_name: "Smith", email: "bob@example.com", nickname: "CHEF RIDER" },
  { first_name: "Carlos", last_name: "García", email: "carlos@example.com", nickname: "iggytakahashi" },
  { first_name: "Diana", last_name: "López", email: "diana@example.com", nickname: "LaDonna" },
  { first_name: "Elena", last_name: "Martínez", email: "elena@example.com", nickname: "Tammi" }
]

users.each do |attrs|
  User.find_or_create_by!(email: attrs[:email]) do |user|
    user.first_name = attrs[:first_name]
    user.last_name = attrs[:last_name]
    user.nickname = attrs[:nickname]
  end
end

puts "Seeded #{User.count} users"
