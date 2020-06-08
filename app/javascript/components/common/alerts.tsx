import React, { useState, useEffect } from 'react';
import { Alert, AlertProps } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';

interface HGAlert {
  title?: string;
  message?: string;
  variant: AlertProps['variant'];
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
    id,
    title,
    message,
    variant,
  } = alert;
  const [show, setShow] = useState(true);
  return (
    <Alert
      className="mt-2"
      key={id}
      variant={variant}
      dismissible
      show={show}
      onClose={(): void => setShow(false)}
    >
      {title && (
        <Alert.Heading>{title}</Alert.Heading>
      )}
      {message && (
        <p className="mb-0">{message}</p>
      )}
    </Alert>
  );
};

const ShowAlerts: React.FC<{
  alerts: HGAlertWithID[];
}> = ({ alerts }) => (
  <>
    {alerts.map((alert) => (
      <ShowAlert
        key={alert.id}
        alert={alert}
      />
    ))}
  </>
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
