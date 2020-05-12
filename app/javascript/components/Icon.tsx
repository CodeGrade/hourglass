import React from 'react';
import { IconType } from 'react-icons';
import { AiOutlineLoading } from 'react-icons/ai';

// TODO move here
import { ICON_SIZE } from '@hourglass/constants';
import './Icon.css';

interface IconProps {
  I: IconType;
  className?: string;
}

const Icon: React.FC<IconProps> = (props) => {
  const {
    I,
    className = '',
  } = props;
  const spin = I === AiOutlineLoading;
  const spinClass = spin ? 'icon-spin' : '';
  const allClasses = `${className} ${spinClass}`;
  return (
    <span className={allClasses}>
      <I size={ICON_SIZE} />
    </span>
  );
};

export default Icon;
