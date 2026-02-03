$filePath = "c:\Users\Katakam Varun Kumar\Major Project\CampVerse\src\pages\student\Profile.tsx"
$content = Get-Content $filePath -Raw

# Fix line 129
$content = $content -replace 'const studentProfile = await api\.get\(`/users/\$\{userData\.uid\}`\);`n\s+console\.log\("📥 Fetched profile from MongoDB:", studentProfile\);', @'
const studentProfile = await api.get(`/users/${userData.uid}`);
          console.log("📥 Fetched profile from MongoDB:", studentProfile);
'@

Set-Content $filePath -Value $content -NoNewline
Write-Host "File fixed successfully!"
