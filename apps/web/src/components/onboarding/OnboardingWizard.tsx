'use client';

import {
  type CatalogResponse,
  checkDisplayName,
  checkProfile,
  compareSeniority,
  DISPLAY_NAME_LIMITS,
  type MeResponse,
  normalizeDisplayName,
  type Seniority,
  STACK_LIMITS,
  type UpdateProfileRequest,
} from '@cv-rush/contracts';
import { useTranslations } from 'next-intl';
import { type FormEvent, useEffect, useId, useRef, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { useErrorText, useProfileLabels } from './labels';
import { StackPicker } from './StackPicker';

const STEPS = ['name', 'seniority', 'role', 'stack'] as const;
type Step = (typeof STEPS)[number];

function stepForError(error: unknown): Step {
  if (!(error instanceof ApiError)) return 'stack';
  if (error.code.startsWith('DISPLAY_NAME_')) return 'name';
  if (error.code === 'PROFILE_ROLE_UNKNOWN' || error.code === 'PROFILE_SENIORITY_NOT_ALLOWED') {
    return 'role';
  }
  return 'stack';
}

interface OnboardingWizardProps {
  catalog: CatalogResponse;
  /** Edit mode: the current profile, updated with PATCH instead of created. */
  initial?: MeResponse;
  onDone: (me: MeResponse) => void;
  onCancel?: () => void;
}

/**
 * Light onboarding in four steps: name, seniority, role, stack. Rules are checked here for
 * instant feedback with the same functions the API applies; the API has the final word.
 */
export function OnboardingWizard({ catalog, initial, onDone, onCancel }: OnboardingWizardProps) {
  const t = useTranslations('onboarding');
  const tErrors = useTranslations('errors');
  const labels = useProfileLabels(catalog);
  const errorText = useErrorText(catalog);
  const nameId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const movedRef = useRef(false);

  const [step, setStep] = useState<Step>('name');
  const [displayName, setDisplayName] = useState(initial?.developer.displayName ?? '');
  const [seniority, setSeniority] = useState<Seniority | undefined>(initial?.profile.seniority);
  const [roleId, setRoleId] = useState<string | undefined>(initial?.profile.roleId);
  const [technologyIds, setTechnologyIds] = useState<string[]>(
    initial?.profile.technologyIds ?? [],
  );
  const [nameTouched, setNameTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<{ step: Step; text: string } | null>(null);

  // Move focus to the new step's heading so keyboard and screen-reader users follow along.
  useEffect(() => {
    if (movedRef.current) headingRef.current?.focus();
    movedRef.current = true;
  }, [step]);

  const role = catalog.roles.find((r) => r.id === roleId);
  const roleAvailable = (r: CatalogResponse['roles'][number]) =>
    !r.minSeniority || !seniority || compareSeniority(seniority, r.minSeniority) >= 0;
  const nameIssue = checkDisplayName(normalizeDisplayName(displayName));
  const profileIssues =
    role && seniority ? checkProfile(catalog, { seniority, roleId: role.id, technologyIds }) : [];
  const valid: Record<Step, boolean> = {
    name: nameIssue === null,
    seniority: seniority !== undefined,
    role: role !== undefined && roleAvailable(role),
    stack: role !== undefined && seniority !== undefined && profileIssues.length === 0,
  };
  const index = STEPS.indexOf(step);
  const isLast = index === STEPS.length - 1;

  const go = (next: Step) => {
    setServerError(null);
    setStep(next);
  };

  const chooseRole = (id: string) => {
    const next = catalog.roles.find((r) => r.id === id);
    if (!next) return;
    setRoleId(id);
    // Keep the technologies the new role also accepts.
    const accepted = new Set([...next.coreCategoryIds, ...next.allowedCategoryIds]);
    const categoryOf = new Map(catalog.technologies.map((tech) => [tech.id, tech.categoryId]));
    setTechnologyIds((ids) => ids.filter((tid) => accepted.has(categoryOf.get(tid) ?? '')));
  };

  const changes = (): UpdateProfileRequest => {
    if (!initial) return {};
    const patch: UpdateProfileRequest = {};
    if (normalizeDisplayName(displayName) !== initial.developer.displayName) {
      patch.displayName = displayName;
    }
    if (seniority !== initial.profile.seniority) patch.seniority = seniority;
    if (roleId !== initial.profile.roleId) patch.roleId = roleId;
    if (technologyIds.join() !== initial.profile.technologyIds.join()) {
      patch.technologyIds = technologyIds;
    }
    return patch;
  };

  const submit = async () => {
    if (!seniority || !roleId) return;
    setSubmitting(true);
    setServerError(null);
    try {
      if (initial) {
        const patch = changes();
        onDone(Object.keys(patch).length > 0 ? await api.updateProfile(patch) : initial);
      } else {
        onDone(await api.createDeveloper({ displayName, seniority, roleId, technologyIds }));
      }
    } catch (error) {
      if (error instanceof ApiError && error.code === 'DEVELOPER_ALREADY_EXISTS') {
        // Created meanwhile (another tab): continue with that profile.
        onDone(await api.me());
        return;
      }
      const target = stepForError(error);
      setServerError({ step: target, text: errorText(error) });
      setStep(target);
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (step === 'name') setNameTouched(true);
    if (!valid[step] || submitting) return;
    if (isLast) void submit();
    else go(STEPS[index + 1] as Step);
  };

  const headings: Record<Step, string> = {
    name: t('name.label'),
    seniority: t('seniority.label'),
    role: t('role.label'),
    stack: t('stack.label'),
  };

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold tracking-wide text-accent uppercase">
          {initial ? t('editTitle') : t('title')}
        </p>
        {!initial && step === 'name' && <p className="text-muted">{t('intro')}</p>}
        <div className="flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface" aria-hidden="true">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${((index + 1) / STEPS.length) * 100}%` }}
            />
          </div>
          <p className="text-sm text-muted">
            {t('progress', { current: index + 1, total: STEPS.length })}
          </p>
        </div>
      </header>

      <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold sm:text-3xl">
        {step === 'name' ? <label htmlFor={nameId}>{headings.name}</label> : headings[step]}
      </h1>

      {step === 'name' && (
        <div className="flex flex-col gap-2">
          <p id={`${nameId}-hint`} className="text-muted">
            {t('name.hint')}
          </p>
          <input
            id={nameId}
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            onBlur={() => setNameTouched(displayName.trim() !== '')}
            placeholder={t('name.placeholder')}
            autoComplete="nickname"
            maxLength={DISPLAY_NAME_LIMITS.max + 8}
            aria-describedby={`${nameId}-hint ${nameId}-error`}
            aria-invalid={nameTouched && nameIssue !== null}
            className="min-h-12 rounded-lg border border-border bg-bg px-4 text-lg"
            autoFocus
          />
          <p id={`${nameId}-error`} className="min-h-6 text-sm text-danger" aria-live="polite">
            {nameTouched && nameIssue
              ? tErrors(nameIssue, { min: DISPLAY_NAME_LIMITS.min, max: DISPLAY_NAME_LIMITS.max })
              : null}
          </p>
        </div>
      )}

      {step === 'seniority' && (
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 text-muted">{t('seniority.hint')}</legend>
          <div className="flex flex-wrap gap-2">
            {catalog.seniorities.map((value) => (
              <ChoiceChip
                key={value}
                name="seniority"
                checked={seniority === value}
                onChange={() => setSeniority(value)}
              >
                {labels.seniority(value)}
              </ChoiceChip>
            ))}
          </div>
        </fieldset>
      )}

      {step === 'role' && (
        <fieldset className="flex flex-col gap-3">
          <legend className="sr-only">{headings.role}</legend>
          <div className="flex flex-wrap gap-2">
            {catalog.roles.map((r) => (
              <ChoiceChip
                key={r.id}
                name="role"
                checked={roleId === r.id}
                disabled={!roleAvailable(r)}
                onChange={() => chooseRole(r.id)}
              >
                {r.label}
                {r.minSeniority && !roleAvailable(r) && (
                  <span className="ml-2 text-xs">
                    {t('role.minSeniority', { seniority: labels.seniority(r.minSeniority) })}
                  </span>
                )}
              </ChoiceChip>
            ))}
          </div>
        </fieldset>
      )}

      {step === 'stack' && role && (
        <>
          <p className="text-muted">{t('stack.hint', { max: STACK_LIMITS.max })}</p>
          <StackPicker
            catalog={catalog}
            role={role}
            technologyIds={technologyIds}
            onChange={setTechnologyIds}
          />
          <p className="text-sm text-muted">{t('review.privacy')}</p>
        </>
      )}

      {serverError && serverError.step === step && (
        <p role="alert" className="rounded-lg border border-danger px-4 py-3 text-danger">
          {serverError.text}
        </p>
      )}

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-border bg-bg/95 px-4 py-4 backdrop-blur sm:mx-0 sm:px-0">
        {index > 0 && (
          <button
            type="button"
            onClick={() => go(STEPS[index - 1] as Step)}
            className="min-h-12 rounded-lg border border-border px-5 hover:border-accent"
          >
            {t('back')}
          </button>
        )}
        {initial && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="min-h-12 rounded-lg px-5 text-muted hover:text-fg"
          >
            {t('cancel')}
          </button>
        )}
        <button
          type="submit"
          disabled={(step !== 'name' && !valid[step]) || submitting}
          className="ml-auto min-h-12 rounded-lg bg-accent px-6 font-semibold text-accent-fg hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isLast ? (initial ? t('review.save') : t('review.create')) : t('next')}
        </button>
      </div>
    </form>
  );
}

function ChoiceChip({
  name,
  checked,
  disabled = false,
  onChange,
  children,
}: {
  name: string;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
  children: React.ReactNode;
}) {
  return (
    <label
      className={`inline-flex min-h-12 cursor-pointer items-center rounded-full border px-5 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent ${
        checked
          ? 'border-accent bg-accent font-semibold text-accent-fg'
          : 'border-border hover:border-accent'
      } ${disabled ? 'cursor-not-allowed opacity-40' : ''}`}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="sr-only"
      />
      {children}
    </label>
  );
}
