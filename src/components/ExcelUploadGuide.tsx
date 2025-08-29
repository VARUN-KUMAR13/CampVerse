import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileSpreadsheet, 
  Upload, 
  Eye, 
  Users, 
  CheckCircle,
  ArrowRight,
  Database,
  UserCheck
} from 'lucide-react';

const ExcelUploadGuide = () => {
  return (
    <div className="space-y-6">
      <Card className="border-2 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <FileSpreadsheet className="w-5 h-5" />
            Excel File Upload Guide
          </CardTitle>
          <CardDescription className="text-green-600 dark:text-green-400">
            Step-by-step instructions to upload your Excel data and display names based on roll numbers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex items-start gap-4">
              <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Prepare Your Excel File</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Ensure your Excel file has at least two columns:
                </p>
                <div className="bg-background p-3 rounded border mt-2 grid grid-cols-2 gap-4 text-sm font-mono">
                  <div className="font-bold">Roll Number</div>
                  <div className="font-bold">Name</div>
                  <div>22B81A05C3</div>
                  <div>John Doe</div>
                  <div>22B81A05C4</div>
                  <div>Jane Smith</div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline">✅ Column names are flexible</Badge>
                  <Badge variant="outline">✅ Case insensitive</Badge>
                  <Badge variant="outline">✅ .xlsx, .xls, .csv supported</Badge>
                </div>
              </div>
            </div>

            <ArrowRight className="text-muted-foreground mx-auto" />

            {/* Step 2 */}
            <div className="flex items-start gap-4">
              <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Upload to Firebase</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Go to the "Dataset Import" tab and upload your Excel file:
                </p>
                <div className="bg-background p-3 rounded border mt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Upload className="w-4 h-4 text-blue-500" />
                    <span>Click "Choose File" and select your Excel file</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm mt-2">
                    <Eye className="w-4 h-4 text-green-500" />
                    <span>Click "Preview Data" to verify the parsing</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm mt-2">
                    <Database className="w-4 h-4 text-purple-500" />
                    <span>Click "Import X Students" to save to Firebase</span>
                  </div>
                </div>
              </div>
            </div>

            <ArrowRight className="text-muted-foreground mx-auto" />

            {/* Step 3 */}
            <div className="flex items-start gap-4">
              <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Verify Name Display</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  After successful import, names will automatically display based on roll numbers:
                </p>
                <div className="bg-background p-3 rounded border mt-2 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <UserCheck className="w-4 h-4 text-green-500" />
                    <span>When students login with their roll number, their name will appear in the dashboard</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span>Names will display in the top navigation bar</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-purple-500" />
                    <span>System automatically matches roll numbers to names from your dataset</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">📌 Important Notes:</h4>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• Students can login using their roll number as both username and password initially</li>
                <li>• The system will automatically generate email addresses if not provided</li>
                <li>• Names will appear immediately after successful import</li>
                <li>• If a name isn't found, the system will display the roll number as fallback</li>
                <li>• You can re-import data to update or add new students</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExcelUploadGuide;
