import { useEffect, useRef } from 'react';
import { FEEDBACK_DISMISS_DELAY_MS } from '@/config';
import { Modal } from './modal';

export function FeedbackDialog({
  title,
  description,
  onClose,
}: {
  title: string;
  description: string;
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
    <Modal title={title} icon="check" onClose={onClose} variant="feedback" showCloseButton={false}>
      <p role="status" className="text-center text-xs leading-5 text-tableHeading">
        {description}
      </p>
    </Modal>
  );
}
