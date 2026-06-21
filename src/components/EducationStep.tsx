'use client';

import type { EducationData } from '@/types/citizen';
import {
  STUDENT_LEVEL_LABELS,
  INSTITUTION_TYPE_LABELS,
  SCHOLARSHIP_TYPE_LABELS,
} from '@/constants';
import { SectionCard, FormRow, InputField, SelectField } from '@/components/ui';

type EducationStepProps = {
  education: EducationData;
  onChange: <K extends keyof EducationData>(key: K, value: EducationData[K]) => void;
};

export function EducationStep({ education, onChange }: EducationStepProps) {
  return (
    <div>
      <SectionCard
        title="Education Information"
        description="Record educational background"
      >
        <FormRow>
          <SelectField
            label="Education Level"
            value={education.level}
            onChange={(v) => onChange('level', v)}
            options={Object.entries(STUDENT_LEVEL_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
            required
          />
          <InputField
            label="Institution Name"
            value={education.institution_name}
            onChange={(v) => onChange('institution_name', v)}
            placeholder="e.g. Tribhuvan University"
          />
          <SelectField
            label="Institution Type"
            value={education.institution_type}
            onChange={(v) => onChange('institution_type', v)}
            options={Object.entries(INSTITUTION_TYPE_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
          />
        </FormRow>

        <FormRow>
          <InputField
            label="Study Location"
            value={education.study_location}
            onChange={(v) => onChange('study_location', v)}
            placeholder="e.g. Kathmandu, Nepal"
          />
        </FormRow>
      </SectionCard>

      <SectionCard
        title="Dropout Status"
        description="If the individual dropped out of education"
      >
        <div className="mb-4">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={education.is_dropout}
              onChange={(e) => onChange('is_dropout', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Has Dropped Out</span>
          </label>
        </div>

        {education.is_dropout && (
          <FormRow>
            <InputField
              label="Dropout Reason"
              value={education.dropout_reason}
              onChange={(v) => onChange('dropout_reason', v)}
              placeholder="e.g. Financial constraints"
            />
            <InputField
              label="Dropout Date"
              value={education.dropout_date}
              onChange={(v) => onChange('dropout_date', v)}
              type="date"
            />
          </FormRow>
        )}
      </SectionCard>

      <SectionCard
        title="Scholarship Information"
        description="If the individual receives any scholarship"
      >
        <div className="mb-4">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={education.has_scholarship}
              onChange={(e) => onChange('has_scholarship', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Receives Scholarship</span>
          </label>
        </div>

        {education.has_scholarship && (
          <FormRow>
            <SelectField
              label="Scholarship Type"
              value={education.scholarship_type}
              onChange={(v) => onChange('scholarship_type', v)}
              options={Object.entries(SCHOLARSHIP_TYPE_LABELS).map(([value, label]) => ({
                value,
                label,
              }))}
            />
            <InputField
              label="Scholarship Provider"
              value={education.scholarship_provider}
              onChange={(v) => onChange('scholarship_provider', v)}
              placeholder="e.g. Government of Nepal"
            />
          </FormRow>
        )}
      </SectionCard>
    </div>
  );
}
