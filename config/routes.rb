# frozen_string_literal: true

Rails.application.routes.draw do
  root to: 'main#home'

  devise_for :users, skip: %i[registrations passwords sessions]
  devise_scope :user do
    get '/login' => 'devise/sessions#new', :as => :new_user_session
    post '/login' => 'devise/sessions#create', :as => :user_session
    delete '/logout' => 'devise/sessions#destroy', :as => :destroy_user_session
  end

  resources :exams, only: %i[show index new create] do
    member do
      get :contents
      get :preview
      post :finalize
      post :submit
      post :save_snapshot
    end

    resources :registrations, only: %i[show index] do
      resources :anomalies, only: %i[show index destroy create]

      post :clear_anomalies
      post :finalize
    end

    resources :rooms, only: %i[show index] do
      post :finalize
    end
  end
end
