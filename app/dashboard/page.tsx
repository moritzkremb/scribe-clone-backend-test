"use client";

import { useState } from "react";
import { Search, FileText, Settings, Users, BarChart3, Menu, LogOut } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { AddDocumentDialog } from "./components/AddDocumentDialog";
import { useDocuments } from "@/lib/hooks/useDocuments";
import { useAuth } from "@/app/providers";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { icon: FileText, label: "Documents", active: true },
  { icon: Users, label: "Team" },
  { icon: BarChart3, label: "Analytics" },
  { icon: Settings, label: "Settings" },
];

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { documents, loading } = useDocuments();
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const router = useRouter();

  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const Sidebar = () => (
    <div className="h-full flex flex-col gap-8 p-6">
      <div className="flex items-center gap-2 px-2">
        <FileText className="h-6 w-6" />
        <span className="font-semibold text-lg">Dashboard</span>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors ${
              item.active
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 border-r">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" className="ml-2 mt-2">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="border-b p-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <AddDocumentDialog />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <img
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.email || 'User'}`}
                      alt="User avatar"
                      className="rounded-full"
                    />
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-semibold mb-6">Recent Documents</h1>
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((n) => (
                  <Card key={n} className="p-4">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                      <div className="h-3 bg-muted rounded w-1/4"></div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredDocuments.map((doc) => (
                  <Card key={doc.id} className="p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{doc.title}</h3>
                        <p className="text-sm text-muted-foreground">{doc.document_type}</p>
                      </div>
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Updated {format(new Date(doc.updated_at), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="mt-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        doc.status === "published" 
                          ? "bg-green-100 text-green-800"
                          : doc.status === "draft"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}