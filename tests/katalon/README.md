Katalon Smoke Tests

Overview
- This folder contains a minimal Katalon-compatible project layout with dynamic TestObjects (no Object Repository required).
- Includes a simple smoke test to open the app and verify the home page renders.

Prerequisites
- Katalon Studio or Katalon Runtime Engine (KRE) installed and licensed on Windows.
- Frontend running and accessible at the URL configured in `Profiles/Default.glbl` (BASE_URL).

Structure
- Profiles/Default.glbl — Global variables (BASE_URL).
- Test Cases/Smoke/01_LoadHome.groovy — Minimal smoke test.
- Test Suites/Smoke.ts — Test Suite referencing the smoke test.

How to Run (Studio)
1. Open Katalon Studio.
2. File → Open Project → select this folder `neurocare/tests/katalon`.
3. Select Test Suite: `Test Suites/Smoke`.
4. Choose execution profile `Default` and browser (Chrome recommended).
5. Click Run.

How to Run (KRE CLI)
Example PowerShell (adjust paths):

```powershell
$KatalonExe = "C:\\Katalon\\katalonc.exe"
$Proj = "D:\\neuro\\neurocare\\tests\\katalon"
$ReportDir = "D:\\neuro\\neurocare\\tests\\katalon\\Reports"
& $KatalonExe -noSplash -runMode=console -projectPath="$Proj" `
  -retry=0 -testSuitePath="Test Suites/Smoke" -executionProfile="Default" `
  -browserType="Chrome" -reportFolder="$ReportDir" -apiKey="$env:KATALON_API_KEY"
```

Config
- Update `Profiles/Default.glbl` with your BASE_URL (e.g., `http://localhost:5173`).

Notes
- The smoke test does not require credentials and only validates that the home page loads and key text is present.



