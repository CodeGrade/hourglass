Rails.application.routes.draw do
  root to: 'main#home'

  devise_for :users, :skip => [:registrations, :passwords, :sessions]
  devise_scope :user do
    get "/login" => "devise/sessions#new", :as => :new_user_session
    post "/login" => "devise/sessions#create", :as => :user_session
    delete "/logout" => "devise/sessions#destroy", :as => :destroy_user_session
  end

  resources :exams, only: [:show, :index, :new, :create] do
    member do
      get :start
      post :finalize
      post :submit

      post :save_snapshot
      post :ask_question
    end

    resources :registrations, only: [:show, :index] do
      resources :anomalies, only: [:show, :index, :destroy, :create]

      post :clear_anomalies
      post :finalize
    end

    resources :rooms, only: [:show, :index] do
      post :finalize
    end
  end
end
