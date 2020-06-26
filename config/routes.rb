Rails.application.routes.draw do
  namespace :api do
    get :me

    namespace :professor do
      resources :courses, shallow: true, param: 'course_id', only: [:index, :show] do
        member do
          post :sync
          resources :exams, param: 'exam_id', only: [:create, :index, :show, :update] do
            member do
              resources :versions, param: 'version_id', only: [:index, :show, :create, :update, :destroy] do
                collection do
                  post :import
                  post :update_all
                end
                member do
                  get :export_file
                  get :export_archive
                end
              end
              resources :rooms, param: 'room_id', only: [:index] do
                collection do
                  post :update_all_rooms
                  get :staff_regs
                  post :update_all_staff
                  post :update_all
                end
              end
            end
          end
        end
      end
    end

    namespace :proctor do
      resources :exams, shallow: true, param: 'exam_id', only: [] do
        member do
          resources :anomalies, param: 'anomaly_id', only: [:index, :destroy]
          resources :messages, param: 'message_id', only: [:index, :create]
          resources :registrations, param: 'registration_id', only: [] do
            member do
              post :finalize
            end
          end
        end
      end
    end

    namespace :grader do
      resources :exams, shallow: true, param: 'exam_id', only: [] do
        member do
          resources :registrations, param: 'registration_id', only: [:index, :show]
        end
      end
    end

    namespace :student do
      resources :registrations, only: [:index]
      resources :exams, param: 'exam_id', only: [:show] do
        member do
          post :take
          post :question
          post :messages
        end
      end
    end
  end

  devise_for :users, skip: [:registrations, :passwords], controllers: {
    omniauth_callbacks: 'users/omniauth_callbacks'
  }

  root to: 'main#index'
  get '*path', to: 'main#index'
end
