import { useEffect, useRef } from 'react';
import { FEEDBACK_DISMISS_DELAY_MS } from '@/shared/constants';
import { type IconName } from '@/app/config';
import { Modal } from './modal';

export function FeedbackDialog({
  title,
  description,
  icon = 'check',
  onClose,
}: {
  title: string;
  description: string;
  icon?: IconName;
  onClose: () => void;
}): JSX.Element {
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const timer = window.setTimeout(() => close.current(), FEEDBACK_DISMISS_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <Modal title={title} icon={icon} onClose={onClose} variant="feedback" showCloseButton={false}>
      <p role="status" className="text-center text-xs leading-5 text-tableHeading">
        {description}
      </p>
    </Modal>
  );
}
