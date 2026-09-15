module Api
  module V1
    class SurveysController < ApplicationController
      def index
        @surveys = Survey.includes(:scale, :user).all
      end

      def create
        @survey = Survey.new(survey_params)
        @survey.user = current_user
        authorize @survey

        if @survey.save
          render :create, status: :created
        else
          render json: { errors: @survey.errors }, status: :unprocessable_entity
        end
      end

      private

      def survey_params
        params.require(:survey).permit(:scale_id, :title, :status)
      end
    end
  end
end
