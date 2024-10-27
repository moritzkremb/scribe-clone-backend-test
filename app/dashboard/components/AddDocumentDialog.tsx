"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useDocuments } from "@/lib/hooks/useDocuments";
import { useAuth } from "@/app/providers";
import { toast } from "sonner";

const documentTypes = [
  { value: "document", label: "Document" },
  { value: "spreadsheet", label: "Spreadsheet" },
  { value: "presentation", label: "Presentation" },
];

export function AddDocumentDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState(documentTypes[0].value);
  const [isLoading, setIsLoading] = useState(false);
  const { createDocument } = useDocuments();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to create documents");
      return;
    }
    
    if (!title.trim()) {
      toast.error("Please enter a document title");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await createDocument(title.trim(), type);
      toast.success("Document created successfully");
      setOpen(false);
      setTitle("");
      setType(documentTypes[0].value);
    } catch (error) {
      console.error("Create document error:", error);
      toast.error("Failed to create document");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Document
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Document</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter document title"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="type" className="text-sm font-medium">
              Document Type
            </label>
            <Select value={type} onValueChange={setType} required>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((docType) => (
                  <SelectItem key={docType.value} value={docType.value}>
                    {docType.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Document"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}