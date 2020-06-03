import React, { useState, useEffect } from 'react';
import { Alert, AlertProps } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';

interface HGAlert {
  title?: string;
  message?: string;
  variant: AlertProps['variant'];
}

interface HGAlertWithID extends HGAlert {
  id: number;
}

const ShowAlerts: React.FC<{
  alerts: HGAlertWithID[];
  onClose: (id: number) => void;
}> = ({ alerts, onClose }) => (
  <>
    {alerts.map(({
      id,
      title,
      message,
      variant,
    }) => (
      <Alert
        key={id}
        variant={variant}
        dismissible
        onClose={(): void => onClose(id)}
      >
        {title && (
          <Alert.Heading>{title}</Alert.Heading>
        )}
        {message && (
          <p className="mb-0">{message}</p>
        )}
      </Alert>
    ))}
  </>
);

interface AlertContext {
  alert: (alert: HGAlert) => void;
}

export const AlertContext = React.createContext<AlertContext>({} as AlertContext);

export const AllAlerts: React.FC<{}> = ({ children }) => {
  const [lastId, setLastId] = useState(0);
  const [alerts, setAlerts] = useState<HGAlertWithID[]>([]);
  const addAlert = React.useCallback((alert) => {
    setAlerts((a) => a.concat([{
      id: lastId,
      ...alert,
    }]));
    setLastId((i) => i + 1);
  }, [lastId]);
  const removeAlert = (removeId: number): void => {
    setAlerts((a) => {
      const idx = a.findIndex(({ id }) => id === removeId);
      if (idx === -1) return a;
      return [...a.slice(0, idx), ...a.slice(idx, a.length - 1)];
    });
  };
  const location = useLocation();
  useEffect(() => {
    setAlerts([]);
  }, [location.pathname]);
  return (
    <AlertContext.Provider
      value={{
        alert: addAlert,
      }}
    >
      <ShowAlerts
        alerts={alerts}
        onClose={(id): void => removeAlert(id)}
      />
      {children}
    </AlertContext.Provider>
  );
};
