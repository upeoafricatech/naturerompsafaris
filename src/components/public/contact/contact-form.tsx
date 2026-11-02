'use client';

import * as React from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import * as z from 'zod';

import { useAppForm } from '@/components/ui/tanstack-form';
import { CountryCombobox } from '@/components/public/contact/country-combobox';
import { DestinationsMultiSelect } from '@/components/public/contact/destinations-multi-select';
import { ContactReferralStep } from '@/components/public/contact/contact-referral-card';
import { Icons } from '@/components/icons';
import { getCountryDialCode } from '@/constants/world-countries';
import { TravelDatePicker } from '@/components/ui/travel-date-picker';
import { submitEnquiry } from '@/features/contact/api/service';
import type { EnquiryType } from '@/features/contact/api/types';
import { TurnstileField, useTurnstileGate } from '@/components/public/turnstile-field';
import { enquiryThankYouPath } from '@/lib/public/enquiry-thank-you';
import { localePath } from '@/lib/public/locale-path';
import { formatTravelDateRange } from '@/lib/travel-date-utils';
import { cn } from '@/lib/utils';

type ContactFormProps = {
  locale: string;
  sidebar?: React.ReactNode;
  sourcePath?: string;
};

const ENQUIRY_TABS: Array<{ description: string; id: EnquiryType; label: string }> = [
  {
    description:
      'Tell us your destinations, travel dates, and budget. Our safari experts will send a tailored proposal.',
    id: 'safari-quote',
    label: 'Safari Quote'
  },
  {
    description:
      'Quick questions, feedback, media enquiries, or anything that does not need a full safari quote.',
    id: 'general',
    label: 'General Contact'
  },
  {
    description:
      'Follow up on an existing booking, request changes, or ask about a reservation already in progress.',
    id: 'other',
    label: 'Other Enquiry'
  }
];

const GENERAL_TOPICS = [
  'General',
  'Feedback',
  'Media or partnership',
  'Travel information',
  'Other'
] as const;

const TRAVEL_PLANNING_OPTIONS = [
  {
    label: 'I need more information to decide, if this is my next trip',
    value: 'need-more-info'
  },
  {
    label: 'I am going on this trip and Deciding How to Book',
    value: 'deciding-how-to-book'
  },
  {
    label: 'I have booked flights and need help with experiences and or where to stay',
    value: 'booked-flights'
  }
] as const;

const TRIP_TYPE_OPTIONS = [
  { label: 'Nature and Wildlife', value: 'nature-wildlife' },
  { label: 'Family Holiday', value: 'family-holiday' },
  { label: 'Honeymoon', value: 'honeymoon' },
  { label: 'Beach Holiday', value: 'beach-holiday' },
  { label: 'Culture Safari', value: 'culture-safari' }
] as const;

const BUDGET_TIER_OPTIONS = [
  { label: 'Budget', value: 'budget' },
  { label: 'Economy', value: 'economy' },
  { label: 'Luxury', value: 'luxury' },
  { label: 'High End', value: 'high-end' }
] as const;

function stripNonDigits(value: string) {
  return value.replace(/\D/g, '');
}

function formatUsdBudget(amount: string) {
  return `USD ${Number(amount).toLocaleString('en-US')}`;
}

const safariQuoteSchema = z.object({
  adults: z
    .number({ message: 'Number of adults is required' })
    .int()
    .min(1, 'At least one adult is required'),
  budget: z.string().min(1, 'Budget amount is required').regex(/^\d+$/, 'Enter numbers only'),
  budgetTier: z.string().min(1, 'Select a budget preference'),
  children: z.number().int().min(0),
  country: z.string().min(2, 'Country is required'),
  destinations: z.string().min(2, 'Select Kenya, Tanzania, or Kenya & Tanzania'),
  email: z.email('Enter a valid email'),
  infants: z.number().int().min(0),
  message: z.string().optional(),
  name: z.string().min(2, 'Name is required'),
  phone: z.string().optional(),
  referralSource: z.string().optional(),
  travelEndDate: z.string().min(1, 'Select an end date'),
  travelPlanningStage: z.string().min(1, 'Select your travel planning stage'),
  travelStartDate: z.string().min(1, 'Select a start date'),
  tripType: z.string().min(1, 'Select a trip type')
});

const generalSchema = z.object({
  email: z.email('Enter a valid email'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  name: z.string().min(2, 'Name is required'),
  phone: z.string().optional(),
  topic: z.string().min(1, 'Select a topic')
});

const otherSchema = z.object({
  bookingReference: z.string().optional(),
  email: z.email('Enter a valid email'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  name: z.string().min(2, 'Name is required'),
  phone: z.string().optional()
});

/** Phone is optional; a value that is only the auto-filled dial code counts as empty. */
function submittedPhone(phone?: string, country?: string) {
  const trimmed = phone?.trim();
  if (!trimmed) return undefined;
  const dialCode = country ? getCountryDialCode(country).trim() : '';
  return dialCode && trimmed === dialCode ? undefined : trimmed;
}

const fieldClassName = 'brand-contact-field mt-1.5';

const labelClassName = 'block text-sm font-bold text-[var(--brand-heading)]';

function FormStep({
  children,
  step,
  title
}: {
  children: React.ReactNode;
  step: number;
  title: string;
}) {
  return (
    <section className='brand-contact-step'>
      <div className='mb-5 flex items-center gap-3'>
        <span aria-hidden className='brand-contact-step-number'>
          {step}
        </span>
        <h3 className='brand-contact-step-title'>{title}</h3>
      </div>
      {children}
    </section>
  );
}

function FormField({
  children,
  className,
  label
}: {
  children: React.ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <label className={cn(labelClassName, className)}>
      {label}
      {children}
    </label>
  );
}

function CounterStepper({
  min = 0,
  onBlur,
  onChange,
  value
}: {
  min?: number;
  onBlur?: () => void;
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <div className='brand-traveler-stepper'>
      <button
        aria-label='Decrease'
        className='brand-traveler-stepper-btn'
        disabled={value <= min}
        onBlur={onBlur}
        onClick={() => onChange(Math.max(min, value - 1))}
        type='button'
      >
        <Icons.minus className='h-4 w-4' />
      </button>
      <span aria-live='polite' className='brand-traveler-stepper-value'>
        {value}
      </span>
      <button
        aria-label='Increase'
        className='brand-traveler-stepper-btn'
        onBlur={onBlur}
        onClick={() => onChange(value + 1)}
        type='button'
      >
        <Icons.add className='h-4 w-4' />
      </button>
    </div>
  );
}

function TravelerCategoryCard({
  ageRange,
  icon: Icon,
  label,
  min = 0,
  onBlur,
  onChange,
  value
}: {
  ageRange: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  min?: number;
  onBlur?: () => void;
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <div className='brand-traveler-card'>
      <div className='brand-traveler-card-icon'>
        <Icon className='h-8 w-8' />
      </div>
      <p className='brand-traveler-card-label'>{label}</p>
      <p className='brand-traveler-card-age'>{ageRange}</p>
      <CounterStepper min={min} onBlur={onBlur} onChange={onChange} value={value} />
    </div>
  );
}

function RadioOptionList({
  name,
  onBlur,
  onChange,
  options,
  value
}: {
  name: string;
  onBlur?: () => void;
  onChange: (value: string) => void;
  options: ReadonlyArray<{ label: string; value: string }>;
  value: string;
}) {
  return (
    <fieldset className='brand-contact-radio-list'>
      <legend className='sr-only'>{name}</legend>
      {options.map((option) => (
        <label className='brand-contact-radio-option' key={option.value}>
          <input
            checked={value === option.value}
            className='brand-contact-radio-input'
            name={name}
            onBlur={onBlur}
            onChange={() => onChange(option.value)}
            type='radio'
            value={option.value}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </fieldset>
  );
}

export function ContactForm({ locale, sidebar, sourcePath }: ContactFormProps) {
  const [activeType, setActiveType] = React.useState<EnquiryType>('safari-quote');
  const [submitStatus, setSubmitStatus] = React.useState<'idle' | 'error'>('idle');

  const activeTab = ENQUIRY_TABS.find((tab) => tab.id === activeType) ?? ENQUIRY_TABS[0];

  return (
    <div className='brand-contact-layout'>
      <div className='brand-contact-primary'>
        <div className='brand-contact-tabs'>
          <div className='border-b border-[var(--brand-line)] pb-1'>
            <div
              aria-label='Enquiry type'
              className='flex flex-nowrap gap-1.5 sm:gap-2'
              role='tablist'
            >
              {ENQUIRY_TABS.map((tab) => (
                <button
                  aria-selected={activeType === tab.id}
                  className={cn(
                    'min-w-0 flex-1 rounded-[var(--brand-button-radius)] px-2 py-2 text-center text-[11px] font-medium leading-tight transition-colors sm:px-4 sm:py-2.5 sm:text-sm sm:leading-normal',
                    activeType === tab.id
                      ? 'bg-[#5D2411] text-white'
                      : 'border border-[var(--brand-line)] bg-white text-[var(--brand-muted)] hover:border-[var(--brand-primary)]/30 hover:text-[var(--brand-heading)]'
                  )}
                  key={tab.id}
                  onClick={() => {
                    setActiveType(tab.id);
                    setSubmitStatus('idle');
                  }}
                  role='tab'
                  type='button'
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className='brand-contact-main'>
          <p className='text-sm leading-7 text-[var(--brand-muted)]'>{activeTab.description}</p>

          <ContactFormBody
            activeType={activeType}
            key={activeType}
            locale={locale}
            onSubmitStatusChange={setSubmitStatus}
            sourcePath={sourcePath}
            submitStatus={submitStatus}
          />
        </div>
      </div>

      {sidebar ? <div className='brand-contact-sidebar'>{sidebar}</div> : null}
    </div>
  );
}

function ContactFormBody({
  activeType,
  locale,
  onSubmitStatusChange,
  sourcePath,
  submitStatus
}: {
  activeType: EnquiryType;
  locale: string;
  onSubmitStatusChange: (status: 'idle' | 'error') => void;
  sourcePath?: string;
  submitStatus: 'idle' | 'error';
}) {
  const router = useRouter();
  const turnstile = useTurnstileGate();

  const mutation = useMutation({
    mutationFn: submitEnquiry,
    onSuccess: () => {
      router.push(enquiryThankYouPath(locale, 'contact'));
    },
    onError: () => {
      onSubmitStatusChange('error');
      turnstile.resetTurnstile();
    }
  });

  const form = useAppForm({
    defaultValues: {
      adults: 2,
      bookingReference: '',
      budget: '',
      budgetTier: '',
      children: 0,
      country: '',
      destinations: '',
      email: '',
      infants: 0,
      message: '',
      name: '',
      phone: '',
      referralSource: '',
      topic: '',
      travelEndDate: '',
      travelPlanningStage: '',
      travelStartDate: '',
      tripType: ''
    },
    validators: {
      onSubmit: (activeType === 'safari-quote'
        ? safariQuoteSchema
        : activeType === 'general'
          ? generalSchema
          : otherSchema) as any
    },
    onSubmit: ({ value }) => {
      onSubmitStatusChange('idle');

      const preferredDates =
        activeType === 'safari-quote'
          ? formatTravelDateRange(value.travelStartDate, value.travelEndDate)
          : undefined;

      const travelers =
        activeType === 'safari-quote' ? value.adults + value.children + value.infants : undefined;

      mutation.mutate({
        adults: activeType === 'safari-quote' ? value.adults : undefined,
        bookingReference: value.bookingReference || undefined,
        budget: activeType === 'safari-quote' ? formatUsdBudget(value.budget) : undefined,
        budgetTier: activeType === 'safari-quote' ? value.budgetTier : undefined,
        children: activeType === 'safari-quote' ? value.children : undefined,
        country: activeType === 'safari-quote' ? value.country : undefined,
        destinations: activeType === 'safari-quote' ? value.destinations : undefined,
        email: value.email,
        enquiryType: activeType,
        infants: activeType === 'safari-quote' ? value.infants : undefined,
        locale,
        message: value.message || undefined,
        name: value.name,
        phone: submittedPhone(value.phone, value.country),
        preferredDates,
        referralSource:
          activeType === 'safari-quote' ? value.referralSource || undefined : undefined,
        travelEndDate: activeType === 'safari-quote' ? value.travelEndDate : undefined,
        travelPlanningStage: activeType === 'safari-quote' ? value.travelPlanningStage : undefined,
        travelStartDate: activeType === 'safari-quote' ? value.travelStartDate : undefined,
        travelers,
        tripType: activeType === 'safari-quote' ? value.tripType : undefined,
        sourcePath: sourcePath || (typeof window !== 'undefined' ? window.location.pathname : ''),
        topic: activeType === 'general' ? value.topic : undefined,
        turnstileToken: turnstile.token ?? undefined
      });
    }
  });

  const [submitHovered, setSubmitHovered] = React.useState(false);

  const submitLabel =
    activeType === 'safari-quote'
      ? 'Help Me Plan'
      : activeType === 'general'
        ? 'Send Message'
        : 'Send Enquiry';

  const showSubmitHover = submitHovered && !mutation.isPending && activeType === 'safari-quote';

  return (
    <>
      <form.AppForm>
        <form.Form className='mx-0 mt-8 gap-0 p-0'>
          {activeType === 'safari-quote' ? (
            <>
              <FormStep step={1} title='Tell us about yourself'>
                <div className='grid gap-5 md:grid-cols-2'>
                  <form.AppField name='name'>
                    {(field) => (
                      <FormField label='Full name:'>
                        <input
                          className={fieldClassName}
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                          required
                          value={field.state.value}
                        />
                        <field.FieldError />
                      </FormField>
                    )}
                  </form.AppField>

                  <form.AppField name='email'>
                    {(field) => (
                      <FormField label='Email:'>
                        <input
                          className={fieldClassName}
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                          required
                          type='email'
                          value={field.state.value}
                        />
                        <field.FieldError />
                      </FormField>
                    )}
                  </form.AppField>

                  <form.AppField name='country'>
                    {(field) => (
                      <FormField label='Nationality / Country of residence:'>
                        <CountryCombobox
                          onBlur={field.handleBlur}
                          onChange={(country) => {
                            field.handleChange(country);
                            const dialCode = getCountryDialCode(country);
                            if (dialCode) {
                              field.form.setFieldValue('phone', dialCode);
                            }
                          }}
                          value={field.state.value}
                        />
                        <field.FieldError />
                      </FormField>
                    )}
                  </form.AppField>

                  <form.Subscribe selector={(state) => state.values.country}>
                    {(country) => (
                      <form.AppField name='phone'>
                        {(field) => (
                          <FormField label='Phone:'>
                            <input
                              className={fieldClassName}
                              disabled={!country}
                              name={field.name}
                              onBlur={field.handleBlur}
                              onChange={(event) => field.handleChange(event.target.value)}
                              placeholder={country ? '712 345 678' : 'Select nationality first'}
                              type='tel'
                              value={field.state.value}
                            />
                            {!country ? (
                              <p className='mt-1.5 text-xs font-normal text-[var(--brand-muted)]'>
                                Select your nationality above to enter your phone number.
                              </p>
                            ) : null}
                            <field.FieldError />
                          </FormField>
                        )}
                      </form.AppField>
                    )}
                  </form.Subscribe>
                </div>
              </FormStep>

              <FormStep step={2} title='Choose destination'>
                <form.AppField name='destinations'>
                  {(field) => (
                    <FormField label='Countries we offer:'>
                      <DestinationsMultiSelect
                        onChange={field.handleChange}
                        value={field.state.value}
                      />
                      <field.FieldError />
                    </FormField>
                  )}
                </form.AppField>
              </FormStep>

              <FormStep step={3} title='Dates'>
                <form.AppField name='travelStartDate'>
                  {(startField) => (
                    <form.AppField name='travelEndDate'>
                      {(endField) => (
                        <>
                          <TravelDatePicker
                            endDate={endField.state.value}
                            onEndDateChange={(value) => {
                              endField.handleChange(value);
                              endField.handleBlur();
                            }}
                            onStartDateChange={(value) => {
                              startField.handleChange(value);
                              startField.handleBlur();
                            }}
                            startDate={startField.state.value}
                          />
                          <startField.FieldError />
                          <endField.FieldError />
                        </>
                      )}
                    </form.AppField>
                  )}
                </form.AppField>
              </FormStep>

              <FormStep step={4} title='Traveler details'>
                <div className='grid gap-4 sm:grid-cols-3'>
                  <form.AppField name='adults'>
                    {(field) => (
                      <TravelerCategoryCard
                        ageRange='18+ years'
                        icon={Icons.userPlus}
                        label='Adults'
                        min={1}
                        onBlur={field.handleBlur}
                        onChange={field.handleChange}
                        value={field.state.value}
                      />
                    )}
                  </form.AppField>

                  <form.AppField name='children'>
                    {(field) => (
                      <TravelerCategoryCard
                        ageRange='13–17 years'
                        icon={Icons.moodKid}
                        label='Children'
                        onBlur={field.handleBlur}
                        onChange={field.handleChange}
                        value={field.state.value}
                      />
                    )}
                  </form.AppField>

                  <form.AppField name='infants'>
                    {(field) => (
                      <TravelerCategoryCard
                        ageRange='3–12 years'
                        icon={Icons.babyCarriage}
                        label='Infants'
                        onBlur={field.handleBlur}
                        onChange={field.handleChange}
                        value={field.state.value}
                      />
                    )}
                  </form.AppField>
                </div>
                <form.AppField name='adults'>{(field) => <field.FieldError />}</form.AppField>
              </FormStep>

              <FormStep step={5} title='Safari budget preference'>
                <form.Subscribe selector={(state) => state.values.budgetTier}>
                  {(budgetTier) => (
                    <div className={cn('grid gap-4', budgetTier && 'md:grid-cols-2')}>
                      <form.AppField name='budgetTier'>
                        {(field) => (
                          <FormField label='Tier:'>
                            <select
                              className={cn(fieldClassName, 'cursor-pointer')}
                              name={field.name}
                              onBlur={field.handleBlur}
                              onChange={(event) => field.handleChange(event.target.value)}
                              required
                              value={field.state.value}
                            >
                              <option disabled value=''>
                                Select budget tier
                              </option>
                              {BUDGET_TIER_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            <field.FieldError />
                          </FormField>
                        )}
                      </form.AppField>

                      {budgetTier ? (
                        <form.AppField name='budget'>
                          {(field) => (
                            <FormField label='Tour Budget per person (USD):'>
                              <input
                                className={fieldClassName}
                                inputMode='numeric'
                                name={field.name}
                                onBlur={field.handleBlur}
                                onChange={(event) =>
                                  field.handleChange(stripNonDigits(event.target.value))
                                }
                                pattern='[0-9]*'
                                placeholder='e.g. 3500'
                                required
                                type='text'
                                value={field.state.value}
                              />
                              <field.FieldError />
                            </FormField>
                          )}
                        </form.AppField>
                      ) : null}
                    </div>
                  )}
                </form.Subscribe>
              </FormStep>

              <FormStep step={6} title='Where are you in your Travel Planning?'>
                <form.AppField name='travelPlanningStage'>
                  {(field) => (
                    <>
                      <RadioOptionList
                        name='travelPlanningStage'
                        onBlur={field.handleBlur}
                        onChange={field.handleChange}
                        options={TRAVEL_PLANNING_OPTIONS}
                        value={field.state.value}
                      />
                      <field.FieldError />
                    </>
                  )}
                </form.AppField>
              </FormStep>

              <FormStep step={7} title='What kind of trip would you like to Book?'>
                <form.AppField name='tripType'>
                  {(field) => (
                    <>
                      <RadioOptionList
                        name='tripType'
                        onBlur={field.handleBlur}
                        onChange={field.handleChange}
                        options={TRIP_TYPE_OPTIONS}
                        value={field.state.value}
                      />
                      <field.FieldError />
                    </>
                  )}
                </form.AppField>
              </FormStep>

              <FormStep step={8} title='Additional comments'>
                <form.AppField name='message'>
                  {(field) => (
                    <textarea
                      className={cn(fieldClassName, 'min-h-32 resize-y')}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      placeholder='Tell us about your travel style, accommodation preferences, must-see wildlife, or any special requests.'
                      value={field.state.value}
                    />
                  )}
                </form.AppField>
              </FormStep>

              <form.AppField name='referralSource'>
                {(field) => (
                  <ContactReferralStep onChange={field.handleChange} value={field.state.value} />
                )}
              </form.AppField>
            </>
          ) : (
            <>
              <FormStep step={1} title='Tell us about yourself'>
                <div className='grid gap-5 md:grid-cols-2'>
                  <form.AppField name='name'>
                    {(field) => (
                      <FormField label='Full name:'>
                        <input
                          className={fieldClassName}
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                          required
                          value={field.state.value}
                        />
                        <field.FieldError />
                      </FormField>
                    )}
                  </form.AppField>

                  <form.AppField name='email'>
                    {(field) => (
                      <FormField label='Email:'>
                        <input
                          className={fieldClassName}
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                          required
                          type='email'
                          value={field.state.value}
                        />
                        <field.FieldError />
                      </FormField>
                    )}
                  </form.AppField>

                  <form.AppField name='phone'>
                    {(field) => (
                      <FormField label='Phone:'>
                        <input
                          className={fieldClassName}
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                          placeholder='+254 712 345 678 (include country code)'
                          type='tel'
                          value={field.state.value}
                        />
                        <field.FieldError />
                      </FormField>
                    )}
                  </form.AppField>

                  {activeType === 'general' ? (
                    <form.AppField name='topic'>
                      {(field) => (
                        <FormField label='Topic *'>
                          <select
                            className={cn(fieldClassName, 'cursor-pointer')}
                            name={field.name}
                            onBlur={field.handleBlur}
                            onChange={(event) => field.handleChange(event.target.value)}
                            required
                            value={field.state.value}
                          >
                            <option disabled value=''>
                              Select a topic
                            </option>
                            {GENERAL_TOPICS.map((topic) => (
                              <option key={topic} value={topic}>
                                {topic}
                              </option>
                            ))}
                          </select>
                          <field.FieldError />
                        </FormField>
                      )}
                    </form.AppField>
                  ) : null}

                  {activeType === 'other' ? (
                    <form.AppField name='bookingReference'>
                      {(field) => (
                        <FormField label='Booking Reference'>
                          <input
                            className={fieldClassName}
                            name={field.name}
                            onBlur={field.handleBlur}
                            onChange={(event) => field.handleChange(event.target.value)}
                            placeholder='If you have one'
                            value={field.state.value}
                          />
                        </FormField>
                      )}
                    </form.AppField>
                  ) : null}
                </div>
              </FormStep>

              <FormStep step={2} title='Your message'>
                <form.AppField name='message'>
                  {(field) => (
                    <FormField label='Message *'>
                      <textarea
                        className={cn(fieldClassName, 'min-h-32 resize-y')}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        placeholder='How can we help you today?'
                        required
                        value={field.state.value}
                      />
                      <field.FieldError />
                    </FormField>
                  )}
                </form.AppField>
              </FormStep>
            </>
          )}

          <div className='space-y-3 pt-4'>
            <TurnstileField
              onTokenChange={turnstile.setToken}
              resetSignal={turnstile.resetSignal}
            />
            <form.SubmitButton
              className='brand-contact-submit w-full'
              disabled={mutation.isPending || !turnstile.canSubmit}
              onMouseEnter={() => setSubmitHovered(true)}
              onMouseLeave={() => setSubmitHovered(false)}
            >
              {mutation.isPending ? (
                'Sending...'
              ) : showSubmitHover ? (
                <span className='inline-flex items-center gap-2'>
                  Submit Request
                  <Icons.arrowRight className='h-5 w-5' />
                </span>
              ) : (
                submitLabel
              )}
            </form.SubmitButton>
            <p className='text-xs text-[var(--brand-muted)]'>
              No payment is collected on this website. We aim to respond within 24 hours.
            </p>
            {submitStatus === 'error' ? (
              <p className='text-sm text-red-700'>
                {mutation.error instanceof Error
                  ? mutation.error.message
                  : 'Something went wrong. Please try again.'}
              </p>
            ) : null}
          </div>
        </form.Form>
      </form.AppForm>
    </>
  );
}
