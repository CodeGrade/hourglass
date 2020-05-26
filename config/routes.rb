Rails.application.routes.draw do
  root to: 'main#index'

  devise_for :users, skip: [:registrations, :passwords], controllers: {
    omniauth_callbacks: 'users/omniauth_callbacks'
  }

  resources :courses, param: 'course_id', only: [] do
    member do
      resources :sections, param: 'section_id', only: [] do
        member do
          post :sync
        end
      end
      resources :exams, param: 'exam_id', only: [:new, :create, :edit, :update] do
        member do
          get :take, to: 'exams#take'
          post :take, to: 'exams#during'

          get :proctor
          post :finalize
          resources :rooms, param: 'room_id', only: [] do
            member do
              post :finalize
              resources :registrations, param: 'registration_id', only: [:show] do
                member do
                  post :finalize
                  resources :anomalies, param: 'anomaly_id', only: [:index, :destroy]
                end
              end
            end
          end
        end
      end
    end
  end
end
