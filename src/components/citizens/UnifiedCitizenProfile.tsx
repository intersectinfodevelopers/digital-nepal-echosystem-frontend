"use client";

import type { ReactNode } from "react";
import type { FormState } from "@/components/UnifiedCitizenRegistration";

type Row = [string, string | number | null | undefined];

function Rows({ rows, emptyLabel = "Nothing recorded in this section." }: { rows: Row[]; emptyLabel?: string }) {
  const visible = rows.filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== "");
  if (visible.length === 0) {
    return <p className="text-sm text-gray-400">{emptyLabel}</p>;
  }
  return (
    <dl className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
      {visible.map(([label, value], i) => (
        <div key={`${label}-${i}`} className="min-w-0">
          <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-400">{label}</dt>
          <dd className="break-words text-sm text-gray-900">{String(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

function Section({ title, onEdit, children }: { title: string; onEdit?: () => void; children: ReactNode }) {
  return (
    <section className="scroll-mt-24">
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 pb-2">
        <h3 className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#0A3E9E]">{title}</h3>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="shrink-0 text-xs font-semibold text-blue-600 transition-colors hover:text-blue-800"
          >
            Edit
          </button>
        )}
      </div>
      <div className="mt-3 space-y-4">{children}</div>
    </section>
  );
}

function SubCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-l-2 border-gray-200 pl-4">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-gray-500">{title}</p>
      {children}
    </div>
  );
}

export default function UnifiedCitizenProfile({ form }: { form: FormState }) {
  const job = form.employmentRecords?.[0];
  const edu = form.educationRecords?.[0];
  const ls = form.livingStandard;
  const dis = form.disability;

  const jobIsBusiness = job?.status === "Self-employed / Business owner" || job?.status === "Agriculture / Farming";
  const jobIsForeign = job?.status === "Foreign employment";
  const jobIsUnemployed = job?.status === "Unemployed";
  const jobIsInactive = jobIsUnemployed || job?.status === "Student" || job?.status === "Homemaker" || job?.status === "Retired";
  const eduFormal = Boolean(edu?.level) && !/^(No formal education|Literate only)/.test(edu?.level ?? "");
  const spouseName = [form.spouseFirstName, form.spouseMiddleName, form.spouseLastName].filter(Boolean).join(" ");

  const currentMatchesPermanent =
    form.province === form.permanentProvince &&
    form.district === form.permanentDistrict &&
    form.municipality === form.permanentMunicipality &&
    form.ward === form.permanentWard &&
    form.address === form.permanentStreet &&
    form.houseNo === form.permanentHouseNo;

  return (
    <div className="space-y-8">
      <Section title="NID / Citizenship">
        <Rows rows={[
          ["Citizenship type", form.citizenshipType],
          ["Citizenship number", form.citizenshipNumber],
          ["NID number", form.nidNumber],
          ["Citizenship — front", form.citizenshipFront],
          ["Citizenship — back", form.citizenshipBack],
          ["NID — front", form.nidFront],
          ["NID — back", form.nidBack],
        ]} />
      </Section>

      <Section title="Personal">
        <Rows rows={[
          ["First name", form.firstName],
          ["Middle name", form.middleName],
          ["Last name", form.lastName],
          ["Full name (Devanagari)", form.fullNameDevnagari],
          ["Date of birth", form.dob],
          ["Gender", form.gender],
          ["Marital status", form.maritalStatus],
          ["Father's name", form.fatherName],
          ["Mother's name", form.motherName],
          ["Spouse name", form.maritalStatus === "Married" ? spouseName : ""],
          ["Spouse relationship", form.maritalStatus === "Married" ? form.spouseRelationship : ""],
          ["Number of children", form.numberOfChildren],
        ]} />
        {(form.children ?? []).map((c, i) => (
          <SubCard key={`child-${i}`} title={`Child ${i + 1}`}>
            <Rows rows={[
              ["Name", [c.firstName, c.middleName, c.lastName].filter(Boolean).join(" ")],
              ["Date of birth", c.dob],
              ["Citizenship no.", c.citizenshipNumber],
              ["Has disability", c.hasDisability],
              ["Disability type", c.hasDisability === "Yes" ? c.disabilityType : ""],
              ["Disability category", c.hasDisability === "Yes" ? c.disabilityCategory : ""],
              ["Severity level", c.hasDisability === "Yes" ? String(c.disabilitySeverityLevel ?? "") : ""],
              ["Govt. certificate", c.hasDisability === "Yes" ? ((c.disabilityCertificateIssued ?? true) ? "Yes" : "No") : ""],
            ]} />
          </SubCard>
        ))}
        <SubCard title="Disability (self)">
          <Rows rows={[
            ["Has disability", dis?.hasDisability],
            ["Type", dis?.hasDisability === "Yes" ? dis?.disabilityType : ""],
            ["Category (ID card)", dis?.hasDisability === "Yes" ? dis?.disabilityCategory : ""],
            ["Severity level", dis?.hasDisability === "Yes" ? String(dis?.severityLevel ?? "") : ""],
            ["Govt. certificate issued", dis?.hasDisability === "Yes" ? (dis?.certificateIssued ? "Yes" : "No") : ""],
          ]} />
        </SubCard>
      </Section>

      <Section title="Photo & biometrics">
        <Rows rows={[
          ["Photo", form.photo],
          ["Thumb print", form.thumbPrint],
          ["Signature", form.signature],
          ["Retina scan", form.retinaScan],
        ]} />
      </Section>

      <Section title="Household">
        <SubCard title="Permanent address">
          <Rows rows={[
            ["Province", form.permanentProvince],
            ["District", form.permanentDistrict],
            ["Municipality / RM", form.permanentMunicipality],
            ["Ward", form.permanentWard],
            ["Street / tole", form.permanentStreet],
            ["House no.", form.permanentHouseNo],
          ]} />
        </SubCard>
        <SubCard title="Current / temporary address">
          {form.currentResidence === "Abroad" ? (
            <Rows rows={[
              ["Currently residing", "Abroad"],
              ["Country", form.countryOfResidence],
              ["City", form.cityOfResidence],
              ["Visa type", form.visaType],
              ["Years abroad", form.yearsAtResidence],
              ["Address abroad", form.address],
              ["Purpose of staying", form.purposeOfStaying],
            ]} />
          ) : currentMatchesPermanent ? (
            <Rows rows={[
              ["Currently residing", "Nepal"],
              ["Current address", "Same as permanent address"],
              ["House type", form.houseType],
              ["Ownership status", form.ownershipStatus],
              ["Years at residence", form.yearsAtResidence],
              ["Number of rooms", form.roomCount],
            ]} />
          ) : (
            <Rows rows={[
              ["Currently residing", "Nepal"],
              ["Province", form.province],
              ["District", form.district],
              ["Municipality / RM", form.municipality],
              ["Ward", form.ward],
              ["House type", form.houseType],
              ["Ownership status", form.ownershipStatus],
              ["Years at residence", form.yearsAtResidence],
              ["Number of rooms", form.roomCount],
              ["Street / tole", form.address],
              ["House no.", form.houseNo],
              ["Purpose of staying", form.purposeOfStaying],
            ]} />
          )}
        </SubCard>
        <Rows emptyLabel="" rows={[
          ["Latitude", form.lat],
          ["Longitude", form.lng],
          ["Selected place", form.placeName],
        ]} />
      </Section>

      <Section title="Employment & income">
        <Rows rows={[
          ["Status", job?.status],
          ["Occupation / job title", job?.role],
          ["Sector", job?.sector],
          ["Employment type", jobIsInactive ? "" : job?.employmentType],
          ["Monthly income band", job?.incomeBand],
          ["Main source of income", job?.primaryIncome],
          ["Currently active", jobIsInactive ? "" : job?.currentlyWorking],
          ["Started (year)", jobIsInactive ? "" : job?.startYear],
          ["Experience (years)", jobIsInactive ? "" : job?.yearsOfExperience],
        ]} />
        {job && !jobIsBusiness && !jobIsForeign && !jobIsInactive && (
          <Rows emptyLabel="" rows={[
            ["Employer / organisation", job.employer],
            ["Employer location", job.employerLocation],
          ]} />
        )}
        {jobIsBusiness && job && (
          <SubCard title="Business / enterprise">
            <Rows rows={[
              ["Business name", job.businessName],
              ["Type of business", job.businessType],
              ["Registration status", job.businessRegistration],
              ["PAN / registration no.", job.registrationNumber],
              ["People employed", job.businessEmployees],
              ["Business started (year)", job.businessStartYear],
            ]} />
          </SubCard>
        )}
        {jobIsForeign && job && (
          <SubCard title="Foreign employment">
            <Rows rows={[
              ["Country", job.country],
              ["Year went abroad", job.departureYear],
              ["Work type", job.workType === "Other" ? job.customWorkType : job.workType],
              ["Employer abroad", job.employerAbroad],
              ["Sends remittance regularly", job.remittanceRegular],
              ["Approx. monthly remittance", job.monthlyRemittance],
            ]} />
          </SubCard>
        )}
        {jobIsUnemployed && job && <Rows rows={[["Actively seeking work", job.seekingWork]]} />}
      </Section>

      <Section title="Education">
        <Rows rows={[
          ["Highest level", edu?.level],
          ["Status", eduFormal ? edu?.status : ""],
          ["Institution", eduFormal ? edu?.institution : ""],
          ["Faculty / subject", eduFormal ? edu?.subject : ""],
          ["Passing / current year", eduFormal ? edu?.year : ""],
        ]} />
      </Section>

      <Section title="Living standard & household access">
        {ls ? (
          <>
            <SubCard title="House & land">
              <Rows rows={[
                ["House construction type", ls.houseStructure],
                ["Owns agricultural land", ls.landOwnership],
                ["Land holding", ls.landOwnership === "Yes" ? ls.landArea : ""],
              ]} />
            </SubCard>
            <SubCard title="Utilities & services">
              <Rows rows={[
                ["Electricity", ls.electricity],
                ["Electricity source", ls.electricity === "Yes" ? ls.electricitySource : ""],
                ["Drinking water", ls.drinkingWater],
                ["Toilet", ls.toilet],
                ["Cooking fuel", ls.cookingFuel],
                ["Internet at home", ls.internet],
                ["Internet type", ls.internet === "Yes" ? ls.internetType : ""],
              ]} />
            </SubCard>
            <SubCard title="Assets & finance">
              <Rows rows={[
                ["Mobile phones", ls.mobilePhones],
                ["Owns a vehicle", ls.ownsVehicle],
                ["Two-wheelers", ls.ownsVehicle === "Yes" ? ls.twoWheelers : ""],
                ["Four-wheelers", ls.ownsVehicle === "Yes" ? ls.fourWheelers : ""],
                ["Bicycles / cart", ls.ownsVehicle === "Yes" ? ls.bicycles : ""],
                ["Bank / financial account", ls.bankAccount],
                ["Number of accounts", ls.bankAccount === "Yes" ? ls.bankAccountCount : ""],
                ["Livestock / poultry", ls.livestock],
                ["Health insurance", ls.healthInsurance],
                ["Social security allowance", ls.socialSecurity],
                ["Allowance type", ls.socialSecurity === "Yes" ? ls.socialSecurityType : ""],
                ["Member migrated for work (12 mo)", ls.migrantMember],
              ]} />
            </SubCard>
            <SubCard title="Access & distance">
              <Rows rows={[
                ["Motorable road access", ls.roadAccess],
                ["Distance to road", ls.roadAccess === "Yes" ? ls.roadDistance : ""],
                ["Distance to market", ls.marketDistance],
                ["Distance to health facility", ls.healthFacilityDistance],
                ["Distance to school", ls.schoolDistance],
                ["Food sufficiency", ls.foodSufficiency],
              ]} />
            </SubCard>
          </>
        ) : (
          <p className="text-sm text-gray-400">No living-standard data recorded.</p>
        )}
      </Section>
    </div>
  );
}
