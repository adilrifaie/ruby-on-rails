class ResponsePolicy < ApplicationPolicy
  def show?
    owner?
  end

  def export?
    owner?
  end

  private

  def owner?
    record.survey.user_id == user.id
  end
end
