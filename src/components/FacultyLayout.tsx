import FacultySidebar from "@/components/FacultySidebar";
import FacultyTopbar from "@/components/FacultyTopbar";
import DashboardLayout from "@/components/DashboardLayout";

interface FacultyLayoutProps {
    children: React.ReactNode;
}

const FacultyLayout = ({ children }: FacultyLayoutProps) => {
    return (
        <DashboardLayout
            topbar={({ toggleSidebar }) => <FacultyTopbar onMenuClick={toggleSidebar} />}
            sidebar={({ closeSidebar }) => <FacultySidebar onNavigate={closeSidebar} />}
        >
            {children}
        </DashboardLayout>
    );
};

export default FacultyLayout;
