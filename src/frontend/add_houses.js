const fs = require("fs");
const file = "src/lib/mockData.ts";
let content = fs.readFileSync(file, 'utf8');

let extraProjects = [];
let SITES = [];
const baseLat = 28.5355; 
const baseLng = 77.3910; 

for(let i = 1; i <= 20; i++) {
  const pId = "phouse_" + i;
  const sId = "shouse_" + i;
  
  // Create slightly grouped offsets
  const latOffset = (Math.random() - 0.5) * 0.05;
  const lngOffset = (Math.random() - 0.5) * 0.05;
  
  extraProjects.push(`  {
    id: "${pId}",
    name: "Awas Yojana Phase ${i}",
    location: "Sector ${100 + i}, Greater Noida",
    status: "active",
    budget: 5000000,
    actualCost: 2000000,
    progress: ${Math.floor(Math.random() * 80) + 10},
    startDate: "2024-01-01",
    endDate: "2025-12-31",
    description: "Affordable housing construction under PM Awas Yojana.",
    teamMembers: ["u2"],
    createdBy: "u1",
    createdAt: now - 30 * day,
    milestones: []
  }`);

  SITES.push(`  {
    id: "${sId}",
    name: "Awas Yojana Phase ${i}",
    address: "Greater Noida, UP",
    projectId: "${pId}",
    geoLat: ${baseLat + latOffset},
    geoLng: ${baseLng + lngOffset},
    geoRadius: 50,
    status: "active",
    managerName: "Priya Sharma",
    totalWorkers: ${Math.floor(Math.random() * 50) + 20},
    createdAt: now - 30 * day,
  }`);
}

const pStr = extraProjects.join(",\n");
const sStr = SITES.join(",\n");

content = content.replace("export const EXTRA_PROJECTS: Project[] = [", "export const EXTRA_PROJECTS: Project[] = [\n" + pStr + ",");
content = content.replace("export const SITES: Site[] = [", "export const SITES: Site[] = [\n" + sStr + ",");

fs.writeFileSync(file, content);
console.log("Injected 20 clustered housing projects.");
