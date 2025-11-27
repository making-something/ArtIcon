# Setup Git and Track Database
# This script initializes git and commits the database file

Write-Host "`n🔧 Setting up Git for ArtIcon project...`n" -ForegroundColor Cyan

# Check if git is already initialized
if (Test-Path .git) {
    Write-Host "✅ Git is already initialized" -ForegroundColor Green
} else {
    Write-Host "📝 Initializing git repository..." -ForegroundColor Yellow
    git init
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Git initialized successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to initialize git" -ForegroundColor Red
        exit 1
    }
}

# Check if remote exists
$remoteUrl = git remote get-url origin 2>$null

if ($remoteUrl) {
    Write-Host "✅ Remote already configured: $remoteUrl" -ForegroundColor Green
} else {
    Write-Host "`n📝 Adding remote repository..." -ForegroundColor Yellow
    $remote = Read-Host "Enter your GitHub repository URL (e.g., https://github.com/making-something/ArtIcon.git)"
    
    if ([string]::IsNullOrWhiteSpace($remote)) {
        Write-Host "❌ No remote URL provided" -ForegroundColor Red
        exit 1
    }
    
    git remote add origin $remote
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Remote added successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to add remote" -ForegroundColor Red
        exit 1
    }
}

# Check if database exists
if (-Not (Test-Path "backend\articon.db")) {
    Write-Host "`n⚠️  WARNING: Database file not found at backend\articon.db" -ForegroundColor Yellow
    Write-Host "   Make sure the database exists before committing" -ForegroundColor Yellow
    exit 1
}

# Show database info
$dbFile = Get-Item "backend\articon.db"
$dbSize = [math]::Round($dbFile.Length / 1KB, 2)
Write-Host "`n📊 Database file found:" -ForegroundColor Cyan
Write-Host "   Path: backend\articon.db" -ForegroundColor White
Write-Host "   Size: $dbSize KB" -ForegroundColor White
Write-Host "   Last Modified: $($dbFile.LastWriteTime)" -ForegroundColor White

# Check user count (if sqlite3 is available)
try {
    $userCount = sqlite3 backend\articon.db "SELECT COUNT(*) FROM participants;" 2>$null
    if ($userCount) {
        Write-Host "   Users: $userCount participants" -ForegroundColor White
    }
} catch {
    # sqlite3 not available, skip
}

# Add database to git
Write-Host "`n📦 Adding database to git..." -ForegroundColor Yellow
git add backend\articon.db

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database added to git" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to add database" -ForegroundColor Red
    exit 1
}

# Add all other files
Write-Host "`n📦 Adding all project files..." -ForegroundColor Yellow
git add .

# Show what will be committed
Write-Host "`n📋 Files to be committed:" -ForegroundColor Cyan
git status --short

# Ask for confirmation
Write-Host "`n"
$confirm = Read-Host "Do you want to commit these changes? (yes/no)"

if ($confirm -ne "yes" -and $confirm -ne "y") {
    Write-Host "`n❌ Commit cancelled" -ForegroundColor Yellow
    exit 0
}

# Commit
$commitMsg = Read-Host "`nEnter commit message (or press Enter for default)"
if ([string]::IsNullOrWhiteSpace($commitMsg)) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $commitMsg = "Initial commit with database - $timestamp"
}

Write-Host "`n💾 Committing changes..." -ForegroundColor Yellow
git commit -m $commitMsg

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Changes committed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Commit failed" -ForegroundColor Red
    exit 1
}

# Ask about pushing
Write-Host "`n"
$push = Read-Host "Do you want to push to remote? (yes/no)"

if ($push -eq "yes" -or $push -eq "y") {
    Write-Host "`n🚀 Pushing to remote..." -ForegroundColor Yellow
    
    # Check if this is the first push
    $branches = git branch -r 2>$null
    
    if (-Not $branches) {
        Write-Host "⚠️  This appears to be the first push" -ForegroundColor Yellow
        Write-Host "   Using: git push -u origin main --force" -ForegroundColor Yellow
        git push -u origin main --force
    } else {
        git push origin main
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Pushed to remote successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Push failed" -ForegroundColor Red
        Write-Host "   You may need to pull first or use --force" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "`n✅ Git setup complete!" -ForegroundColor Green
Write-Host "`n📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. On production server, run: git pull origin main" -ForegroundColor White
Write-Host "   2. Verify database exists: ls -lh backend/articon.db" -ForegroundColor White
Write-Host "   3. Restart backend: pm2 restart articon-backend" -ForegroundColor White
Write-Host "`n🎉 Your database will now persist across deployments!" -ForegroundColor Green

