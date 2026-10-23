import { text, number, flag, list, object, hash, report, unique, safePath, type Lesson, type Input } from "./core";

// A focused local experiment derived from this lesson’s reviewed presentation.
export const lesson: Lesson = {
  number: 52,
  title: "Review Panels and Agent Voting",
  description: "Suppose three agents review the same design and disagree. A structured panel can make that disagreement visible and apply a declared rule before the workflow continues.",
  concepts: ["Bind votes to frozen roster and proposal", "Reject duplicate or stale panel votes", "A panel is not distributed consensus"],
  scope: "Tallies a local three-member review panel with fixed producer bindings. It does not launch independent model reviewers. Each run starts from a fresh local seed. The run journal stores results, not production workflow state.",
  cases: [{"id": "0", "label": "Two approvals and an abstention", "input": {"votes": ["approve", "approve", "abstain"], "duplicateIdentity": false, "staleProposal": false}, "expected": "passed", "checks": {"approvals": 2}}, {"id": "1", "label": "Reject a negative panel vote", "input": {"votes": ["approve", "approve", "reject"], "duplicateIdentity": false, "staleProposal": false}, "expected": "rejected", "checks": {"approvals": 2}}, {"id": "2", "label": "Reject a duplicated voter", "input": {"votes": ["approve", "approve", "approve"], "duplicateIdentity": true, "staleProposal": false}, "expected": "rejected", "checks": {}}],
  async run(input) {

const votes=list(input,"votes").map(String);if(votes.some(v=>!["approve","reject","abstain"].includes(v)))throw new Error("Unknown vote value");
if(flag(input,"duplicateIdentity")||flag(input,"staleProposal"))return report("rejected","Duplicate producer or stale proposal binding",{},["Authenticate roster bindings","Reject conflicting vote identity and proposal hashes"]);
const approvals=votes.filter(v=>v==="approve").length,rejections=votes.filter(v=>v==="reject").length,passed=votes.length===3&&approvals>=2&&rejections===0;
return report(passed?"passed":"rejected",passed?"The local panel rule was met":"The local panel rule was not met",{approvals,rejections,abstentions:votes.filter(v=>v==="abstain").length,decisionScope:"recommendation only",deploymentAuthorized:false},["Freeze the roster and proposal","Count each producer once","Wait for all three votes","Keep required human review separate"]);

  }
};
