module Api
  module V1
    class SurveysController < ApplicationController
      def index
        surveys = Survey.includes(:scale, :user).all
        render json: surveys, include: [:scale, :user]
      end
      
      def create
        survey = Survey.new(survey_params)
        if survey.save
          render json: { survey: survey, link: survey.generate_link }, status: :created
        else
          render json: { errors: survey.errors }, status: :unprocessable_entity
        end
      end
      
      private
      
      def survey_params
        params.require(:survey).permit(:scale_id, :user_id, :title, :status)
      end
    end
  end
end