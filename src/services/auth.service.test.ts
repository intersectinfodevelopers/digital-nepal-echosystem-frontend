import { resolveSessionDetails } from "./auth.service";
import type { User } from "@/types/auth";

describe("resolveSessionDetails", () => {
  it("uses denormalized values from updated user records when available", () => {
    const user: User = {
      id: "user-1",
      username: "test.user",
      email: "test@example.com",
      password: "secret",
      full_name: "Test User",
      phone: "9800000000",
      role: "LOCAL_BODY_ADMIN",
      jurisdiction_type: "MUNICIPALITY",
      jurisdiction_id: "mun-unknown",
      is_active: true,
      denorm: {
        municipality_id: "mun-01",
        municipality_name: "Phungling Municipality",
        district_id: "dist-01",
        province_id: "prov-1",
        province_name: "Koshi Province",
      },
    };

    expect(resolveSessionDetails(user)).toEqual(
      expect.objectContaining({
        municipality_id: "mun-01",
        municipality_name: "Phungling Municipality",
        province_id: "prov-1",
        province_name: "Koshi Province",
      }),
    );
  });
});
