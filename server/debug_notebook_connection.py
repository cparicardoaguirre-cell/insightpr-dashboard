
import asyncio
import os
import sys

# Add the MCP module path if needed, though usually installed in venv
# Assuming the user is running this with the venv python

try:
    from notebooklm_tools.lib.api import NotebookLMClient
    print("Module imported successfully.")
except ImportError:
    print("Error: Could not import notebooklm_tools. Are you using the correct venv?")
    sys.exit(1)

async def main():
    print("Attempting to connect to NotebookLM...")
    try:
        client = NotebookLMClient()
        # This usually triggers auth flow or uses existing credentials
        notebooks = await client.list_notebooks()
        
        print(f"\nSUCCESS: Found {len(notebooks)} notebooks.")
        for nb in notebooks:
            print(f"- {nb.title} (ID: {nb.id})")
            
        nlts_found = any('NLTS' in nb.title for nb in notebooks)
        if nlts_found:
             print("\nVERIFICATION: 'NLTS-PR' notebook found!")
        else:
             print("\nWARNING: 'NLTS-PR' notebook NOT found in the list.")

    except Exception as e:
        print(f"\nFAILURE: Could not connect. Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
