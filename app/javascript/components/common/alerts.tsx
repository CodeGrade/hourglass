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
}> = React.memo((props) => {
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
}, (prev, next) => (prev.alert.id === next.alert.id));

const ShowAlerts: React.FC<{
  alerts: HGAlertWithID[];
}> = React.memo(({ alerts }) => (
  <div id="allAlerts">
    {alerts.map((alert) => (
      <ShowAlert
        key={alert.id}
        alert={alert}
      />
    ))}
  </div>
), (prev, next) => (
  prev.alerts.length === next.alerts.length
  && prev.alerts.reduce((acc, prevAlert, idx) => (
    acc && prevAlert.id === next.alerts[idx].id
  ), true)
));

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
  const alertContext = React.useMemo(() => ({ alert: addAlert }), [addAlert]);
  return (
    <AlertContext.Provider value={alertContext}>
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
