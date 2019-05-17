Rails.application.routes.draw do
  root to: 'main#home'

  devise_for :users, :skip => [:registrations, :passwords, :sessions]
  devise_scope :user do
    get "/login" => "devise/sessions#new", :as => :new_user_session
    post "/login" => "devise/sessions#create", :as => :user_session
    delete "/logout" => "devise/sessions#destroy", :as => :destroy_user_session
  end

  resources :exam, only: [:show] do
    member do
      get :start
      post :save_snapshot
    end
  end
end
