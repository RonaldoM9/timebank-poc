#!/usr/bin/env python3
"""Fetch project board items."""
import json, os, subprocess

TOKEN = open(os.path.expanduser("~/.git-credentials")).read()
for line in TOKEN.split("\n"):
    if "github.com" in line:
        TOKEN = line.split(":")[2].split("@")[0]
        break

query = """
query {
  node(id: "PVT_kwHOC4TNbs4BcucY") {
    ... on ProjectV2 {
      items(first: 30) {
        nodes {
          id
          content {
            ... on Issue {
              number
              title
            }
          }
          fieldValues(first: 10) {
            nodes {
              ... on ProjectV2ItemFieldSingleSelectValue {
                name
                field {
                  ... on ProjectV2SingleSelectField {
                    name
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
"""

cmd = [
    "curl", "-s",
    "-H", f"Authorization: bearer {TOKEN}",
    "-H", "Content-Type: application/json",
    "-X", "POST", "https://api.github.com/graphql",
    "-d", json.dumps({"query": query})
]
r = subprocess.run(cmd, capture_output=True, text=True)
data = json.loads(r.stdout)

items = data.get("data", {}).get("node", {}).get("items", {}).get("nodes", [])
if not items:
    print("No items found or error:")
    print(json.dumps(data, indent=2)[:2000])
    exit(1)

rows = []
for item in items:
    issue = item.get("content")
    if not issue:
        continue
    num = issue["number"]
    title = issue["title"]

    status = "Todo"
    sprint = "-"
    for fv in item.get("fieldValues", {}).get("nodes", []):
        if fv and "name" in fv and "field" in fv and fv["field"]:
            field_name = fv["field"]["name"]
            if field_name == "Status":
                status = fv["name"]
            elif field_name == "Sprint":
                sprint = fv["name"]

    rows.append((num, title, status, sprint))

rows.sort(key=lambda r: r[0])

print(f"{'#':>4} | {'Tâche':65} | {'Statut':15} | {'Sprint':15}")
print("=" * 105)
for num, title, status, sprint in rows:
    print(f"{num:>4} | {title:65} | {status:15} | {sprint:15}")
