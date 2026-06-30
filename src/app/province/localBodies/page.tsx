"use client";

import { useState } from "react";
import municipalities from "../../../../data/municipalities.json";

interface Admin {
  id: string;
  full_name: string;
  username: string;
  municipality: string;
  is_active: boolean;
  last_login: string;
}

interface FormData {
  full_name: string;
  username: string;
  temp_password: string;
  municipality: string;
}

interface Municipality {
  id: string;
  name_en: string;
}

const municipalitiesData = municipalities as Municipality[];

export default function LocalBodyAdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([
    {
      id: "lba-001",
      full_name: "Hari Prasad Sharma",
      username: "hari.sharma",
      municipality: "Kummayak Rural Municipality",
      is_active: true,
      last_login: "2026-06-20",
    },
  ]);

  const [form, setForm] = useState<FormData>({
    full_name: "",
    username: "",
    temp_password: "",
    municipality: "",
  });

  const createAdmin = () => {
    if (
      !form.full_name.trim() ||
      !form.username.trim() ||
      !form.temp_password.trim() ||
      !form.municipality
    ) {
      alert("Please fill all fields");
      return;
    }

    const usernameExists = admins.some(
      (admin) => admin.username.toLowerCase() === form.username.toLowerCase(),
    );

    if (usernameExists) {
      alert("Username already exists");
      return;
    }

    const newAdmin: Admin = {
      id: `lba-${Date.now()}`,
      full_name: form.full_name,
      username: form.username,
      municipality: form.municipality,
      is_active: true,
      last_login: "Never",
    };

    setAdmins((prev) => [...prev, newAdmin]);

    setForm({
      full_name: "",
      username: "",
      temp_password: "",
      municipality: "",
    });
  };

  const toggleStatus = (id: string) => {
    setAdmins((prev) =>
      prev.map((admin) =>
        admin.id === id ? { ...admin, is_active: !admin.is_active } : admin,
      ),
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Local Body Admin Management</h1>

      {/* Create Admin */}
      <div className="bg-white p-6 rounded-lg shadow mb-8 max-w-xl">
        <h2 className="text-xl font-semibold mb-5">Create Local Body Admin</h2>

        <div className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Full Name</label>

            <input
              className="w-full border p-2 rounded"
              placeholder="Enter full name"
              value={form.full_name}
              onChange={(e) =>
                setForm({
                  ...form,
                  full_name: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Username</label>

            <input
              className="w-full border p-2 rounded"
              placeholder="Enter username"
              value={form.username}
              onChange={(e) =>
                setForm({
                  ...form,
                  username: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Temporary Password</label>

            <input
              type="password"
              className="w-full border p-2 rounded"
              placeholder="Enter temporary password"
              value={form.temp_password}
              onChange={(e) =>
                setForm({
                  ...form,
                  temp_password: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Municipality</label>

            <select
              className="w-full border p-2 rounded"
              value={form.municipality}
              onChange={(e) =>
                setForm({
                  ...form,
                  municipality: e.target.value,
                })
              }
            >
              <option value="">Select Municipality</option>

              {municipalitiesData.map((municipality) => (
                <option key={municipality.id} value={municipality.name_en}>
                  {municipality.name_en}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={createAdmin}
          className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded"
        >
          Create Account
        </button>
      </div>

      {/* Admin List */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">
          Local Body Admin Accounts
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full border border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-3 text-left">Name</th>
                <th className="border p-3 text-left">Username</th>
                <th className="border p-3 text-left">Municipality</th>
                <th className="border p-3 text-center">Status</th>
                <th className="border p-3 text-center">Last Login</th>
                <th className="border p-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="border p-3">{admin.full_name}</td>

                  <td className="border p-3">{admin.username}</td>

                  <td className="border p-3">{admin.municipality}</td>

                  <td className="border p-3 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        admin.is_active
                      }`}
                    >
                      {admin.is_active ? "Active" : "Disabled"}
                    </span>
                  </td>

                  <td className="border p-3 text-center">{admin.last_login}</td>

                  <td className="border p-3 text-center">
                    <button
                      onClick={() => toggleStatus(admin.id)}
                      className={`px-3 py-1 rounded text-white ${
                        admin.is_active
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-green-500 hover:bg-green-600"
                      }`}
                    >
                      {admin.is_active ? "Disable" : "Enable"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
