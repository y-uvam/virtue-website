import React, { useState } from "react";
import { Key, Code, BookOpen, ChevronRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store";
import { regenerateApiKey } from "../../store/slices/authSlice";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { CopyButton } from "../../components/common/CopyButton";
import { useToast } from "../../components/common/Toast";
import { STRINGS } from "../../constants/strings";
import { Table, type TableColumn } from "../../components/common/Table";

interface ApiEndpoint {
  action: string;
  method: string;
  params: string[];
  desc: string;
}

export const ApiDocsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { user } = useAppSelector((state) => state.auth);

  const [activeLang, setActiveLang] = useState<"js" | "python" | "php">("js");
  const [activeEndpointIdx, setActiveEndpointIdx] = useState(0);

  const endpoints: ApiEndpoint[] = [
    {
      action: "add",
      method: "POST",
      params: ["key (string)", "action = 'add'", "service (int)", "link (string)", "quantity (int)"],
      desc: "Place a new social marketing campaign order automatically.",
    },
    {
      action: "status",
      method: "POST",
      params: ["key (string)", "action = 'status'", "order (int)"],
      desc: "Retrieve start count, remains, and status of a specific order ID.",
    },
    {
      action: "services",
      method: "POST",
      params: ["key (string)", "action = 'services'"],
      desc: "Get full active services list including pricing rates, minimum and maximum limits.",
    },
    {
      action: "balance",
      method: "POST",
      params: ["key (string)", "action = 'balance'"],
      desc: "Fetch current wallet balance in INR (₹).",
    },
  ];

  const codeSnippets = {
    js: {
      add: `// JS - Create Order
const fetch = require('node-fetch');

const payload = {
  key: "${user?.api_key || 'YOUR_API_KEY'}",
  action: "add",
  service: 101,
  link: "https://www.instagram.com/p/C_abc/",
  quantity: 1000
};

fetch('https://smmpanelpro.com/api/v1', {
  method: 'POST',
  body: JSON.stringify(payload),
  headers: { 'Content-Type': 'application/json' }
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));`,
      status: `// JS - Get Status
const fetch = require('node-fetch');

fetch('https://smmpanelpro.com/api/v1', {
  method: 'POST',
  body: JSON.stringify({
    key: "${user?.api_key || 'YOUR_API_KEY'}",
    action: "status",
    order: 4589
  }),
  headers: { 'Content-Type': 'application/json' }
})
.then(res => res.json())
.then(data => console.log(data));`,
      services: `// JS - Fetch Services
const fetch = require('node-fetch');

fetch('https://smmpanelpro.com/api/v1', {
  method: 'POST',
  body: JSON.stringify({
    key: "${user?.api_key || 'YOUR_API_KEY'}",
    action: "services"
  }),
  headers: { 'Content-Type': 'application/json' }
})
.then(res => res.json())
.then(data => console.log(data));`,
      balance: `// JS - Get Balance
const fetch = require('node-fetch');

fetch('https://smmpanelpro.com/api/v1', {
  method: 'POST',
  body: JSON.stringify({
    key: "${user?.api_key || 'YOUR_API_KEY'}",
    action: "balance"
  }),
  headers: { 'Content-Type': 'application/json' }
})
.then(res => res.json())
.then(data => console.log(data));`
    },
    python: {
      add: `# Python - Create Order
import requests

url = "https://smmpanelpro.com/api/v1"
payload = {
    "key": "${user?.api_key || 'YOUR_API_KEY'}",
    "action": "add",
    "service": 101,
    "link": "https://www.instagram.com/p/C_abc/",
    "quantity": 1000
}

response = requests.post(url, json=payload)
print(response.json())`,
      status: `# Python - Get Status
import requests

url = "https://smmpanelpro.com/api/v1"
payload = {
    "key": "${user?.api_key || 'YOUR_API_KEY'}",
    "action": "status",
    "order": 4589
}

response = requests.post(url, json=payload)
print(response.json())`,
      services: `# Python - Fetch Services
import requests

url = "https://smmpanelpro.com/api/v1"
payload = {
    "key": "${user?.api_key || 'YOUR_API_KEY'}",
    "action": "services"
}

response = requests.post(url, json=payload)
print(response.json())`,
      balance: `# Python - Get Balance
import requests

url = "https://smmpanelpro.com/api/v1"
payload = {
    "key": "${user?.api_key || 'YOUR_API_KEY'}",
    "action": "balance"
}

response = requests.post(url, json=payload)
print(response.json())`
    },
    php: {
      add: `<?php
// PHP - Create Order
$ch = curl_init("https://smmpanelpro.com/api/v1");
$payload = json_encode([
    "key" => "${user?.api_key || 'YOUR_API_KEY'}",
    "action" => "add",
    "service" => 101,
    "link" => "https://www.instagram.com/p/C_abc/",
    "quantity" => 1000
]);

curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result = curl_exec($ch);
curl_close($ch);
echo $result;
?>`,
      status: `<?php
// PHP - Get Status
$ch = curl_init("https://smmpanelpro.com/api/v1");
$payload = json_encode([
    "key" => "${user?.api_key || 'YOUR_API_KEY'}",
    "action" => "status",
    "order" => 4589
]);

curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result = curl_exec($ch);
curl_close($ch);
echo $result;
?>`,
      services: `<?php
// PHP - Fetch Services
$ch = curl_init("https://smmpanelpro.com/api/v1");
$payload = json_encode([
    "key" => "${user?.api_key || 'YOUR_API_KEY'}",
    "action" => "services"
]);

curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result = curl_exec($ch);
curl_close($ch);
echo $result;
?>`,
      balance: `<?php
// PHP - Get Balance
$ch = curl_init("https://smmpanelpro.com/api/v1");
$payload = json_encode([
    "key" => "${user?.api_key || 'YOUR_API_KEY'}",
    "action" => "balance"
]);

curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result = curl_exec($ch);
curl_close($ch);
echo $result;
?>`
    }
  };

  const handleRegenerateKey = async () => {
    if (window.confirm("Are you sure you want to regenerate your developer API key?")) {
      const result = await dispatch(regenerateApiKey());
      if (regenerateApiKey.fulfilled.match(result)) {
        toast.success("New API key generated successfully.");
      } else {
        toast.error("Failed to generate API key.");
      }
    }
  };

  const selectedEndpoint = endpoints[activeEndpointIdx];
  const activeCodeSnippet = codeSnippets[activeLang][selectedEndpoint.action as keyof typeof codeSnippets["js"]];

  const docColumns: TableColumn<ApiEndpoint>[] = [
    {
      key: "action",
      title: "Action API Value",
      render: (row, idx) => (
        <button
          onClick={() => setActiveEndpointIdx(idx)}
          className={`flex items-center gap-1.5 font-mono text-xs font-bold text-left px-2 py-1 rounded transition-colors w-full cursor-pointer
            ${
              activeEndpointIdx === idx
                ? "bg-primary text-white border-l-2 border-primary-light"
                : "text-textSecondary hover:text-white hover:bg-white/5"
            }
          `}
        >
          <ChevronRight size={12} className={activeEndpointIdx === idx ? "text-primary-light" : "opacity-0"} />
          action = '{row.action}'
        </button>
      ),
    },
    {
      key: "method",
      title: "Method",
      render: (row) => (
        <span className="font-bold text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
          {row.method}
        </span>
      ),
    },
    {
      key: "params",
      title: "Required Parameters",
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.params.map((p) => (
            <code key={p} className="text-[10px] bg-bgDark py-0.5 px-1.5 rounded font-mono border border-border/40 text-textSecondary">
              {p}
            </code>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white uppercase tracking-wider">{STRINGS.DASHBOARD.NAV_API}</h1>
        <p className="text-xs text-textSecondary">
          Integrate our SMM Panel services directly with your reseller store. API endpoints support JSON payloads.
        </p>
      </div>

      {/* API Key box */}
      <Card className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3 bg-bgDark border border-border rounded-xl text-primary-light">
            <Key size={20} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Your Developer API Key</h4>
            <code className="text-xs font-mono text-textMuted bg-transparent p-0 block mt-0.5">{user?.api_key}</code>
          </div>
        </div>
        <div className="flex gap-2">
          <CopyButton text={user?.api_key || ""} label="Copy Token" />
          <Button variant="secondary" size="sm" onClick={handleRegenerateKey}>
            Regenerate
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Endpoints doc */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen size={14} className="text-primary-light" />
            API Methods &amp; Parameters
          </h3>
          <Card className="p-4 overflow-hidden">
            <Table columns={docColumns} data={endpoints} />
          </Card>
        </div>

        {/* Selected Endpoint Code panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider flex items-center gap-1.5">
              <Code size={14} className="text-primary-light" />
              Code Samples
            </h3>

            {/* Language switch */}
            <div className="flex gap-1 bg-bgCard border border-border p-0.5 rounded-lg text-[10px] font-bold">
              {[
                { id: "js", label: "NodeJS" },
                { id: "python", label: "Python" },
                { id: "php", label: "PHP" },
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setActiveLang(lang.id as any)}
                  className={`px-2 py-1 rounded cursor-pointer transition-colors
                    ${
                      activeLang === lang.id
                        ? "bg-primary text-white"
                        : "text-textSecondary hover:text-white"
                    }
                  `}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          <Card className="bg-bgDark border border-border p-4 relative overflow-hidden flex flex-col justify-between max-h-[360px]">
            <div className="absolute top-2 right-2">
              <CopyButton text={activeCodeSnippet} />
            </div>

            <pre className="text-[10px] font-mono text-emerald-400 overflow-auto whitespace-pre leading-relaxed select-all">
              <code>{activeCodeSnippet}</code>
            </pre>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default ApiDocsPage;
