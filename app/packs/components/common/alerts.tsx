import React, {
  useState,
  useEffect,
  useContext,
  useMemo,
  useRef,
} from 'react';
import { AlertProps, Toast, Button } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import './alerts.scss';
import { DateTime } from 'luxon';
import Icon from '@student/exams/show/components/Icon';
import { FaCopy } from 'react-icons/fa';

interface HGAlert {
  title?: string;
  message?: string | JSX.Element;
  variant: AlertProps['variant'];
  autohide?: boolean;
  copyButton?: boolean;
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
    copyButton = false,
  } = alert;
  const [show, setShow] = useState(true);
  const bodyRef = useRef<HTMLDivElement>();
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
        {copyButton && (
          <Button
            size="sm"
            className="p-0"
            variant={variant}
            onClick={async () => {
              const text = bodyRef.current.innerText;
              await navigator.clipboard.writeText(text);
            }}
          >
            <Icon I={FaCopy} />
          </Button>
        )}
      </Toast.Header>
      {message && (
        <Toast.Body><div ref={bodyRef}>{message}</div></Toast.Body>
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
