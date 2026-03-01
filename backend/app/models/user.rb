class User < ApplicationRecord
  has_many :recipes, dependent: :nullify

  validates :first_name, presence: true
  validates :last_name, presence: true
  validates :email, presence: true, uniqueness: true
  validates :nickname, presence: true, uniqueness: true
end
