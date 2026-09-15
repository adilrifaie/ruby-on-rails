class SurveyPolicy < ApplicationPolicy
  def create?
    record.scale.user_id == user.id
  end

  def update?
    owner?
  end

  def destroy?
    owner?
  end

  private

  def owner?
    record.user_id == user.id
  end
end
