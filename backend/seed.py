import os
import django
import sys
from datetime import date, timedelta
from decimal import Decimal

# Set up Django environment
local_site = os.path.expanduser("~/.local/lib/python3.10/site-packages")
if os.path.exists(local_site) and local_site not in sys.path:
    sys.path.insert(0, local_site)

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from projects.models import Project
from tasks.models import Task
from resources.models import Resource
from finance.models import PaymentRequest

User = get_user_model()

today = date.today()


def create_user(email, password, name, role, is_super=False):
    if User.objects.filter(email=email).exists():
        return User.objects.get(email=email)
    if is_super:
        u = User.objects.create_superuser(email=email, password=password, name=name, role=role)
    else:
        u = User.objects.create_user(email=email, password=password, name=name, role=role)
    print(f"  Created user: {email} [{role}]")
    return u


def seed():
    print("\n[SEED] Seeding InfraSetu database...\n")

    # ─── Users ────────────────────────────────────────────────────────────────
    print("Creating users...")

    gov = create_user(
        "gov@infrasetu.in", "demo1234",
        "Rajesh Kumar", "GOVT", is_super=True
    )
    manager = create_user(
        "manager@infrasetu.in", "demo1234",
        "Priya Sharma", "MANAGER"
    )
    engineer = create_user(
        "engineer@infrasetu.in", "demo1234",
        "Arjun Singh", "ENGINEER"
    )
    contractor = create_user(
        "contractor@infrasetu.in", "demo1234",
        "Vikram Patel", "CONTRACTOR"
    )
    worker = create_user(
        "worker@infrasetu.in", "demo1234",
        "Ravi Yadav", "WORKER"
    )
    auditor = create_user(
        "auditor@infrasetu.in", "demo1234",
        "Meena Iyer", "AUDITOR"
    )

    # ─── Resources ────────────────────────────────────────────────────────────
    if not Resource.objects.exists():
        print("\nCreating resources...")
        resources = [
            ("MATERIAL", "Portland Cement OPC 53 (50kg bags)", 2400, "Bags"),
            ("MATERIAL", "TMT Steel Rebar Fe500 (12mm)", 120, "MT"),
            ("MATERIAL", "Coarse Aggregate 20mm", 850, "cum"),
            ("MATERIAL", "River Sand (Zone II)", 600, "cum"),
            ("MATERIAL", "AAC Blocks 600x200x150", 12000, "pieces"),
            ("MATERIAL", "HDPE Pipes 200mm dia", 2000, "mtrs"),
            ("EQUIPMENT", "Excavator JCB 3DX", 3, "nos"),
            ("EQUIPMENT", "Tower Crane TC-6024", 2, "nos"),
            ("EQUIPMENT", "Concrete Transit Mixer (7 cum)", 4, "nos"),
            ("EQUIPMENT", "Vibratory Road Roller", 2, "nos"),
            ("EQUIPMENT", "Batching Plant 30m3/hr", 1, "nos"),
            ("WORKER", "Mason (Skilled)", 48, "persons"),
            ("WORKER", "Welder (Certified)", 18, "persons"),
            ("WORKER", "Electrician (ITI)", 12, "persons"),
            ("WORKER", "Bar Bender / Steel Fixer", 22, "persons"),
            ("WORKER", "Shuttering Carpenter", 20, "persons"),
            ("WORKER", "Unskilled Helper", 140, "persons"),
            ("WORKER", "Road Roller Operator", 4, "persons"),
        ]
        for rtype, name, qty, unit in resources:
            Resource.objects.create(
                type=rtype, name=name, quantity=qty,
                unit=unit if hasattr(Resource, 'unit') else None,
                status="AVAILABLE"
            )
        print(f"  Created {len(resources)} resources.")

    # ─── Projects ─────────────────────────────────────────────────────────────
    if not Project.objects.exists():
        print("\nCreating projects...")

        p1 = Project.objects.create(
            name="NH-48 Highway Expansion – Phase 2",
            location="Gurugram–Faridabad Corridor, Haryana",
            status="In Progress",
            budget=Decimal("50000000"),
            progress=63,
            start_date=today - timedelta(days=270),
            end_date=today + timedelta(days=180)
        )

        p2 = Project.objects.create(
            name="Government School Complex – Noida Sector 62",
            location="Sector 62, Noida, Uttar Pradesh",
            status="In Progress",
            budget=Decimal("28000000"),
            progress=44,
            start_date=today - timedelta(days=200),
            end_date=today + timedelta(days=240)
        )

        p3 = Project.objects.create(
            name="Water Treatment Plant – Ghaziabad",
            location="Industrial Area, Ghaziabad, UP",
            status="Planning",
            budget=Decimal("40000000"),
            progress=18,
            start_date=today - timedelta(days=60),
            end_date=today + timedelta(days=400)
        )

        p4 = Project.objects.create(
            name="Rural Road Connectivity – Mewat",
            location="Mewat District, Haryana",
            status="In Progress",
            budget=Decimal("22000000"),
            progress=42,
            start_date=today - timedelta(days=75),
            end_date=today + timedelta(days=500)
        )

        print("  Created 4 projects.")

        # ─── Tasks ────────────────────────────────────────────────────────────
        print("\nCreating tasks...")

        p1_tasks = [
            ("Foundation Excavation – Zone A", "Complete excavation for main pillars Zone A", "Completed", "High", -90, -60),
            ("Steel Reinforcement – Pier Framework", "Install TMT rebar cage for all piers Section 1-5", "Completed", "High", -70, -40),
            ("Concrete Pouring – Section 3 Carriageway", "Pour M25 concrete for Section 3 roadway slab", "In Progress", "Critical", -20, 10),
            ("Drainage System Installation – Km 18-22", "Install drains, culverts and outfall channels", "In Progress", "High", -10, 20),
            ("Asphalt Laying – Trial Strip Km 5", "Experimental asphalt strip — monitoring settlement", "Pending", "Medium", 5, 15),
            ("Traffic Signal Foundations – Junction 3 & 4", "PCC foundation for signal poles at 4 junctions", "Pending", "Medium", 10, 25),
        ]
        for title, desc, status, priority, start_off, due_off in p1_tasks:
            Task.objects.create(
                project=p1, title=title, description=desc,
                status=status, priority=priority,
                due_date=today + timedelta(days=due_off)
            )

        p2_tasks = [
            ("Foundation & Basement – Block A", "RCC foundation and basement slab for Block A", "Completed", "High", -120, -80),
            ("Structural Framing – Block A Ground Floor", "Column and beam cast up to plinth level", "Completed", "High", -90, -50),
            ("Block Masonry – Block A 1st Floor", "AAC block partition walls and slab shuttering", "In Progress", "High", -15, 20),
            ("Waterproofing – Basement Slab", "Apply bituminous waterproofing membrane 1200 sqm", "In Progress", "High", -5, 15),
            ("Electrical Conduit – Block A 2nd Floor", "PVC conduit laying for electrical wiring", "Pending", "Medium", 5, 30),
            ("Scaffolding Setup – Block B", "Tubular scaffolding for Block B 4-storey construction", "Pending", "Critical", 2, 20),
        ]
        for title, desc, status, priority, start_off, due_off in p2_tasks:
            Task.objects.create(
                project=p2, title=title, description=desc,
                status=status, priority=priority,
                due_date=today + timedelta(days=due_off)
            )

        p3_tasks = [
            ("EIA Report – Phase 1 Deliverable", "Environmental impact assessment preparation", "In Progress", "High", -30, 15),
            ("Site Survey & Layout Marking", "Topographic survey and plot boundary marking", "Completed", "Medium", -55, -40),
            ("HDPE Pipe Procurement", "Source and procure 1500m of 200mm dia HDPE pipes", "In Progress", "High", -10, 20),
            ("Soil Bearing Capacity Testing", "Geo-technical investigation for foundation design", "Pending", "Medium", 0, 30),
        ]
        for title, desc, status, priority, start_off, due_off in p3_tasks:
            Task.objects.create(
                project=p3, title=title, description=desc,
                status=status, priority=priority,
                due_date=today + timedelta(days=due_off)
            )

        p4_tasks = [
            ("Alignment Survey – All Villages", "Route finalization for 38 km road connectivity", "Completed", "Medium", -75, -60),
            ("Sub-grade Preparation – Phase 1 (0-20km)", "Earthwork compaction and sub-grade preparation", "Completed", "High", -60, -30),
            ("WBM Layer – Villages 1-10", "Water Bound Macadam base course 150mm thick", "Completed", "High", -40, -10),
            ("WBM Layer – Villages 11-22", "WBM second phase — ongoing", "In Progress", "High", -5, 20),
            ("Culvert Construction – 18 locations", "Minor box culverts at stream crossings", "In Progress", "High", -10, 30),
            ("Bituminous Surfacing – Phase 1", "BC layer 40mm + DBM 50mm on completed WBM sections", "Pending", "Critical", 15, 45),
        ]
        for title, desc, status, priority, start_off, due_off in p4_tasks:
            Task.objects.create(
                project=p4, title=title, description=desc,
                status=status, priority=priority,
                due_date=today + timedelta(days=due_off)
            )

        print(f"  Created {Task.objects.count()} tasks across 4 projects.")

    # ─── Payment Requests ──────────────────────────────────────────────────────
    if not PaymentRequest.objects.exists():
        print("\nCreating payment requests...")
        projects = list(Project.objects.all())

        payment_data = [
            # project_index, amount, description, status
            (0, Decimal("4840000"), "TMT Steel Rebar – Shree Steel Industries (PO#1)", "APPROVED"),
            (0, Decimal("350000"),  "Tower Crane TC-6024 rental – June 2026", "PAID"),
            (1, Decimal("304000"),  "OPC Cement supply – Rajasthan Cement Corp", "PENDING"),
            (2, Decimal("850000"),  "EIA Consultancy Services – Green Consult Associates", "PENDING"),
            (0, Decimal("4500000"), "Skilled labor wages – June 2026 (450 workers)", "PAID"),
            (0, Decimal("180000"),  "Excavator JCB 3DX monthly rental", "APPROVED"),
            (1, Decimal("320000"),  "Waterproofing compound – basement slab", "PENDING"),
            (2, Decimal("420000"),  "Soil testing and geo-technical survey", "APPROVED"),
            (3, Decimal("680000"),  "WBM aggregate supply – 2000 cum", "APPROVED"),
            (3, Decimal("240000"),  "Culvert construction material – PCC M10", "PENDING"),
        ]
        for proj_idx, amount, desc, status in payment_data:
            if proj_idx < len(projects):
                PaymentRequest.objects.create(
                    project=projects[proj_idx],
                    amount=amount,
                    description=desc,
                    status=status,
                    contractor=contractor
                )
        print(f"  Created {PaymentRequest.objects.count()} payment requests.")

    print("\n[OK] Seeding complete!\n")
    print("Demo login credentials:")
    print("  gov@infrasetu.in       → password: demo1234  [Government Authority]")
    print("  manager@infrasetu.in   → password: demo1234  [Project Manager]")
    print("  engineer@infrasetu.in  → password: demo1234  [Site Engineer]")
    print("  contractor@infrasetu.in→ password: demo1234  [Contractor]")
    print("  worker@infrasetu.in    → password: demo1234  [Worker]")
    print("  auditor@infrasetu.in   → password: demo1234  [Auditor]")


if __name__ == "__main__":
    seed()
