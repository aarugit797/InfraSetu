import random
import time
import re

file_path = "src/lib/mockData.ts"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

extra_projects = []
SITES = []
baseLat = 28.5355
baseLng = 77.3910

for i in range(1, 21):
    pId = f"phouse_{i}"
    sId = f"shouse_{i}"
    
    latOffset = (random.random() - 0.5) * 0.05
    lngOffset = (random.random() - 0.5) * 0.05
    
    progress = random.randint(10, 90)
    workers = random.randint(20, 70)
    
    extra_projects.append(f"""  {{
    id: "{pId}",
    name: "Awas Yojana Phase {i}",
    location: "Sector {100 + i}, Greater Noida",
    status: "active",
    budget: 5000000,
    actualCost: 2000000,
    progress: {progress},
    startDate: "2024-01-01",
    endDate: "2025-12-31",
    description: "Affordable housing construction under PM Awas Yojana.",
    teamMembers: ["u2"],
    createdBy: "u1",
    createdAt: now - 30 * day,
    milestones: []
  }}""")

    SITES.append(f"""  {{
    id: "{sId}",
    name: "Awas Yojana Phase {i}",
    address: "Greater Noida, UP",
    projectId: "{pId}",
    geoLat: {baseLat + latOffset},
    geoLng: {baseLng + lngOffset},
    geoRadius: 50,
    status: "active",
    managerName: "Priya Sharma",
    totalWorkers: {workers},
    createdAt: now - 30 * day,
  }}""")

pStr = ",\n".join(extra_projects)
sStr = ",\n".join(SITES)

content = content.replace("export const EXTRA_PROJECTS: Project[] = [", "export const EXTRA_PROJECTS: Project[] = [\n" + pStr + ",")
content = content.replace("export const SITES: Site[] = [", "export const SITES: Site[] = [\n" + sStr + ",")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Injected 20 clustered housing projects.")
