import{i as e,n as t,t as n}from"./jsx-runtime-bzQ4Vb5N.js";import{n as r,t as i}from"./strings-D_-te-eR.js";import{t as a}from"./Table-l_fYZ2w1.js";import{t as o}from"./CopyButton-DGWJDaiU.js";import{t as s}from"./chevron-right-Dzoa6ioo.js";import{t as c}from"./key-DGIr5ckW.js";import{A as l,a as u,k as d,ot as f,r as p}from"./index-CMLmRgPA.js";import{t as m}from"./Card-Cf-MZ3rh.js";var h=r(`book-open`,[[`path`,{d:`M12 7v14`,key:`1akyts`}],[`path`,{d:`M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z`,key:`ruj8y`}]]),g=r(`code`,[[`path`,{d:`m16 18 6-6-6-6`,key:`eg8j8`}],[`path`,{d:`m8 6-6 6 6 6`,key:`ppft3o`}]]),_=e(t(),1),v=n(),y=()=>{let e=d(),t=u(),{user:n}=l(e=>e.auth),[r,y]=(0,_.useState)(`js`),[b,x]=(0,_.useState)(0),S=[{action:`add`,method:`POST`,params:[`key (string)`,`action = 'add'`,`service (int)`,`link (string)`,`quantity (int)`],desc:`Place a new social marketing campaign order automatically.`},{action:`status`,method:`POST`,params:[`key (string)`,`action = 'status'`,`order (int)`],desc:`Retrieve start count, remains, and status of a specific order ID.`},{action:`services`,method:`POST`,params:[`key (string)`,`action = 'services'`],desc:`Get full active services list including pricing rates, minimum and maximum limits.`},{action:`balance`,method:`POST`,params:[`key (string)`,`action = 'balance'`],desc:`Fetch current wallet balance in INR (₹).`}],C={js:{add:`// JS - Create Order
const fetch = require('node-fetch');

const payload = {
  key: "${n?.api_key||`YOUR_API_KEY`}",
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
.catch(err => console.error(err));`,status:`// JS - Get Status
const fetch = require('node-fetch');

fetch('https://smmpanelpro.com/api/v1', {
  method: 'POST',
  body: JSON.stringify({
    key: "${n?.api_key||`YOUR_API_KEY`}",
    action: "status",
    order: 4589
  }),
  headers: { 'Content-Type': 'application/json' }
})
.then(res => res.json())
.then(data => console.log(data));`,services:`// JS - Fetch Services
const fetch = require('node-fetch');

fetch('https://smmpanelpro.com/api/v1', {
  method: 'POST',
  body: JSON.stringify({
    key: "${n?.api_key||`YOUR_API_KEY`}",
    action: "services"
  }),
  headers: { 'Content-Type': 'application/json' }
})
.then(res => res.json())
.then(data => console.log(data));`,balance:`// JS - Get Balance
const fetch = require('node-fetch');

fetch('https://smmpanelpro.com/api/v1', {
  method: 'POST',
  body: JSON.stringify({
    key: "${n?.api_key||`YOUR_API_KEY`}",
    action: "balance"
  }),
  headers: { 'Content-Type': 'application/json' }
})
.then(res => res.json())
.then(data => console.log(data));`},python:{add:`# Python - Create Order
import requests

url = "https://smmpanelpro.com/api/v1"
payload = {
    "key": "${n?.api_key||`YOUR_API_KEY`}",
    "action": "add",
    "service": 101,
    "link": "https://www.instagram.com/p/C_abc/",
    "quantity": 1000
}

response = requests.post(url, json=payload)
print(response.json())`,status:`# Python - Get Status
import requests

url = "https://smmpanelpro.com/api/v1"
payload = {
    "key": "${n?.api_key||`YOUR_API_KEY`}",
    "action": "status",
    "order": 4589
}

response = requests.post(url, json=payload)
print(response.json())`,services:`# Python - Fetch Services
import requests

url = "https://smmpanelpro.com/api/v1"
payload = {
    "key": "${n?.api_key||`YOUR_API_KEY`}",
    "action": "services"
}

response = requests.post(url, json=payload)
print(response.json())`,balance:`# Python - Get Balance
import requests

url = "https://smmpanelpro.com/api/v1"
payload = {
    "key": "${n?.api_key||`YOUR_API_KEY`}",
    "action": "balance"
}

response = requests.post(url, json=payload)
print(response.json())`},php:{add:`<?php
// PHP - Create Order
$ch = curl_init("https://smmpanelpro.com/api/v1");
$payload = json_encode([
    "key" => "${n?.api_key||`YOUR_API_KEY`}",
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
?>`,status:`<?php
// PHP - Get Status
$ch = curl_init("https://smmpanelpro.com/api/v1");
$payload = json_encode([
    "key" => "${n?.api_key||`YOUR_API_KEY`}",
    "action" => "status",
    "order" => 4589
]);

curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result = curl_exec($ch);
curl_close($ch);
echo $result;
?>`,services:`<?php
// PHP - Fetch Services
$ch = curl_init("https://smmpanelpro.com/api/v1");
$payload = json_encode([
    "key" => "${n?.api_key||`YOUR_API_KEY`}",
    "action" => "services"
]);

curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result = curl_exec($ch);
curl_close($ch);
echo $result;
?>`,balance:`<?php
// PHP - Get Balance
$ch = curl_init("https://smmpanelpro.com/api/v1");
$payload = json_encode([
    "key" => "${n?.api_key||`YOUR_API_KEY`}",
    "action" => "balance"
]);

curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result = curl_exec($ch);
curl_close($ch);
echo $result;
?>`}},w=async()=>{if(window.confirm(`Are you sure you want to regenerate your developer API key?`)){let n=await e(f());f.fulfilled.match(n)?t.success(`New API key generated successfully.`):t.error(`Failed to generate API key.`)}},T=S[b],E=C[r][T.action];return(0,v.jsxs)(`div`,{className:`max-w-4xl mx-auto space-y-6 text-left`,children:[(0,v.jsxs)(`div`,{className:`space-y-1`,children:[(0,v.jsx)(`h1`,{className:`text-xl font-bold text-white uppercase tracking-wider`,children:i.DASHBOARD.NAV_API}),(0,v.jsx)(`p`,{className:`text-xs text-textSecondary`,children:`Integrate our SMM Panel services directly with your reseller store. API endpoints support JSON payloads.`})]}),(0,v.jsxs)(m,{className:`p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`,children:[(0,v.jsxs)(`div`,{className:`flex items-center gap-3 shrink-0`,children:[(0,v.jsx)(`div`,{className:`p-3 bg-bgDark border border-border rounded-xl text-primary-light`,children:(0,v.jsx)(c,{size:20})}),(0,v.jsxs)(`div`,{children:[(0,v.jsx)(`h4`,{className:`text-xs font-bold text-white uppercase tracking-wider`,children:`Your Developer API Key`}),(0,v.jsx)(`code`,{className:`text-xs font-mono text-textMuted bg-transparent p-0 block mt-0.5`,children:n?.api_key})]})]}),(0,v.jsxs)(`div`,{className:`flex gap-2`,children:[(0,v.jsx)(o,{text:n?.api_key||``,label:`Copy Token`}),(0,v.jsx)(p,{variant:`secondary`,size:`sm`,onClick:w,children:`Regenerate`})]})]}),(0,v.jsxs)(`div`,{className:`grid grid-cols-1 lg:grid-cols-3 gap-6 items-start`,children:[(0,v.jsxs)(`div`,{className:`lg:col-span-2 space-y-4`,children:[(0,v.jsxs)(`h3`,{className:`text-xs font-bold text-textSecondary uppercase tracking-wider flex items-center gap-1.5`,children:[(0,v.jsx)(h,{size:14,className:`text-primary-light`}),`API Methods & Parameters`]}),(0,v.jsx)(m,{className:`p-4 overflow-hidden`,children:(0,v.jsx)(a,{columns:[{key:`action`,title:`Action API Value`,render:(e,t)=>(0,v.jsxs)(`button`,{onClick:()=>x(t),className:`flex items-center gap-1.5 font-mono text-xs font-bold text-left px-2 py-1 rounded transition-colors w-full cursor-pointer
            ${b===t?`bg-primary text-white border-l-2 border-primary-light`:`text-textSecondary hover:text-white hover:bg-white/5`}
          `,children:[(0,v.jsx)(s,{size:12,className:b===t?`text-primary-light`:`opacity-0`}),`action = '`,e.action,`'`]})},{key:`method`,title:`Method`,render:e=>(0,v.jsx)(`span`,{className:`font-bold text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded`,children:e.method})},{key:`params`,title:`Required Parameters`,render:e=>(0,v.jsx)(`div`,{className:`flex flex-wrap gap-1`,children:e.params.map(e=>(0,v.jsx)(`code`,{className:`text-[10px] bg-bgDark py-0.5 px-1.5 rounded font-mono border border-border/40 text-textSecondary`,children:e},e))})}],data:S})})]}),(0,v.jsxs)(`div`,{className:`lg:col-span-1 space-y-4`,children:[(0,v.jsxs)(`div`,{className:`flex items-center justify-between`,children:[(0,v.jsxs)(`h3`,{className:`text-xs font-bold text-textSecondary uppercase tracking-wider flex items-center gap-1.5`,children:[(0,v.jsx)(g,{size:14,className:`text-primary-light`}),`Code Samples`]}),(0,v.jsx)(`div`,{className:`flex gap-1 bg-bgCard border border-border p-0.5 rounded-lg text-[10px] font-bold`,children:[{id:`js`,label:`NodeJS`},{id:`python`,label:`Python`},{id:`php`,label:`PHP`}].map(e=>(0,v.jsx)(`button`,{onClick:()=>y(e.id),className:`px-2 py-1 rounded cursor-pointer transition-colors
                    ${r===e.id?`bg-primary text-white`:`text-textSecondary hover:text-white`}
                  `,children:e.label},e.id))})]}),(0,v.jsxs)(m,{className:`bg-bgDark border border-border p-4 relative overflow-hidden flex flex-col justify-between max-h-[360px]`,children:[(0,v.jsx)(`div`,{className:`absolute top-2 right-2`,children:(0,v.jsx)(o,{text:E})}),(0,v.jsx)(`pre`,{className:`text-[10px] font-mono text-emerald-400 overflow-auto whitespace-pre leading-relaxed select-all`,children:(0,v.jsx)(`code`,{children:E})})]})]})]})]})};export{y as ApiDocsPage,y as default};