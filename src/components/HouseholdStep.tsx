"use client";

import type { HouseholdData } from "@/types/citizen";
import { SectionCard, FormRow, InputField, SelectField } from "@/components/ui";
import {
  HOUSE_TYPE_LABELS,
  CONSTRUCTION_TYPE_LABELS,
  ELECTRICITY_SOURCE_LABELS,
  WATER_SOURCE_LABELS,
  SANITATION_LABELS,
  INTERNET_ACCESS_LABELS,
  INCOME_BAND_LABELS,
  POVERTY_CLASS_LABELS,
} from "@/constants";

type HouseholdStepProps = {
  household: HouseholdData;
  onChange: <K extends keyof HouseholdData>(
    key: K,
    value: HouseholdData[K],
  ) => void;
};

export function HouseholdStep({ household, onChange }: HouseholdStepProps) {
  return (
    <div>
      <SectionCard
        title="Household Information"
        description="Housing and living conditions details"
      >
        <FormRow>
          <SelectField
            label="House Type"
            value={household.house_type}
            onChange={(v) => onChange("house_type", v)}
            options={Object.entries(HOUSE_TYPE_LABELS).map(
              ([value, label]) => ({ value, label }),
            )}
            required
          />
          <SelectField
            label="Construction Type"
            value={household.construction_type}
            onChange={(v) => onChange("construction_type", v)}
            options={Object.entries(CONSTRUCTION_TYPE_LABELS).map(
              ([value, label]) => ({ value, label }),
            )}
            required
          />
          <InputField
            label="Room Count"
            value={String(household.room_count)}
            onChange={(v) => onChange("room_count", Number(v))}
            type="number"
            required
          />
        </FormRow>
      </SectionCard>
      <SectionCard
        title="Utilities & Services"
        description="Access to basic utilities and services"
      >
        <FormRow>
          <SelectField
            label="Electricity Source"
            value={household.electricity_source}
            onChange={(v) => onChange("electricity_source", v)}
            options={Object.entries(ELECTRICITY_SOURCE_LABELS).map(
              ([value, label]) => ({ value, label }),
            )}
            required
          />
          <SelectField
            label="Water Source"
            value={household.water_source}
            onChange={(v) => onChange("water_source", v)}
            options={Object.entries(WATER_SOURCE_LABELS).map(
              ([value, label]) => ({ value, label }),
            )}
            required
          />
        </FormRow>
        <FormRow>
          <SelectField
            label="Sanitation"
            value={household.sanitation}
            onChange={(v) => onChange("sanitation", v)}
            options={Object.entries(SANITATION_LABELS).map(
              ([value, label]) => ({ value, label }),
            )}
            required
          />
          <SelectField
            label="Internet Access"
            value={household.internet_access}
            onChange={(v) => onChange("internet_access", v)}
            options={Object.entries(INTERNET_ACCESS_LABELS).map(
              ([value, label]) => ({ value, label }),
            )}
            required
          />
        </FormRow>
      </SectionCard>

      <SectionCard
        title="Financial Status"
        description="Income and economic classification"
      >
        <FormRow>
          <div className="mb-4">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={household.has_bank_account}
                onChange={(e) =>
                  onChange("has_bank_account", e.target.checked)
                }
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Has Bank Account
              </span>
            </label>
          </div>
        </FormRow>
        <FormRow>
          <SelectField
            label="Monthly Income Band"
            value={household.monthly_income_band}
            onChange={(v) => onChange("monthly_income_band", v)}
            options={Object.entries(INCOME_BAND_LABELS).map(
              ([value, label]) => ({ value, label }),
            )}
            required
          />
          <SelectField
            label="Poverty Classification"
            value={household.poverty_class}
            onChange={(v) => onChange("poverty_class", v)}
            options={Object.entries(POVERTY_CLASS_LABELS).map(
              ([value, label]) => ({ value, label }),
            )}
            required
          />
        </FormRow>
      </SectionCard>
    </div>
  );
}
