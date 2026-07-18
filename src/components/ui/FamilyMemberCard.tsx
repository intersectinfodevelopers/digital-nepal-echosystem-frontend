import type { FamilyMember } from "@/types/citizen";
import { InputField } from "./InputField";

type FamilyMemberCardProps = {
  member: FamilyMember;
  onChange: (updates: Partial<FamilyMember>) => void;
  onRemove: () => void;
  showRemove?: boolean;
};

export function FamilyMemberCard({
  member,
  onChange,
  onRemove,
  showRemove = false,
}: FamilyMemberCardProps) {
  return (
    <div className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      {showRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-red-50 hover:text-red-600"
        >
          ✕
        </button>
      )}

      <h3 className="mb-5 text-base font-semibold text-gray-900">
        Family Member
      </h3>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <InputField
          label="Name (Nepali)"
          value={member.name_np}
          onChange={(value) => onChange({ name_np: value })}
          required
        />

        <InputField
          label="Name (English)"
          value={member.name_en}
          onChange={(value) => onChange({ name_en: value })}
          required
        />

        <div className="md:col-span-2">
          <InputField
            label="Citizenship Number"
            value={member.citizenship_number}
            onChange={(value) =>
              onChange({ citizenship_number: value })
            }
          />
        </div>
      </div>
    </div>
  );
}