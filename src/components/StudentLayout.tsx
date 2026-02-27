import StudentSidebar from "@/components/StudentSidebar";
import StudentTopbar from "@/components/StudentTopbar";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";

interface StudentLayoutProps {
    children: React.ReactNode;
}

const StudentLayout = ({ children }: StudentLayoutProps) => {
    const { userData } = useAuth();
    const studentId = userData?.collegeId || "";

    return (
        <DashboardLayout
            topbar={<StudentTopbar studentId={studentId} />}
            sidebar={({ closeSidebar }) => <StudentSidebar onNavigate={closeSidebar} />}
        >
            {children}
        </DashboardLayout>
    );
};

export default StudentLayout;
