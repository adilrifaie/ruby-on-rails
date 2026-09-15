class AnalysisPolicy < ApplicationPolicy
  def create?
    record.survey.user_id == user.id
  end

  def report?
    owner?
  end

  private

  def owner?
    record.user_id == user.id
  end
end
