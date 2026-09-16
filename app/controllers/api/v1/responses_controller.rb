module Api
  module V1
    class ResponsesController < ApplicationController
      skip_before_action :authenticate_request!, only: :create

      def create
        response = Response.new(response_params)
        if response.save
          render json: {
            response: response,
            score: response.calculate_score
          }, status: :created
        else
          render json: { errors: response.errors }, status: :unprocessable_entity
        end
      end

      def show
        @response = Response.find(params[:id])
        authorize @response
      end

      def export
        response = Response.find(params[:id])
        authorize response
        render json: response.export_data
      end

      private

      def response_params
        params.require(:response).permit(
          :survey_id, :participant_name, :submitted_at,
          answers_attributes: [ :question_id, :value ]
        )
      end
    end
  end
end
