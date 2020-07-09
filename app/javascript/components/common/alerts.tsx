import React, {
  useState,
  useEffect,
  useContext,
  useMemo,
} from 'react';
import { AlertProps, Toast } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import './alerts.scss';
import { DateTime } from 'luxon';

interface HGAlert {
  title?: string;
  message?: string | JSX.Element;
  variant: AlertProps['variant'];
  autohide?: boolean;
}

interface HGAlertWithID extends HGAlert {
  time: number;
}

const ShowAlert: React.FC<{
  alert: HGAlertWithID;
}> = (props) => {
  const {
    alert,
  } = props;
  const {
    autohide = false,
    title,
    message,
    variant,
  } = alert;
  const [show, setShow] = useState(true);
  return (
    <Toast
      className={`border-${variant}`}
      show={show}
      onClose={(): void => setShow(false)}
      autohide={autohide}
      delay={10000}
    >
      <Toast.Header>
        <strong className="mr-auto">{title}</strong>
      </Toast.Header>
      {message && (
        <Toast.Body>{message}</Toast.Body>
      )}
    </Toast>
  );
};

const ShowAlerts: React.FC<{
  alerts: HGAlertWithID[];
}> = ({ alerts }) => (
  <div id="allAlerts">
    {alerts.map((alert) => (
      <ShowAlert
        key={alert.time}
        alert={alert}
      />
    ))}
  </div>
);

interface AlertContext {
  alert: (alert: HGAlert) => void;
}

export const AlertContext = React.createContext<AlertContext>({} as AlertContext);

export const AllAlerts: React.FC = ({ children }) => {
  const [alerts, setAlerts] = useState<HGAlertWithID[]>([]);
  const val = useMemo<AlertContext>(() => ({
    alert: (alert) => {
      setAlerts((a) => a.concat([{
        time: DateTime.local().toMillis(),
        ...alert,
      }]));
    },
  }), []);
  const history = useHistory();
  useEffect(() => history.listen((_) => {
    setAlerts([]);
  }), [history]);
  return (
    <AlertContext.Provider value={val}>
      <ShowAlerts alerts={alerts} />
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = (
  msg: HGAlert,
  condition: boolean,
  deps?: React.DependencyList,
): void => {
  const { alert } = useContext(AlertContext);
  useEffect(() => {
    if (condition) alert(msg);
  }, [condition, alert, ...(deps ?? [])]);
};
