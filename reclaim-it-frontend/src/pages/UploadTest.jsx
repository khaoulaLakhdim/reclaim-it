import React, { useState } from "react";
import { supabaseClient } from "../api/supabaseClient";

export default function UploadTest() {
  const [file, setFile]     = useState(null);
  const [url, setUrl]       = useState("");
  const [error, setError]   = useState("");

  const handle = async () => {
    if (!file) return setError("Pick a file first");
    setError("");
    // generate a unique path:
    const path = `${Date.now()}_${file.name}`;

    const { data, error: upErr } = await supabaseClient
      .storage
      .from("reclaim-it-proof")
      .upload(path, file, { upsert: true });

    if (upErr) {
      console.error(upErr);
      return setError("Upload error: " + upErr.message);
    }

    // public URL:
    const { data: urlData, error: urlErr } = supabaseClient
      .storage
      .from("reclaim-it-proof")
      .getPublicUrl(path);

    if (urlErr) {
      console.error(urlErr);
      return setError("URL fetch error: " + urlErr.message);
    }

    setUrl(urlData.publicUrl);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Supabase Upload Test</h2>
      <input
        type="file"
        accept="image/*"
        onChange={e => setFile(e.target.files[0])}
      />
      <button onClick={handle} style={{ marginLeft: 8 }}>
        Upload
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {url && (
        <>
          <p>Uploaded! URL:</p>
          <a href={url} target="_blank" rel="noopener noreferrer">
            {url}
          </a>
          <div>
            <img src={url} alt="uploaded" style={{ maxWidth: 300, marginTop: 10 }} />
          </div>
        </>
      )}
    </div>
  );
}
