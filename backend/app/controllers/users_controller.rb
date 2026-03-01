class UsersController < ApplicationController
  def index
    users = User.all.order(:first_name)
    render json: users
  end
end
