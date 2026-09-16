module Api
  module V1
    class QuestionsController < ApplicationController
      def create
        @scale = Scale.find(params[:scale_id])
        authorize @scale, :update?
        @question = @scale.questions.new(question_params)
        if @question.save
          render :show, status: :created
        else
          render json: { errors: @question.errors }, status: :unprocessable_entity
        end
      end

      def update
        @question = Question.find(params[:id])
        authorize @question.scale, :update?
        if @question.update(question_params)
          render :show
        else
          render json: { errors: @question.errors }, status: :unprocessable_entity
        end
      end

      def destroy
        @question = Question.find(params[:id])
        authorize @question.scale, :update?
        if @question.answers.exists?
          render json: { error: "cannot delete a question that already has answers" }, status: :unprocessable_entity
        else
          @question.destroy
          head :no_content
        end
      end

      private

      def question_params
        params.require(:question).permit(:text, :position, :min_value, :max_value)
      end
    end
  end
end
