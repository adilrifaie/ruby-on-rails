class ResponsePolicy < ApplicationPolicy
  def export?
    record.survey.user_id == user.id
  end
end
