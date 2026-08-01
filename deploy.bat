@echo off
chcp 65001 > nul
cls

echo ============================================
echo   BLOCK BLAST - AUTO DEV TO MAIN DEPLOY
echo ============================================
echo.

:: 1. Commit message input
set /p msg="1. Enter commit message: "

if "%msg%"=="" (
    echo [ERROR] Commit message cannot be empty!
    pause
    exit /b
)

echo.
:: 2. Version number input
set /p ver="2. Enter version number including the letter v (eg. v2.4): "

if "%ver%"=="" (
    echo [ERROR] Version number cannot be empty!
    pause
    exit /b
)

:: Concatenate full commit message
set FULL_COMMIT_MSG=%msg% %ver% - stable

echo.
echo ============================================
echo Commit message: "%FULL_COMMIT_MSG%"
echo Updating sw.js to version: block-blast-%ver%
echo ============================================
echo.

:: 3. Update sw.js CACHE_NAME using PowerShell
powershell -Command "(Get-Content sw.js) -replace 'const CACHE_NAME = .*;', 'const CACHE_NAME = ''block-blast-%ver%'';' | Set-Content sw.js"

echo [OK] sw.js updated successfully!
echo.

:: 4. Git workflow execution
echo --------------------------------------------
echo 1. DEV branch commit and push
echo --------------------------------------------
git add .
git commit -m "%FULL_COMMIT_MSG%"
git push

echo.
echo --------------------------------------------
echo 2. Switch to MAIN, PULL, MERGE and PUSH
echo --------------------------------------------
(
  git checkout main
  git pull origin main
  git merge dev
  git push origin main
  git checkout dev
  git merge main
  git push origin dev
)

echo.
echo ============================================
echo SUCCESSFUL DEPLOY! (dev - main - dev synced)
echo ============================================
echo.
pause