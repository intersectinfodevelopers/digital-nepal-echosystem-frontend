"use client";
import { Search } from "@mui/icons-material";

export default function SearchCitizen() {
  return (
    <section className="rounded-xs border border-[#d9d9d9] bg-white p-5">
      <h2 className="text-[22px] font-bold uppercase text-[#374151]">
        Search Citizen
      </h2>
      <div className="relative mt-4">
        <input
          type="search"
          aria-label="Search citizen by name, NID, or phone"
          placeholder="Name, NID, or Phone..."
          className="w-full rounded-lg border border-[#d9d9d9] bg-white py-3 pl-4 pr-11 text-[15px] text-[#374151] outline-none transition-colors duration-150 placeholder:text-[#9CA3AF] focus:border-[#0A3E9E] focus:ring-2 focus:ring-[#0A3E9E]/15"
        />
        <Search
          sx={{ fontSize: 18 }}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280]"
        />
      </div>
    </section>
  );
}
