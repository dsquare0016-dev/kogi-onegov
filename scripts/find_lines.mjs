import fs from "fs";

const content = fs.readFileSync("c:/kogi-onegov_Postgress/src/lib/postgres-service.ts", "utf8");
const lines = content.split("\n");

console.log("SEARCH RESULTS:");
lines.forEach((line, i) => {
  if (line.includes("dbSaveRecruitmentCampaign")) {
    console.log(`${i + 1}: ${line}`);
  }
});
