# C52 · Review Panels and Agent Voting

Tallies a local three-member review panel with fixed producer bindings. It does not launch independent model reviewers. Each run starts from a fresh local seed. The run journal stores results, not production workflow state.

## Concepts students will learn

- Bind votes to frozen roster and proposal
- Reject duplicate or stale panel votes
- A panel is not distributed consensus

## Configure and run

Use Node.js 24 or later. In PowerShell, from this repository's folder:

```powershell
node --version
npm ci
Copy-Item .env.example .env
notepad .env
```

No API key is required for the local experiment. Optional live commentary requires your own API key, agent ID and environment ID. It explains the local result; it does not activate the integration discussed in the lesson.

For the optional live path, set your API key, then run npm run setup if you do not already have resource IDs. The script creates the environment before a text-only agent, saves each ID immediately, and reuses IDs already configured. It uses CLAUDE_MODEL or the source default; choose a model available to your account. An uncertain network failure may have created a resource: inspect your account before retrying.

```powershell
npm start
```

Open `http://127.0.0.1:3052`. Navigation leads to `/guide.html#learning`, `/guide.html#run-guide`, `/architecture.html`, and the application lab. If you change `PORT`, use the configured port. Keep the terminal running; stop with Ctrl+C. `npm run dev` also starts the web application.

Select the first scenario, inspect its editable fields, press Run experiment, and compare the outcome and evidence with the table above. Select another scenario to investigate the boundary condition.

## Create your .env file

Copy `.env.example` to `.env` and enter your own values. Do not commit the real file. Restart the server after editing it. The example contains safe placeholders; optional settings may be left blank to use source defaults. Resource IDs and keys stay on the server.

```dotenv
ANTHROPIC_API_KEY=your_api_key
CLAUDE_MANAGED_AGENT_ID=your_agent_id
CLAUDE_MANAGED_ENVIRONMENT_ID=your_environment_id
PORT=3052
```

## How the app was build

### 1. Validate vote values and proposal bindings

Only approve, reject and abstain are supported. A supplied duplicate-identity or stale-proposal signal rejects the local panel before votes are counted.

Source: [src/lesson.ts](src/lesson.ts#L13) · selected statements

```typescript
const votes = list(input, "votes").map(String);

// ... other source statements omitted ...
if (flag(input, "duplicateIdentity") || flag(input, "staleProposal"))
  return report("rejected", "Duplicate producer or stale proposal binding", {}, [
    "Authenticate roster bindings",
    "Reject conflicting vote identity and proposal hashes",
  ]);
```

### 2. Apply the explicit panel rule

The panel needs all three votes, at least two approvals and no rejection. The outcome is a recommendation with deploymentAuthorized:false; this is a local decision rule, not distributed consensus.

Source: [src/lesson.ts](src/lesson.ts#L15) · selected statements

```typescript
const approvals = votes.filter((v) => v === "approve").length,
  rejections = votes.filter((v) => v === "reject").length,
  passed = votes.length === 3 && approvals >= 2 && rejections === 0;

return report(
  passed ? "passed" : "rejected",
  passed ? "The local panel rule was met" : "The local panel rule was not met",
  {
    approvals,
    rejections,
    abstentions: votes.filter((v) => v === "abstain").length,
    decisionScope: "recommendation only",
    deploymentAuthorized: false,
  },
  [
    "Freeze the roster and proposal",
    "Count each producer once",
    "Wait for all three votes",
    "Keep required human review separate",
  ],
);
```

### Check your understanding

Run **Two approvals and an abstention** in the application. Compare the result with these scenario expectations:

```json
{
  "input": {
    "votes": [
      "approve",
      "approve",
      "abstain"
    ],
    "duplicateIdentity": false,
    "staleProposal": false
  },
  "expectedOutcome": "passed",
  "checkEvidence": {
    "approvals": 2
  }
}
```

Then try **Reject a negative panel vote**. Its expected outcome is `rejected`; identify the condition or evidence field that explains the difference.

## Validation

```powershell
npm test
python scripts/verify-walkthrough.py
```

The source hash check detects when walkthrough excerpts need refreshing. Browser verification covers page navigation, readable text, mobile layout, dark mode, diagram and image routes. Local scenarios and live provider calls are recorded separately in the workspace verification report; local success is not evidence of a live provider operation.

## Repository contents

Application sources, student web pages, safe configuration example and documentation images are included. `node_modules`, `presentation`, `output`, `reviewed`, `v3`, `teaching-material`, build output, local journals, credentials and local resource files are ignored. Existing teaching videos and presentations remain in the original workspace.
