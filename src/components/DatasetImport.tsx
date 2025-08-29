import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Upload,
  FileText,
  Users,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
  FileSpreadsheet
} from 'lucide-react';
import { useDatasetImport, useStudentsList } from '@/hooks/useFirestore';
import { StudentProfile } from '@/services/firestoreService';
import * as XLSX from 'xlsx';

interface DatasetImportProps {
  onImportComplete?: () => void;
}

const DatasetImport: React.FC<DatasetImportProps> = ({ onImportComplete }) => {
  const [csvData, setCsvData] = useState('');
  const [parsedStudents, setParsedStudents] = useState<StudentProfile[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    importing, 
    importError, 
    importSuccess, 
    importStudentDataset, 
    parseCSVDataset 
  } = useDatasetImport();
  
  const { students: existingStudents, reloadStudents } = useStudentsList();

  // Sample CSV format
  const sampleCSV = `name,collegeId,email,year,section,branch,rollNumber,phone,dateOfBirth,address,cgpa,semester
John Doe,22B81A05C3,22B81A05C3@cvr.ac.in,22,A,05,C3,+91 9876543210,2003-01-15,Hyderabad,8.5,3
Jane Smith,22B81A05C4,22B81A05C4@cvr.ac.in,22,A,05,C4,+91 9876543211,2003-02-20,Hyderabad,9.0,3
Mike Johnson,22B81B05C1,22B81B05C1@cvr.ac.in,22,B,05,C1,+91 9876543212,2003-03-10,Hyderabad,7.8,3`;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCsvData(content);
        handleParseCSV(content);
      };
      reader.readAsText(file);
    }
  };

  const handleParseCSV = (data: string = csvData) => {
    try {
      const students = parseCSVDataset(data);
      setParsedStudents(students);
      setShowPreview(true);
    } catch (error) {
      console.error('Error parsing CSV:', error);
    }
  };

  const handleImport = async () => {
    if (parsedStudents.length === 0) return;

    const success = await importStudentDataset(parsedStudents);
    if (success) {
      setCsvData('');
      setParsedStudents([]);
      setShowPreview(false);
      reloadStudents();
      onImportComplete?.();
    }
  };

  const downloadSampleCSV = () => {
    const blob = new Blob([sampleCSV], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_students.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import Student Dataset
          </CardTitle>
          <CardDescription>
            Upload a CSV file or paste CSV data to import student information into the system.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Upload CSV File</Label>
            <div className="flex gap-2">
              <Input
                id="file-upload"
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="flex-1"
              />
              <Button 
                variant="outline" 
                onClick={downloadSampleCSV}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Sample CSV
              </Button>
            </div>
          </div>

          {/* Manual CSV Input */}
          <div className="space-y-2">
            <Label htmlFor="csv-data">Or Paste CSV Data</Label>
            <Textarea
              id="csv-data"
              placeholder="Paste your CSV data here..."
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              rows={8}
              className="font-mono text-sm"
            />
          </div>

          {/* Parse Button */}
          <div className="flex gap-2">
            <Button 
              onClick={() => handleParseCSV()}
              disabled={!csvData.trim()}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview Data
            </Button>
            {showPreview && (
              <Button 
                onClick={handleImport}
                disabled={importing || parsedStudents.length === 0}
                className="flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                {importing ? 'Importing...' : `Import ${parsedStudents.length} Students`}
              </Button>
            )}
          </div>

          {/* Progress */}
          {importing && (
            <div className="space-y-2">
              <Progress value={50} className="w-full" />
              <p className="text-sm text-muted-foreground">Importing students...</p>
            </div>
          )}

          {/* Status Messages */}
          {importError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{importError}</AlertDescription>
            </Alert>
          )}

          {importSuccess && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Students imported successfully! They can now log in with their College ID and password.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Preview Section */}
      {showPreview && parsedStudents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Preview Students ({parsedStudents.length})
            </CardTitle>
            <CardDescription>
              Review the parsed student data before importing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">College ID</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Branch</th>
                    <th className="text-left p-2">Year</th>
                    <th className="text-left p-2">CGPA</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedStudents.slice(0, 20).map((student, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{student.name}</td>
                      <td className="p-2 font-mono">{student.collegeId}</td>
                      <td className="p-2">{student.email}</td>
                      <td className="p-2">{student.branch}</td>
                      <td className="p-2">{student.year}</td>
                      <td className="p-2">{student.profile?.academic?.cgpa || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedStudents.length > 20 && (
                <p className="text-sm text-muted-foreground p-2">
                  ... and {parsedStudents.length - 20} more students
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Students */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Current Students ({existingStudents.length})
          </CardTitle>
          <CardDescription>
            Students currently in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {existingStudents.length === 0 ? (
            <p className="text-muted-foreground">No students found. Import some data to get started!</p>
          ) : (
            <div className="max-h-64 overflow-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">College ID</th>
                    <th className="text-left p-2">Role</th>
                    <th className="text-left p-2">Branch</th>
                    <th className="text-left p-2">Year</th>
                  </tr>
                </thead>
                <tbody>
                  {existingStudents.slice(0, 10).map((student, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{student.name}</td>
                      <td className="p-2 font-mono">{student.collegeId}</td>
                      <td className="p-2 capitalize">{student.role}</td>
                      <td className="p-2">{student.branch}</td>
                      <td className="p-2">{student.year}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {existingStudents.length > 10 && (
                <p className="text-sm text-muted-foreground p-2">
                  ... and {existingStudents.length - 10} more students
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* CSV Format Guide */}
      <Card>
        <CardHeader>
          <CardTitle>CSV Format Guide</CardTitle>
          <CardDescription>
            Required columns for student data import
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Required Fields:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <code>name</code> - Full name</li>
                <li>• <code>collegeId</code> - College ID (e.g., 22B81A05C3)</li>
                <li>• <code>email</code> - Email address</li>
                <li>• <code>year</code> - Academic year</li>
                <li>• <code>section</code> - Section (A, B, C, etc.)</li>
                <li>• <code>branch</code> - Branch code</li>
                <li>• <code>rollNumber</code> - Roll number</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Optional Fields:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <code>phone</code> - Phone number</li>
                <li>• <code>dateOfBirth</code> - Date of birth</li>
                <li>• <code>address</code> - Address</li>
                <li>• <code>cgpa</code> - Current CGPA</li>
                <li>• <code>semester</code> - Current semester</li>
                <li>• <code>bio</code> - Student bio</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatasetImport;
