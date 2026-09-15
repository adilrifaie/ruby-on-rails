class ScalePolicy < ApplicationPolicy
  def update?
    owner?
  end

  def publish?
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
