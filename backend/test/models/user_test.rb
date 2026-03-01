require "test_helper"

class UserTest < ActiveSupport::TestCase
  setup do
    @user = users(:alice)
  end

  test "valid user" do
    assert @user.valid?
  end

  test "requires first_name" do
    @user.first_name = nil
    assert_not @user.valid?
    assert_includes @user.errors[:first_name], "can't be blank"
  end

  test "requires last_name" do
    @user.last_name = nil
    assert_not @user.valid?
    assert_includes @user.errors[:last_name], "can't be blank"
  end

  test "requires email" do
    @user.email = nil
    assert_not @user.valid?
    assert_includes @user.errors[:email], "can't be blank"
  end

  test "requires unique email" do
    duplicate = @user.dup
    duplicate.nickname = "unique_nick"
    assert_not duplicate.valid?
    assert_includes duplicate.errors[:email], "has already been taken"
  end

  test "requires nickname" do
    @user.nickname = nil
    assert_not @user.valid?
    assert_includes @user.errors[:nickname], "can't be blank"
  end

  test "requires unique nickname" do
    duplicate = @user.dup
    duplicate.email = "other@example.com"
    assert_not duplicate.valid?
    assert_includes duplicate.errors[:nickname], "has already been taken"
  end
end
