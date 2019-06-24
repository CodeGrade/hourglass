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
      get :contents
      post :submit
      post :save_snapshot
    end

    resources :registrations, only: [:show, :index] do
      resources :anomalies, only: [:show, :index, :destroy, :create]
    end
  end
end
