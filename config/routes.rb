# frozen_string_literal: true

Rails.application.routes.draw do
  mount ActionCable.server => '/cable'
  post "/graphql", to: "graphql#execute"
  if Rails.env.development?
    get "/graphiql", to: "graphql#graphiql"
  end
  namespace :api do
    namespace :professor do
      resources :courses, shallow: true, param: 'course_id', only: [] do
        member do
          post :sync
          resources :exams, param: 'exam_id', only: [:show] do
            member do
              resources :versions, param: 'version_id', only: [:create, :update, :destroy] do
                collection do
                  post :import
                end
                member do
                  get :export_file
                  get :export_archive
                end
              end
            end
          end
        end
      end
    end

    namespace :student do
      resources :exams, param: 'exam_id', only: [] do
        member do
          post :take
          post :question
          get :questions
          post :messages
        end
      end
    end
  end

  devise_for :users, skip: [:registrations, :passwords], controllers: {
    omniauth_callbacks: 'users/omniauth_callbacks',
  }

  root to: 'main#index'
  get '*path', to: 'main#index'
end
