import React, { useState, useEffect, useContext } from 'react';
import { AlertProps, Toast } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import './alerts.scss';

interface HGAlert {
  title?: string;
  message?: string | JSX.Element;
  variant: AlertProps['variant'];
  autohide?: boolean;
}

interface HGAlertWithID extends HGAlert {
  id: number;
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
      delay={5000}
    >
      <Toast.Header>
        <img src="holder.js/20x20?text=%20" className="rounded mr-2" alt="" />
        <strong className="mr-auto">{title}</strong>
        <small>just now</small>
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
        key={alert.id}
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
  const [lastId, setLastId] = useState(0);
  const [alerts, setAlerts] = useState<HGAlertWithID[]>([]);
  const addAlert = React.useCallback((alert) => {
    setAlerts((a) => a.concat([{
      id: lastId,
      ...alert,
    }]));
    setLastId((i) => i + 1);
  }, [lastId]);
  const history = useHistory();
  useEffect(() => history.listen((_) => {
    setAlerts([]);
  }), [history]);
  return (
    <AlertContext.Provider
      value={{
        alert: addAlert,
      }}
    >
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
  }, [condition, ...(deps ?? [])]);
};
