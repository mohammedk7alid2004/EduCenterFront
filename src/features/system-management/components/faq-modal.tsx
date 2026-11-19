import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { usePermission } from '@/infrastructure/auth';
import { useOnline } from '@/shared/hooks';
import { setServerErrors } from '@/shared/utils';
import {
  DetailField,
  ErrorState,
  FeedbackDialog,
  Input,
  LoadingState,
  Modal,
  StatusSwitch,
} from '@/shared/components';
import { FAQ_ENDPOINTS, FAQ_PERMISSIONS, SETTINGS_DIALOG } from '../system-management.constants';
import { useSaveFaq, useSettings } from '../system-management.queries';
import type { FaqDto, FaqValues } from '../system-management.types';
import { ContentLanguage } from './content-panel';
import { SettingsForm, TextArea } from './settings-form';
export function FaqModal({
  id,
  mode,
  onClose,
}: {
  id?: string;
  mode: string;
  onClose: () => void;
}): JSX.Element {
  return id ? (
    <FaqDetails id={id} mode={mode} onClose={onClose} />
  ) : (
    <FaqEditor onClose={onClose} />
  );
}
function FaqDetails({
  id,
  mode,
  onClose,
}: {
  id: string;
  mode: string;
  onClose: () => void;
}): JSX.Element {
  const { t, i18n } = useTranslation();
  const query = useSettings<FaqDto>(FAQ_ENDPOINTS.detail(id));
  const title = t(
    mode === SETTINGS_DIALOG.view ? 'systemManagement.faq.view' : 'systemManagement.faq.edit',
  );
  if (query.isPending || query.error)
    return (
      <Modal title={title} icon="help" size="form" onClose={onClose}>
        {query.isPending ? (
          <LoadingState />
        ) : (
          <ErrorState error={query.error} onRetry={() => void query.refetch()} />
        )}
      </Modal>
    );
  if (mode !== SETTINGS_DIALOG.view) return <FaqEditor faq={query.data} onClose={onClose} />;
  const lang = i18n.language.startsWith('ar') ? 'ar' : 'en';
  return (
    <Modal title={title} icon="help" size="form" onClose={onClose}>
      <dl className="space-y-6">
        {(['question', 'answer'] as const).map((key) => (
          <DetailField key={key} label={t(`systemManagement.faq.${key}`)}>
            <p className="whitespace-pre-wrap">{query.data?.[key][lang] || t('common.noValue')}</p>
          </DetailField>
        ))}
      </dl>
    </Modal>
  );
}
function FaqEditor({ faq, onClose }: { faq?: FaqDto; onClose: () => void }): JSX.Element {
  const { t, i18n } = useTranslation();
  const online = useOnline();
  const mutation = useSaveFaq(faq?.id);
  const can = usePermission();
  const [success, setSuccess] = useState(false);
  const [language, setLanguage] = useState(i18n.language.startsWith('ar') ? 'ar' : 'en');
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FaqValues>({
    defaultValues: {
      isActive: faq?.isActive ?? true,
      questionAr: faq?.question.ar ?? '',
      questionEn: faq?.question.en ?? '',
      answerAr: faq?.answer.ar ?? '',
      answerEn: faq?.answer.en ?? '',
    },
  });
  const title = t(faq ? 'systemManagement.faq.edit' : 'systemManagement.faq.create');
  const question = language === 'ar' ? 'questionAr' : 'questionEn';
  const answer = language === 'ar' ? 'answerAr' : 'answerEn';
  if (success)
    return (
      <FeedbackDialog title={title} description={t('systemManagement.saved')} onClose={onClose} />
    );
  return (
    <Modal title={title} icon="help" size="form" pending={mutation.isPending} onClose={onClose}>
      <SettingsForm
        pending={mutation.isPending}
        error={mutation.error}
        onClose={onClose}
        onSubmit={handleSubmit((values) => {
          if (!values.questionAr.trim() && !values.questionEn.trim()) {
            setError(question, { message: t('validation.required') });
            return;
          }
          if (!values.answerAr.trim() && !values.answerEn.trim()) {
            setError(answer, { message: t('validation.required') });
            return;
          }
          for (const key of ['questionAr', 'questionEn'] as const)
            if (values[key].length > 500) {
              setLanguage(key.endsWith('Ar') ? 'ar' : 'en');
              setError(key, { message: t('validation.maxLength', { count: 500 }) });
              return;
            }
          if (online)
            mutation.mutate(values, {
              onSuccess: () => setSuccess(true),
              onError: (error) => setServerErrors(error, setError),
            });
        })}
      >
        <ContentLanguage value={language} onChange={setLanguage} />
        <Input
          key={question}
          {...register(question)}
          label={t('systemManagement.faq.question')}
          requiredAsterisk
          error={errors[question]?.message}
          dir={language === 'ar' ? 'rtl' : 'ltr'}
        />
        <TextArea
          key={answer}
          {...register(answer)}
          id="faq-answer"
          label={t('systemManagement.faq.answer')}
          rows={5}
          error={errors[answer]?.message}
          dir={language === 'ar' ? 'rtl' : 'ltr'}
        />
        <div className="flex h-11 items-center justify-between rounded-full border border-muted/60 px-3 sm:w-1/2">
          <span className="text-sm">{t('common.status')}</span>
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <StatusSwitch
                active={field.value}
                disabled={!can(FAQ_PERMISSIONS.status)}
                onChange={() => field.onChange(!field.value)}
              />
            )}
          />
        </div>
      </SettingsForm>
    </Modal>
  );
}
