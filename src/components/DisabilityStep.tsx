import type {DisabilityData} from "@/types/citizen"
import { FormRow, InputField, SectionCard, SelectField } from "@/components/ui";
import { DISABILITY_TYPE_LABELS } from "@/constants";
type DisabilityStepProps = {
  disability: DisabilityData;
  onChange: <K extends keyof DisabilityData>(key: K, value:DisabilityData[K]) => void;
};

const SEVERITY_LABELS = ['None', 'Mild', 'Moderate', 'Severe', 'Complete'];

export function DisabilityStep({disability, onChange}: DisabilityStepProps) {
  const hasDisability = disability.disability_type !== '';
  return (
    <div>
    <SectionCard
    title="Disability Information"
    description="Optional - record disability status using WHO ICF standards"
    >
    <FormRow>
      <SelectField
      label="Disability Type"
      value={disability.disability_type}
      onChange={(v) => onChange('disability_type', v)}
      options = {[
        {value:'', label:'None / No Disability'},
        ...Object.entries(DISABILITY_TYPE_LABELS).map(([value, label]) => ({
          value,
          label,
        })),
      ]}
      />
      </FormRow>
        {hasDisability && (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                WHO ICF Severity Scores (0–4)
              </label>
              <div className="space-y-4">
                {([
                  { key: 'severity_body', label: 'Body Functions' },
                  { key: 'severity_activity', label: 'Activity' },
                  { key: 'severity_participation', label: 'Participation' },
                ] as const).map(({ key, label }) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">{label}</span>
                      <span className="text-sm font-medium text-blue-700">
                        {SEVERITY_LABELS[disability[key]]} ({disability[key]})
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={4}
                      step={1}
                      value={disability[key]}
                      onChange={(e) => onChange(key, Number(e.target.value))}
                      className="w-full  h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                      <span>0 – None</span>
                      <span>1 – Mild</span>
                      <span>2 – Moderate</span>
                      <span>3 – Severe</span>
                      <span>4 – Complete</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <SectionCard
              title="Disability Certificate"
              description="Certificate details if applicable"
            >
              <FormRow>
                <InputField
                  label="Certificate Number"
                  value={disability.certificate_no}
                  onChange={(v) => onChange('certificate_no', v)}
                  placeholder="e.g. D-12345"
                />
                <InputField
                  label="Issuing Hospital / Authority"
                  value={disability.issuing_hospital}
                  onChange={(v) => onChange('issuing_hospital', v)}
                  placeholder="e.g. Bir Hospital"
                />
                <InputField
                  label="Expiry Date"
                  value={disability.certificate_expiry}
                  onChange={(v) => onChange('certificate_expiry', v)}
                  type="date"
                />
              </FormRow>
            </SectionCard>
          </>
        )}
      </SectionCard>
    </div>
  );
}
