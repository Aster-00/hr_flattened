"use client";

import { useState, useEffect } from "react";
import { apiClient } from "../lib/apiClient";
import CompanySettingsForm from "./CompanySettingsForm";

interface CompanySettings {
  _id?: string;
  payDate: string | Date;
  timeZone: string;
  currency: string;
  updatedAt?: string;
}

interface CompanySettingsFormData {
  payDate: string;
  timeZone: string;
  currency: string;
  updatedAt?: string;
}

export default function CompanySettings() {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await apiClient.get("/payroll-configuration/company-settings");
      if (data) {
        const formattedData = {
          ...data,
          payDate: data.payDate
            ? new Date(data.payDate).toISOString().split("T")[0]
            : "",
        };
        setSettings(formattedData);
      }
    } catch (err: any) {
      console.error("Error fetching company settings:", err);
      const errorMessage = err.message || "";
      const is404 = errorMessage.includes("404") || errorMessage.includes("API Error: 404");
      const isHtmlResponse = errorMessage.includes("HTML instead of JSON") || errorMessage.includes("API endpoint not found");

      if (!is404 && !isHtmlResponse) {
        setError("Failed to load settings");
      } else {
        setError("");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (formData: CompanySettingsFormData) => {
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        payDate: new Date(formData.payDate),
        timeZone: formData.timeZone,
        currency: formData.currency,
      };

      await apiClient.post("/payroll-configuration/company-settings", payload);
      setSuccess("Company settings saved successfully!");
      await fetchSettings();
    } catch (err: any) {
      const errorMessage = err.message || "";
      let displayError = "Failed to save company settings";

      if (errorMessage.includes("API endpoint not found") || errorMessage.includes("returned HTML")) {
        displayError = "Backend server is not running or API endpoint is incorrect. Please check your backend connection.";
      } else if (errorMessage.includes("400") || errorMessage.includes("Bad Request")) {
        displayError = errorMessage.includes("API Error: 400")
          ? errorMessage.replace("API Error: 400", "").trim() || "Validation error. Please check your input."
          : errorMessage;
      } else if (errorMessage.includes("500") || errorMessage.includes("Internal Server Error")) {
        displayError = "Server error, please try again";
      } else if (errorMessage) {
        displayError = errorMessage;
      }

      setError(displayError);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setError("");
    setSuccess("");
  };

  const getInitialData = (): CompanySettingsFormData | undefined => {
    if (!settings) return undefined;
    return {
      payDate: typeof settings.payDate === "string" ? settings.payDate : new Date(settings.payDate).toISOString().split("T")[0],
      timeZone: settings.timeZone || "",
      currency: settings.currency || "EGP",
      updatedAt: settings.updatedAt,
    };
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-secondary)', padding: '2rem 0' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="text-primary" style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>
            Company Settings
          </h1>
          <p className="text-secondary">Configure your organization's core payroll parameters</p>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem 0' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              border: '4px solid var(--primary-100)',
              borderTopColor: 'var(--primary-600)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
        ) : (
          <div className="card">
            {error && (
              <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
                {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
                {success}
              </div>
            )}

            <CompanySettingsForm
              initialData={getInitialData()}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        )}
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

