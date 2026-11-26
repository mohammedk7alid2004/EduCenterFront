import { useSearchParams } from 'react-router-dom';
import { LIST_PARAMS } from '@/shared/constants';
import { useDebouncedValue, useListControls } from '@/shared/hooks';
import { CONTACT_FILTER_PARAMS } from '../constants';
export function useContactControls() {
  const controls = useListControls();
  const [params, setParams] = useSearchParams();
  const email = params.get(CONTACT_FILTER_PARAMS.email) ?? '';
  const phone = params.get(CONTACT_FILTER_PARAMS.phone) ?? '';
  const subject = params.get(CONTACT_FILTER_PARAMS.subject) ?? '';
  const debouncedEmail = useDebouncedValue(email, 400);
  const debouncedPhone = useDebouncedValue(phone, 400);
  const debouncedSubject = useDebouncedValue(subject, 400);
  const filters = {
    name: controls.filters.name,
    pageNumber: controls.page,
    pageSize: controls.pageSize,
    email: debouncedEmail || undefined,
    phone: debouncedPhone || undefined,
    subject: debouncedSubject || undefined,
  };
  function update(key: 'email' | 'phone' | 'subject', value: string) {
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (value) next.set(CONTACT_FILTER_PARAMS[key], value);
      else next.delete(CONTACT_FILTER_PARAMS[key]);
      next.delete(LIST_PARAMS.page);
      return next;
    });
  }
  function clear() {
    setParams((current) => {
      const next = new URLSearchParams(current);
      Object.values(CONTACT_FILTER_PARAMS).forEach((key) => next.delete(key));
      next.delete(LIST_PARAMS.page);
      return next;
    });
  }
  return { controls, filters, email, phone, subject, update, clear };
}
