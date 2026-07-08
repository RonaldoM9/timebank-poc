#!/usr/bin/env python3
"""Add issues #27-#34 to the TimeHeroes Plan été 2026 GitHub Project."""
import json, os, subprocess

TOKEN = open(os.path.expanduser("~/.git-credentials")).read()
for line in TOKEN.split("\n"):
    if "github.com" in line:
        TOKEN = line.split(":")[2].split("@")[0]
        break

PROJECT_ID = "PVT_kwHOC4TNbs4BcucY"
STATUS_FIELD_ID = "PVTSSF_lAHOC4TNbs4BcucYzhXVHIQ"
SPRINT_FIELD_ID = "PVTSSF_lAHOC4TNbs4BcucYzhXVHqg"

TODO_ID = "f75ad846"
SPRINT_22_30 = "d8c44d3f"  # 22-30 juillet
SPRINT_SEPT = "5d2e5d0a"   # Septembre

def gh_graphql(query, variables=None):
    data = {"query": query}
    if variables:
        data["variables"] = variables
    cmd = [
        "curl", "-s",
        "-H", f"Authorization: bearer {TOKEN}",
        "-H", "Content-Type: application/json",
        "-X", "POST", "https://api.github.com/graphql",
        "-d", json.dumps(data)
    ]
    r = subprocess.run(cmd, capture_output=True, text=True)
    return json.loads(r.stdout)

def add_item_to_project(content_id):
    """Add an issue to the project, returns the item node ID."""
    result = gh_graphql("""
        mutation($project: ID!, $content: ID!) {
            addProjectV2ItemById(input: {projectId: $project, contentId: $content}) {
                item { id }
            }
        }
    """, {"project": PROJECT_ID, "content": content_id})
    return result["data"]["addProjectV2ItemById"]["item"]["id"]

def set_status(item_id, option_id):
    """Set the Status field value."""
    gh_graphql("""
        mutation($project: ID!, $item: ID!, $field: ID!, $value: String!) {
            updateProjectV2ItemFieldValue(
                input: {projectId: $project, itemId: $item, fieldId: $field, value: {singleSelectOptionId: $value}}
            ) { projectV2Item { id } }
        }
    """, {"project": PROJECT_ID, "item": item_id, "field": STATUS_FIELD_ID, "value": option_id})

def set_sprint(item_id, option_id):
    """Set the Sprint field value."""
    gh_graphql("""
        mutation($project: ID!, $item: ID!, $field: ID!, $value: String!) {
            updateProjectV2ItemFieldValue(
                input: {projectId: $project, itemId: $item, fieldId: $field, value: {singleSelectOptionId: $value}}
            ) { projectV2Item { id } }
        }
    """, {"project": PROJECT_ID, "item": item_id, "field": SPRINT_FIELD_ID, "value": option_id})

# Issues: (number, node_id, title, sprint)
issues = [
    (27, "I_kwDOSwGB8M8AAAABIFNs0Q", "🎨 Hero : montage photo + carousel", SPRINT_22_30),
    (28, "I_kwDOSwGB8M8AAAABIFNtBw", "🎨 Images/catégories cards missions", SPRINT_22_30),
    (29, "I_kwDOSwGB8M8AAAABIFNtQA", "🎨 Section témoignages avec photos", SPRINT_22_30),
    (30, "I_kwDOSwGB8M8AAAABIFNtgQ", "🎨 Avatars automatiques", SPRINT_22_30),
    (31, "I_kwDOSwGB8M8AAAABIFNtug", "🎨 États vides illustrés", SPRINT_22_30),
    (32, "I_kwDOSwGB8M8AAAABIFNt7w", "🎨 Infographies impact SVG", SPRINT_22_30),
    (33, "I_kwDOSwGB8M8AAAABIFNuRQ", "📱 PWA — Service Worker + Manifest", SPRINT_SEPT),
    (34, "I_kwDOSwGB8M8AAAABIFNu-A", "📱 Notifications push", SPRINT_SEPT),
]

for num, node_id, title, sprint in issues:
    print(f"#{num} {title} ... ", end="", flush=True)
    try:
        item_id = add_item_to_project(node_id)
        set_status(item_id, TODO_ID)
        set_sprint(item_id, sprint)
        print(f"✅ ajouté au projet")
    except Exception as e:
        print(f"❌ {e}")
