// src/components/FirebaseDataTable.tsx
import React, { useCallback, useState } from "react";
import { useFirebaseData } from "@/hooks/useFirebaseData";
import { pushData } from "@/lib/firebaseHelpers";
import type { RowData } from "@/lib/firebaseHelpers";

export default function FirebaseDataTable() {
  const { data, loading, error } = useFirebaseData("/data");
  const [uploading, setUploading] = useState(false);

  const handleManualUpload = useCallback(async () => {
    setUploading(true);
    try {
      const payload: RowData = {
        timestamp: new Date().toISOString(),
        temperature: "28.3",
        humidity: "61",
        light: "45",
        voltage: "3.7",
      };
      const key = await pushData("/data", payload);
      console.log("pushed key:", key);
    } catch (err) {
      console.error("upload error", err);
    } finally {
      setUploading(false);
    }
  }, []);

  if (loading) return <div>Loading…</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h3>Realtime Data</h3>
      <button onClick={handleManualUpload} disabled={uploading}>
        {uploading ? "Uploading…" : "Manual Upload (test)"}
      </button>

      <table style={{ width: "100%", marginTop: 12, borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: 8 }}>ID</th>
            <th style={{ border: "1px solid #ddd", padding: 8 }}>Timestamp</th>
            <th style={{ border: "1px solid #ddd", padding: 8 }}>Temperature</th>
            <th style={{ border: "1px solid #ddd", padding: 8 }}>Humidity</th>
            <th style={{ border: "1px solid #ddd", padding: 8 }}>Light</th>
            <th style={{ border: "1px solid #ddd", padding: 8 }}>Voltage</th>
          </tr>
        </thead>
        <tbody>
          {(data || []).map((row) => (
            <tr key={row.id}>
              <td style={{ border: "1px solid #ddd", padding: 8 }}>{row.id}</td>
              <td style={{ border: "1px solid #ddd", padding: 8 }}>{row.value.timestamp}</td>
              <td style={{ border: "1px solid #ddd", padding: 8 }}>{row.value.temperature}</td>
              <td style={{ border: "1px solid #ddd", padding: 8 }}>{row.value.humidity}</td>
              <td style={{ border: "1px solid #ddd", padding: 8 }}>{row.value.light}</td>
              <td style={{ border: "1px solid #ddd", padding: 8 }}>{row.value.voltage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}