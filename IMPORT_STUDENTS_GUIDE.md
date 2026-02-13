# 📚 Import Students to Firebase - Quick Guide

You're only seeing 3 students (C1, C2, C3) because Firebase doesn't have the full student data.

## 🚀 Quick Solution: Import Students via Firebase Console

### Step 1: Open Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: **campverse-2004**
3. Click **Realtime Database** in the left menu

### Step 2: Import Student Data
1. Click on the **three dots menu (⋮)** at the top right of your database
2. Select **Import JSON**
3. Upload the JSON file below, OR
4. Manually add data by clicking the **+** button

### Step 3: JSON Data to Import

Copy the JSON below and save it as `students.json`, then import it:

```json
{
  "students": {
    "section_B": {
      "22B81A05B01": {"rollNumber": "22B81A05B01", "name": "Student B01", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B02": {"rollNumber": "22B81A05B02", "name": "Student B02", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B03": {"rollNumber": "22B81A05B03", "name": "Student B03", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B04": {"rollNumber": "22B81A05B04", "name": "Student B04", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B05": {"rollNumber": "22B81A05B05", "name": "Student B05", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B06": {"rollNumber": "22B81A05B06", "name": "Student B06", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B07": {"rollNumber": "22B81A05B07", "name": "Student B07", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B08": {"rollNumber": "22B81A05B08", "name": "Student B08", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B09": {"rollNumber": "22B81A05B09", "name": "Student B09", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B10": {"rollNumber": "22B81A05B10", "name": "Student B10", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B11": {"rollNumber": "22B81A05B11", "name": "Student B11", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B12": {"rollNumber": "22B81A05B12", "name": "Student B12", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B13": {"rollNumber": "22B81A05B13", "name": "Student B13", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B14": {"rollNumber": "22B81A05B14", "name": "Student B14", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B15": {"rollNumber": "22B81A05B15", "name": "Student B15", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B16": {"rollNumber": "22B81A05B16", "name": "Student B16", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B17": {"rollNumber": "22B81A05B17", "name": "Student B17", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B18": {"rollNumber": "22B81A05B18", "name": "Student B18", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B19": {"rollNumber": "22B81A05B19", "name": "Student B19", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B20": {"rollNumber": "22B81A05B20", "name": "Student B20", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B21": {"rollNumber": "22B81A05B21", "name": "Student B21", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B22": {"rollNumber": "22B81A05B22", "name": "Student B22", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B23": {"rollNumber": "22B81A05B23", "name": "Student B23", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B24": {"rollNumber": "22B81A05B24", "name": "Student B24", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B25": {"rollNumber": "22B81A05B25", "name": "Student B25", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B26": {"rollNumber": "22B81A05B26", "name": "Student B26", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B27": {"rollNumber": "22B81A05B27", "name": "Student B27", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B28": {"rollNumber": "22B81A05B28", "name": "Student B28", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B29": {"rollNumber": "22B81A05B29", "name": "Student B29", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B30": {"rollNumber": "22B81A05B30", "name": "Student B30", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B31": {"rollNumber": "22B81A05B31", "name": "Student B31", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B32": {"rollNumber": "22B81A05B32", "name": "Student B32", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B33": {"rollNumber": "22B81A05B33", "name": "Student B33", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B34": {"rollNumber": "22B81A05B34", "name": "Student B34", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B35": {"rollNumber": "22B81A05B35", "name": "Student B35", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B36": {"rollNumber": "22B81A05B36", "name": "Student B36", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B37": {"rollNumber": "22B81A05B37", "name": "Student B37", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B38": {"rollNumber": "22B81A05B38", "name": "Student B38", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B39": {"rollNumber": "22B81A05B39", "name": "Student B39", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B40": {"rollNumber": "22B81A05B40", "name": "Student B40", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B41": {"rollNumber": "22B81A05B41", "name": "Student B41", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B42": {"rollNumber": "22B81A05B42", "name": "Student B42", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B43": {"rollNumber": "22B81A05B43", "name": "Student B43", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B44": {"rollNumber": "22B81A05B44", "name": "Student B44", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B45": {"rollNumber": "22B81A05B45", "name": "Student B45", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B46": {"rollNumber": "22B81A05B46", "name": "Student B46", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B47": {"rollNumber": "22B81A05B47", "name": "Student B47", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B48": {"rollNumber": "22B81A05B48", "name": "Student B48", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B49": {"rollNumber": "22B81A05B49", "name": "Student B49", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B50": {"rollNumber": "22B81A05B50", "name": "Student B50", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B51": {"rollNumber": "22B81A05B51", "name": "Student B51", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B52": {"rollNumber": "22B81A05B52", "name": "Student B52", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B53": {"rollNumber": "22B81A05B53", "name": "Student B53", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B54": {"rollNumber": "22B81A05B54", "name": "Student B54", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B55": {"rollNumber": "22B81A05B55", "name": "Student B55", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B56": {"rollNumber": "22B81A05B56", "name": "Student B56", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B57": {"rollNumber": "22B81A05B57", "name": "Student B57", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B58": {"rollNumber": "22B81A05B58", "name": "Student B58", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B59": {"rollNumber": "22B81A05B59", "name": "Student B59", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B60": {"rollNumber": "22B81A05B60", "name": "Student B60", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B61": {"rollNumber": "22B81A05B61", "name": "Student B61", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B62": {"rollNumber": "22B81A05B62", "name": "Student B62", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B63": {"rollNumber": "22B81A05B63", "name": "Student B63", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B64": {"rollNumber": "22B81A05B64", "name": "Student B64", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B65": {"rollNumber": "22B81A05B65", "name": "Student B65", "section": "B", "branch": "05", "year": "22"},
      "22B81A05B66": {"rollNumber": "22B81A05B66", "name": "Student B66", "section": "B", "branch": "05", "year": "22"}
    },
    "section_C": {
      "22B81A05C01": {"rollNumber": "22B81A05C01", "name": "Student C01", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C02": {"rollNumber": "22B81A05C02", "name": "Student C02", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C03": {"rollNumber": "22B81A05C03", "name": "KATAKAM VARUN KUMAR", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C04": {"rollNumber": "22B81A05C04", "name": "Student C04", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C05": {"rollNumber": "22B81A05C05", "name": "Student C05", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C06": {"rollNumber": "22B81A05C06", "name": "Student C06", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C07": {"rollNumber": "22B81A05C07", "name": "Student C07", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C08": {"rollNumber": "22B81A05C08", "name": "Student C08", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C09": {"rollNumber": "22B81A05C09", "name": "Student C09", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C10": {"rollNumber": "22B81A05C10", "name": "Student C10", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C11": {"rollNumber": "22B81A05C11", "name": "Student C11", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C12": {"rollNumber": "22B81A05C12", "name": "Student C12", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C13": {"rollNumber": "22B81A05C13", "name": "Student C13", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C14": {"rollNumber": "22B81A05C14", "name": "Student C14", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C15": {"rollNumber": "22B81A05C15", "name": "Student C15", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C16": {"rollNumber": "22B81A05C16", "name": "Student C16", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C17": {"rollNumber": "22B81A05C17", "name": "Student C17", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C18": {"rollNumber": "22B81A05C18", "name": "Student C18", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C19": {"rollNumber": "22B81A05C19", "name": "Student C19", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C20": {"rollNumber": "22B81A05C20", "name": "Student C20", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C21": {"rollNumber": "22B81A05C21", "name": "Student C21", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C22": {"rollNumber": "22B81A05C22", "name": "Student C22", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C23": {"rollNumber": "22B81A05C23", "name": "Student C23", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C24": {"rollNumber": "22B81A05C24", "name": "Student C24", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C25": {"rollNumber": "22B81A05C25", "name": "Student C25", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C26": {"rollNumber": "22B81A05C26", "name": "Student C26", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C27": {"rollNumber": "22B81A05C27", "name": "Student C27", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C28": {"rollNumber": "22B81A05C28", "name": "Student C28", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C29": {"rollNumber": "22B81A05C29", "name": "Student C29", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C30": {"rollNumber": "22B81A05C30", "name": "Student C30", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C31": {"rollNumber": "22B81A05C31", "name": "Student C31", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C32": {"rollNumber": "22B81A05C32", "name": "Student C32", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C33": {"rollNumber": "22B81A05C33", "name": "Student C33", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C34": {"rollNumber": "22B81A05C34", "name": "Student C34", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C35": {"rollNumber": "22B81A05C35", "name": "Student C35", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C36": {"rollNumber": "22B81A05C36", "name": "Student C36", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C37": {"rollNumber": "22B81A05C37", "name": "Student C37", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C38": {"rollNumber": "22B81A05C38", "name": "Student C38", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C39": {"rollNumber": "22B81A05C39", "name": "Student C39", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C40": {"rollNumber": "22B81A05C40", "name": "Student C40", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C41": {"rollNumber": "22B81A05C41", "name": "Student C41", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C42": {"rollNumber": "22B81A05C42", "name": "Student C42", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C43": {"rollNumber": "22B81A05C43", "name": "Student C43", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C44": {"rollNumber": "22B81A05C44", "name": "Student C44", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C45": {"rollNumber": "22B81A05C45", "name": "Student C45", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C46": {"rollNumber": "22B81A05C46", "name": "Student C46", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C47": {"rollNumber": "22B81A05C47", "name": "Student C47", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C48": {"rollNumber": "22B81A05C48", "name": "Student C48", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C49": {"rollNumber": "22B81A05C49", "name": "Student C49", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C50": {"rollNumber": "22B81A05C50", "name": "Student C50", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C51": {"rollNumber": "22B81A05C51", "name": "Student C51", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C52": {"rollNumber": "22B81A05C52", "name": "Student C52", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C53": {"rollNumber": "22B81A05C53", "name": "Student C53", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C54": {"rollNumber": "22B81A05C54", "name": "Student C54", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C55": {"rollNumber": "22B81A05C55", "name": "Student C55", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C56": {"rollNumber": "22B81A05C56", "name": "Student C56", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C57": {"rollNumber": "22B81A05C57", "name": "Student C57", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C58": {"rollNumber": "22B81A05C58", "name": "Student C58", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C59": {"rollNumber": "22B81A05C59", "name": "Student C59", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C60": {"rollNumber": "22B81A05C60", "name": "Student C60", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C61": {"rollNumber": "22B81A05C61", "name": "Student C61", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C62": {"rollNumber": "22B81A05C62", "name": "Student C62", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C63": {"rollNumber": "22B81A05C63", "name": "Student C63", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C64": {"rollNumber": "22B81A05C64", "name": "Student C64", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C65": {"rollNumber": "22B81A05C65", "name": "Student C65", "section": "C", "branch": "05", "year": "22"},
      "22B81A05C66": {"rollNumber": "22B81A05C66", "name": "Student C66", "section": "C", "branch": "05", "year": "22"}
    }
  }
}
```

### Alternative: Use Browser Console

If you want a quicker method, you can run this in your browser console while logged into CampVerse:

1. Open your CampVerse app in browser
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Paste and run this code:

```javascript
// This will add students to Firebase from your browser
const addStudents = async () => {
    // Import Firebase functions
    const { database } = await import('/src/lib/firebase.ts');
    const { ref, set } = await import('firebase/database');
    
    // Generate students for Section B
    for (let i = 1; i <= 66; i++) {
        const num = i.toString().padStart(2, '0');
        const rollNo = `22B81A05B${num}`;
        await set(ref(database, `students/section_B/${rollNo}`), {
            rollNumber: rollNo,
            name: `Student B${num}`,
            section: 'B',
            branch: '05',
            year: '22'
        });
    }
    
    console.log('✅ Added 66 Section B students');
};

addStudents();
```

## ⚠️ Important Notes

1. **Existing Data**: If you already have student data in a different format, we need to match that format
2. **Real Names**: Replace "Student B01", "Student B02", etc. with actual student names
3. **After Import**: Refresh your CampVerse app to see the new students

## 📋 Do you have a Student Excel/CSV file?

If you have a spreadsheet with all student names and roll numbers, share it with me and I'll create a proper import file for you!
