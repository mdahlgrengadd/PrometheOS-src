"""
Simple Pipeline Verification Test
"""

import os
import json
from pathlib import Path


def main():
    print("🚀 PrometheOS Pipeline Verification")
    print("=" * 50)

    # Check if we're in the right directory
    if not Path("package.json").exists():
        print("❌ Not in project root")
        return

    print("✅ In project root directory")

    # Check key files
    files_to_check = [
        ("openapi.json", "OpenAPI Specification"),
        ("src/prometheos-client-generated/index.ts", "Generated TypeScript Client"),
        ("src/prometheos-client-python-generated/prometheos_client/__init__.py",
         "Generated Python Client"),
        ("src/prometheos-client/index.ts", "Custom TypeScript Wrapper"),
        ("src/prometheos-client-python/prometheos_client.py", "Custom Python Wrapper"),
        ("public/python-modules/prometheos/__init__.py", "Python Package"),
        ("public/python-modules/setup.py", "Package Setup"),
        ("public/wheels/prometheos-1.0.0-py3-none-any.whl", "Wheel Package"),
    ]

    print("\n📁 File Verification:")
    all_good = True
    for file_path, description in files_to_check:
        if Path(file_path).exists():
            print(f"✅ {description}")
        else:
            print(f"❌ Missing: {description}")
            all_good = False

    # Check OpenAPI content
    print("\n📝 OpenAPI Content:")
    try:
        with open("openapi.json", "r") as f:
            spec = json.load(f)
        print(f"✅ {len(spec.get('paths', {}))} API endpoints found")
        for path in list(spec.get('paths', {}).keys())[:3]:
            print(f"   • {path}")
    except Exception as e:
        print(f"❌ OpenAPI check failed: {e}")
        all_good = False

    print("\n" + "=" * 50)
    if all_good:
        print("🎉 PIPELINE VERIFICATION SUCCESSFUL!")
        print("✅ All components are in place")
        print("✅ Ready for end-to-end testing")
    else:
        print("❌ Some components missing")
        print("🔧 Run: npm run codegen && npm run create-python-package")

    print("=" * 50)


if __name__ == "__main__":
    main()
