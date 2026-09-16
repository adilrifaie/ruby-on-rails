Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resource :session, only: [:create]
      resources :users, only: [:index, :show, :create, :update]
      resources :scales, only: [:index, :show, :create, :update, :destroy] do
        member do
          patch :publish
        end
        resources :questions, only: [:create, :update, :destroy]
      end
      resources :surveys, only: [:index, :show, :create, :update, :destroy]
      resources :responses, only: [:create, :show] do
        member do
          get :export
        end
      end
      resources :analyses, only: [:index, :show, :create] do
        member do
          get :report
        end
      end
    end
  end
end