$filePath = "c:\Users\Katakam Varun Kumar\Major Project\CampVerse\src\pages\student\Profile.tsx"
$content = Get-Content $filePath -Raw

# Fix line 236 - remove the escaped backslashes
$content = $content -replace [regex]::Escape('console.log(\"✅ Profile saved to MongoDB successfully!\"); alert(\"Profile saved successfully!\");'), @'
console.log("✅ Profile saved to MongoDB successfully!");
        alert("Profile saved successfully!");
'@

Set-Content $filePath -Value $content -NoNewline
Write-Host "✅ Fixed line 236 syntax error!"
