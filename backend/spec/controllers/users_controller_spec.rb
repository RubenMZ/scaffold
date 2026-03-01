require "rails_helper"

RSpec.describe UsersController, type: :controller do
  before do
    User.create!(first_name: "Alice", last_name: "Johnson", email: "alice@example.com", nickname: "bluegirl")
    User.create!(first_name: "Bob", last_name: "Smith", email: "bob@example.com", nickname: "chef_bob")
  end

  describe "GET #index" do
    before { get :index }

    it "returns success" do
      expect(response).to have_http_status(:ok)
    end

    it "returns JSON content type" do
      expect(response.content_type).to eq("application/json; charset=utf-8")
    end

    it "returns all users" do
      json = JSON.parse(response.body)
      expect(json.size).to eq(2)
    end

    it "returns users ordered by first_name" do
      json = JSON.parse(response.body)
      first_names = json.map { |u| u["first_name"] }
      expect(first_names).to eq(%w[Alice Bob])
    end

    it "includes expected fields" do
      json = JSON.parse(response.body)
      user = json.first
      expect(user.keys).to include("id", "first_name", "last_name", "email", "nickname")
    end

    it "does not include timestamps" do
      json = JSON.parse(response.body)
      user = json.first
      expect(user.keys).to include("created_at", "updated_at")
    end
  end
end
