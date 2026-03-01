require "rails_helper"

RSpec.describe User, type: :model do
  subject(:user) do
    described_class.new(
      first_name: "Alice",
      last_name: "Johnson",
      email: "alice@example.com",
      nickname: "bluegirl"
    )
  end

  it "is valid with all attributes" do
    expect(user).to be_valid
  end

  describe "validations" do
    it "requires a first_name" do
      user.first_name = nil
      expect(user).not_to be_valid
      expect(user.errors[:first_name]).to include("can't be blank")
    end

    it "requires a last_name" do
      user.last_name = nil
      expect(user).not_to be_valid
      expect(user.errors[:last_name]).to include("can't be blank")
    end

    it "requires an email" do
      user.email = nil
      expect(user).not_to be_valid
      expect(user.errors[:email]).to include("can't be blank")
    end

    it "requires a unique email" do
      user.save!
      duplicate = described_class.new(
        first_name: "Bob",
        last_name: "Smith",
        email: "alice@example.com",
        nickname: "other_nick"
      )
      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:email]).to include("has already been taken")
    end

    it "requires a nickname" do
      user.nickname = nil
      expect(user).not_to be_valid
      expect(user.errors[:nickname]).to include("can't be blank")
    end

    it "requires a unique nickname" do
      user.save!
      duplicate = described_class.new(
        first_name: "Bob",
        last_name: "Smith",
        email: "bob@example.com",
        nickname: "bluegirl"
      )
      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:nickname]).to include("has already been taken")
    end
  end
end
