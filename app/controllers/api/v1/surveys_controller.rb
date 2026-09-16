module Api
  module V1
    class SurveysController < ApplicationController
      skip_before_action :authenticate_request!, only: :show

      def index
        page = [ (params[:page] || 1).to_i, 1 ].max
        per = [ (params[:per] || 25).to_i, 1 ].max
        @surveys = Survey.includes(:scale, :user).order(:id).offset((page - 1) * per).limit(per)
      end

      def show
        @survey = Survey.find(params[:id])
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

      def update
        @survey = Survey.find(params[:id])
        authorize @survey
        if @survey.update(survey_params)
          render :show
        else
          render json: { errors: @survey.errors }, status: :unprocessable_entity
        end
      end

      def destroy
        @survey = Survey.find(params[:id])
        authorize @survey
        if @survey.responses.exists?
          render json: { error: "cannot delete a survey that already has responses" }, status: :unprocessable_entity
        else
          @survey.destroy
          head :no_content
        end
      end

      private

      def survey_params
        params.require(:survey).permit(:scale_id, :title, :status)
      end
    end
  end
end
