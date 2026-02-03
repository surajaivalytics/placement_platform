
import os
import difflib

files_to_compare = [
    r"src\app\(dashboard)\dashboard\mock-tests\page.tsx",
    r"src\app\(dashboard)\admin\mock-tests\page.tsx",
    r"src\app\api\tests\route.ts",
    r"src\app\(dashboard)\dashboard\my-tests\page.tsx",
    r"src\app\api\assignments\route.ts",
    r"src\app\actions\mock-drive.ts"
]

old_base = r"d:\placement_platform_old"
new_base = r"d:\placement_platform"

for f in files_to_compare:
    old_path = os.path.join(old_base, f)
    new_path = os.path.join(new_base, f)
    
    if not os.path.exists(old_path):
        print(f"MISSING IN OLD: {f}")
        continue
    if not os.path.exists(new_path):
        print(f"MISSING IN NEW: {f}")
        continue
        
    with open(old_path, 'r', encoding='utf-8') as f1:
        c1 = f1.read().splitlines()
    with open(new_path, 'r', encoding='utf-8') as f2:
        c2 = f2.read().splitlines()
        
    diff = list(difflib.unified_diff(c1, c2, lineterm='', fromfile="OLD", tofile="NEW"))
    if diff:
        print(f"DIFF DETECTED IN: {f}")
        for line in diff[:5]: # Show first 5 lines of diff
             print(line)
        print("...")
    else:
        print(f"IDENTICAL: {f}")
